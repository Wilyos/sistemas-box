import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useState, useEffect } from 'react';
import { getApiUrl, API_CONFIG } from './config/api';
import Cart from './components/Cart';
import Hero from './components/Hero';
import ProductsSection from './components/ProductsSection';
import ProductsPage from './components/ProductsPage';
import ServiceSection from './components/ServiceSection';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';
import PopupHintBanner from './components/PopupHintBanner';
import FloatingCartButton from './components/FloatingCartButton';
import './styles/index.css';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    // Detectar cambios en el hash
    const handleHashChange = () => {
      setShowLogin(window.location.hash === '#admin');
    };

    handleHashChange(); // Verificar hash al montar
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Detectar retorno de Wompi con pago exitoso
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const reference = urlParams.get('reference');

    if (paymentSuccess === 'true' && reference) {
      console.log('✅ Pago exitoso detectado:', reference);
      
      // Recuperar datos de la orden guardados antes del pago
      const pendingOrder = localStorage.getItem('pendingOrder');
      
      if (pendingOrder) {
        const orderData = JSON.parse(pendingOrder);
        console.log('📦 Enviando confirmación al backend...');
        
        // Enviar confirmación al backend
        fetch(getApiUrl(API_CONFIG.ENDPOINTS.CONFIRM_PAYMENT), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, orderData })
        })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Confirmación enviada:', data);
          // Limpiar datos pendientes
          localStorage.removeItem('pendingOrder');
          const message = data.emailSent
            ? 'Pago confirmado. Correo enviado correctamente.'
            : 'Pago confirmado. El correo no pudo enviarse.';
          setToastMessage(message);
          setConfirmation({
            reference,
            emailSent: Boolean(data.emailSent),
            logoAttached: Boolean(data.logoAttached)
          });
        })
        .catch(err => {
          console.error('❌ Error enviando confirmación:', err);
          setToastMessage('Pago confirmado, pero hubo un error al notificar.');
          setConfirmation({ reference, error: true });
        });
      } else {
        setToastMessage('Pago confirmado, pero no se encontraron datos de la orden.');
        setConfirmation({ reference, error: true });
      }

      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si el usuario es admin, mostrar panel de admin
  if (user?.role === 'admin') {
    return <AdminPanel />;
  }

  // Si no hay usuario, mostrar login si intenta acceder a /admin
  if (showLogin) {
    return <Login />;
  }

  // Tienda normal
  return (
    <Routes>
      <Route path="/" element={
        <>
          <Cart />
          <FloatingCartButton />
          <Hero />
          <ProductsSection />
          <ServiceSection />
          <Footer />

          {toastMessage && <Toast message={toastMessage} duration={4000} />}

          {/* Banner informativo de popups */}
          <PopupHintBanner />

          {confirmation && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
                padding: '20px'
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  maxWidth: '520px',
                  width: '100%',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {confirmation.error ? '⚠️ Pago recibido' : '✅ Compra confirmada'}
                </h3>
                <p><strong>Referencia:</strong> {confirmation.reference}</p>
                {!confirmation.error && (
                  <>
                    <p>
                      <strong>Correo:</strong> {confirmation.emailSent ? 'Enviado' : 'No enviado'}
                    </p>
                    <p>
                      <strong>Logo:</strong> {confirmation.logoAttached ? 'Adjunto al correo' : 'No adjunto'}
                    </p>
                  </>
                )}
                {confirmation.error && (
                  <p>Si el correo no llegó, revisa la configuración de EMAIL y vuelve a intentar.</p>
                )}
                <button
                  onClick={() => setConfirmation(null)}
                  style={{
                    marginTop: '12px',
                    background: '#F26E22',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
          
          {/* Link para acceder a admin */}
          <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 100 }}>
            <button 
              onClick={() => window.location.hash = '#admin'}
              style={{ 
                fontSize: '24px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '10px',
                opacity: 0.6,
                transition: 'opacity 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.6'}
              title="Acceso Admin"
            >
              🔐
            </button>
          </div>
        </>
      } />
      <Route path="/productos" element={<ProductsPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
