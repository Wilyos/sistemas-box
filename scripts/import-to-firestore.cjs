/*
CommonJS version del script para importar `src/data/products.json` a Firestore.
Uso (PowerShell):
$env:GOOGLE_APPLICATION_CREDENTIALS="D:\dev\sistemasNfc\sistemas-box\sistemas-box-firebase-adminsdk-fbsvc-fb4e6bc84b.json"
node scripts/import-to-firestore.cjs
*/

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at', serviceAccountPath);
  console.error('Set env var GOOGLE_APPLICATION_CREDENTIALS or place firebase-service-account.json in project root.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

async function importProducts() {
  const dataPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  if (!fs.existsSync(dataPath)) {
    console.error('products.json not found at', dataPath);
    process.exit(1);
  }
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Found ${items.length} products. Importing...`);

  const batchSize = 500;
  for (let i = 0; i < items.length; i += batchSize) {
    const slice = items.slice(i, i + batchSize);
    const batch = db.batch();
    slice.forEach(item => {
      const docRef = db.collection('products').doc(String(item.id));
      const sanitized = JSON.parse(JSON.stringify(item));
      batch.set(docRef, sanitized);
    });
    await batch.commit();
    console.log(`Committed batch ${Math.floor(i / batchSize) + 1}`);
  }

  console.log('Import completed.');
}

importProducts().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
