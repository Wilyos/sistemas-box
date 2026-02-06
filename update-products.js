// Script para actualizar productos en Firestore con imágenes y precios
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyDYfS1wQQcZJhxUCCBE3C18J_WlgwfT4x0",
  authDomain: "empaque-y-embalaje.firebaseapp.com",
  projectId: "empaque-y-embalaje",
  storageBucket: "empaque-y-embalaje.firebasestorage.app",
  messagingSenderId: "1039722821343",
  appId: "1:1039722821343:web:8c4fbf59b8eb5c0870f2ec"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateProducts() {
  try {
    console.log('📦 Cargando productos desde JSON...');
    const productsJson = JSON.parse(readFileSync('./src/data/products.json', 'utf-8'));
    
    console.log('🔍 Obteniendo productos de Firestore...');
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    console.log(`📊 Encontrados ${querySnapshot.size} productos en Firestore`);
    
    for (const doc of querySnapshot.docs) {
      const firestoreProduct = doc.data();
      const jsonProduct = productsJson.find(p => p.id === firestoreProduct.id);
      
      if (jsonProduct) {
        console.log(`\n🔄 Actualizando: ${jsonProduct.name} (ID: ${jsonProduct.id})`);
        
        await updateDoc(doc.ref, {
          images: jsonProduct.images || [],
          basePriceOneColor: Number(jsonProduct.basePriceOneColor || 0),
          priceColor: Number(jsonProduct.priceColor || 0),
          paperTypes: jsonProduct.paperTypes || [],
          description: jsonProduct.description,
          dimensions: jsonProduct.dimensions,
          material: jsonProduct.material
        });
        
        console.log(`✅ Actualizado correctamente`);
      } else {
        console.log(`⚠️ Producto ID ${firestoreProduct.id} no encontrado en JSON`);
      }
    }
    
    console.log('\n✅ Actualización completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProducts();
