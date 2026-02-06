import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import products from '../data/products.json';

export default function ProductsSection() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState({});
  const [items, setItems] = useState(products);
  const [isLoading, setIsLoading] = useState(true);
  const cardsRef = useRef([]);
  const navigate = useNavigate();

  // Cargar productos desde Firestore con listener en tiempo real
  useEffect(() => {
    const productsRef = collection(db, 'products');
    
    const unsubscribe = onSnapshot(productsRef, (querySnapshot) => {
      try {
        const productsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          firebaseId: doc.id
        }));
        
        if (productsData.length === 0) {
          // Si no hay productos en Firestore, usar los del JSON
          setItems(products);
          console.log('[ProductsSection] Usando JSON local, sin documentos en Firestore');
        } else {
          // Ordenar por ID para mantener consistencia
          setItems(productsData.sort((a, b) => a.id - b.id));
        }
        console.log('[ProductsSection] items cargados:', productsData.length || products.length);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setItems(products);
        console.log('[ProductsSection] Fallback a JSON por error de carga');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Error setting up listener:', error);
      setItems(products);
      console.log('[ProductsSection] Fallback a JSON por error en listener');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = cardsRef.current.indexOf(entry.target);
          setVisibleProducts((prev) => ({
            ...prev,
            [index]: true,
          }));
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  return (
    <>
      <section id="productos" className="products-section">
        <h2 className="section-title">
          <span>Productos Destacados</span>
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="product-grid">
            {items.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                ref={(el) => (cardsRef.current[index] = el)}
              >
                <ProductCard
                  product={product}
                  onDetailsClick={setSelectedProduct}
                  isVisible={visibleProducts[index]}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && items.length > 5 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '3rem' 
          }}>
            <button
              onClick={() => navigate('/productos')}
              style={{
                background: '#429E52',
                color: '#fff',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2e7d32';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#429E52';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              Ver más productos →
            </button>
          </div>
        )}
      </section>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
