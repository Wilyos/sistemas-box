// Script para eliminar el producto 5 de Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

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

async function deleteProduct5() {
  try {
    console.log('🔍 Buscando producto con id=5...');
    
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('id', '==', 5));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('⚠️ No se encontró el producto con id=5');
      return;
    }
    
    console.log(`📦 Se encontraron ${querySnapshot.size} documento(s) con id=5`);
    
    for (const doc of querySnapshot.docs) {
      console.log(`🗑️ Eliminando documento: ${doc.id} - ${doc.data().name}`);
      await deleteDoc(doc.ref);
      console.log('✅ Documento eliminado exitosamente');
    }
    
    console.log('✅ Operación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteProduct5();
