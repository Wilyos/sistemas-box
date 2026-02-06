import { useEffect, useState, useRef } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import products from '../data/products.json';
import Header from './Header';
import Footer from './Footer';
import Cart from './Cart';
import './ProductsPage.css';

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState({});
  const [items, setItems] = useState(products);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
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
          console.log('[ProductsPage] Usando JSON local, sin documentos en Firestore');
        } else {
          // Ordenar por ID para mantener consistencia
          setItems(productsData.sort((a, b) => a.id - b.id));
        }
        console.log('[ProductsPage] items cargados:', productsData.length || products.length);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setItems(products);
        console.log('[ProductsPage] Fallback a JSON por error de carga');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Error setting up listener:', error);
      setItems(products);
      console.log('[ProductsPage] Fallback a JSON por error en listener');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Detectar scroll para mostrar/ocultar botón
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
  }, [items]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Header />
      <Cart />
      
      <section id="productos" className="products-section products-page">
        <div className="products-page-header">
          <h2 className="section-title">
            <span>Todos Nuestros Productos</span>
          </h2>
          <button
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Volver al inicio
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((product, index) => (
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

        {!isLoading && items.length === 0 && (
          <div className="empty-state">
            <p>No hay productos disponibles en este momento.</p>
          </div>
        )}
      </section>

      <Footer />

      <button 
        className={`scroll-to-top ${!showScrollTop ? 'hidden' : ''}`}
        onClick={scrollToTop}
        aria-label="Volver arriba"
      >
        ↑
      </button>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
