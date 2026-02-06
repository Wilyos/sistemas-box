import { db } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import products from '../data/products.json';

/**
 * Inicializa los productos en Firestore si no existen
 * Espera a que Firebase esté listo antes de ejecutar
 */
export async function initializeProducts() {
  try {
    // Agregar un pequeño delay para asegurar que Firebase esté listo
    await new Promise(resolve => setTimeout(resolve, 500));

    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);

    // Si ya hay productos, no hacer nada
    if (querySnapshot.size > 0) {
      console.log(`✅ Ya existen ${querySnapshot.size} productos en Firestore`);
      return;
    }

    // Si no hay productos, agregar los por defecto
    console.log('📦 Inicializando productos en Firestore...');
    
    for (const product of products) {
      await addDoc(productsRef, {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        material: product.material,
        dimensions: product.dimensions,
        stock: Number(product.stock),
        icon: product.icon,
        color: product.color,
        images: product.images || [],
        basePriceOneColor: Number(product.basePriceOneColor || product.price || 0),
        priceColor: Number(product.priceColor || product.price || 0),
        paperTypes: product.paperTypes || [],
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Agregado: ${product.name}`);
    }
    console.log(`✅ ${products.length} productos agregados exitosamente`);
  } catch (error) {
    console.error('❌ Error inicializando productos:', error);
    console.error('Detalle del error:', error.message);
  }
}
