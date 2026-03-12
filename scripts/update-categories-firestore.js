/*
Script para actualizar el campo 'category' en todos los productos de Firestore
Uso (PowerShell):
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json"
node scripts/update-categories-firestore.js
*/

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', 'sistemas-box-firebase-adminsdk-fbsvc-fb4e6bc84b.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found at', serviceAccountPath);
  console.error('Set env var GOOGLE_APPLICATION_CREDENTIALS or place service account JSON in project root.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

async function updateCategories() {
  // Leer products.json
  const dataPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ products.json not found at', dataPath);
    process.exit(1);
  }
  
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📦 Found ${items.length} products in JSON`);
  
  // Crear un mapa de id -> category
  const categoryMap = {};
  items.forEach(item => {
    categoryMap[item.id] = item.category;
  });
  
  console.log('\n🔍 Category map created:', categoryMap);
  
  // Obtener todos los documentos de Firestore
  const snapshot = await db.collection('products').get();
  console.log(`\n📊 Found ${snapshot.size} documents in Firestore`);
  
  if (snapshot.empty) {
    console.log('⚠️  No products in Firestore. Run import-to-firestore.js first.');
    return;
  }
  
  // Actualizar en lotes
  const batchSize = 500;
  let updateCount = 0;
  let batch = db.batch();
  let batchCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const productId = data.id || parseInt(doc.id);
    const category = categoryMap[productId];
    
    if (category) {
      batch.update(doc.ref, { category });
      batchCount++;
      updateCount++;
      
      console.log(`✅ Queued update: Product ${productId} (${data.name}) -> category: ${category}`);
      
      // Commit batch si alcanzamos el límite
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`\n📤 Committed batch of ${batchCount} updates`);
        batch = db.batch();
        batchCount = 0;
      }
    } else {
      console.log(`⚠️  No category found for product ${productId} (${data.name})`);
    }
  }
  
  // Commit último batch
  if (batchCount > 0) {
    await batch.commit();
    console.log(`\n📤 Committed final batch of ${batchCount} updates`);
  }
  
  console.log(`\n✅ Update completed! ${updateCount} products updated with categories.`);
}

updateCategories()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Update failed:', err);
    process.exit(1);
  });
