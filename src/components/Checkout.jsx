import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { getApiUrl, API_CONFIG } from '../config/api';
import Toast from './Toast';
import './Checkout.css';

export default function Checkout({ onBack }) {
  const { cartItems, getTotal, clearCart, setIsCartOpen } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('wompi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showWhatsAppWarning, setShowWhatsAppWarning] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState('');

  const confirmPaymentInBackend = async (orderData, reference) => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CONFIRM_PAYMENT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference,
        orderData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo confirmar el pago');
    }

    return data;
  };

  // Detectar retorno de Wompi y confirmar envío
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const reference = urlParams.get('reference');

    if (paymentSuccess === 'true') {
      console.log('✅ Pago exitoso detectado');

      const savedOrderData = localStorage.getItem('pendingOrder');

      if (savedOrderData) {
        try {
          const orderData = JSON.parse(savedOrderData);

          (async () => {
            try {
              const result = await confirmPaymentInBackend(orderData, reference || orderData.reference);
              const message = result.emailSent
                ? 'Pago confirmado. Notificación enviada correctamente.'
                : 'Pago confirmado. Notificación registrada, envío pendiente.';
              setToastMessage(message);

              sendOrderToWhatsApp(orderData);
              localStorage.setItem('orderConfirmed', JSON.stringify({
                reference: reference || orderData.reference,
                timestamp: new Date().toISOString(),
                message,
              }));
            } catch (error) {
              console.error('Error confirmando pago:', error);
              setToastMessage('Pago confirmado, pero no se pudo notificar. Intenta de nuevo.');
            } finally {
              localStorage.removeItem('pendingOrder');
            }
          })();
        } catch (error) {
          console.error('Error procesando orden:', error);
        }
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'orderConfirmed' && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          if (payload?.message) {
            setToastMessage(payload.message);
          }
        } catch (error) {
          console.error('Error leyendo confirmación:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setLogoFile(null);
      setLogoError('');
      return;
    }

    const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
    const maxSizeBytes = 5 * 1024 * 1024;

    if (!isValidType) {
      setLogoFile(null);
      setLogoError('Solo se permite imagen o PDF.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setLogoFile(null);
      setLogoError('El archivo supera 5MB.');
      return;
    }

    setLogoError('');
    setLogoFile(file);
  };

  const uploadLogo = async (reference) => {
    const formData = new FormData();
    formData.append('reference', reference);
    formData.append('logo', logoFile);

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_LOGO), {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo subir el logo');
    }

    return data;
  };

  const generateOrderSummary = (orderData = null) => {
    const data = orderData || {
      items: cartItems,
      customer: formData,
      total: getTotal()
    };

    const items = data.items
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
      )
      .join('\n');

    return `
*CONFIRMACIÓN DE COMPRA* ✅

*PRODUCTOS:*
${items}

━━━━━━━━━━━━━━━━
*TOTAL PAGADO: $${data.total.toFixed(2)}* 💳
━━━━━━━━━━━━━━━━

*DATOS DEL CLIENTE:*
👤 ${data.customer.fullName}
📧 ${data.customer.email}
📱 ${data.customer.phone}
📍 ${data.customer.address}, ${data.customer.city}
${data.customer.notes ? `📝 Notas: ${data.customer.notes}` : ''}

*Pago realizado con Wompi*
Fecha: ${new Date().toLocaleString('es-CO')}
    `.trim();
  };

  const sendOrderToWhatsApp = (orderData) => {
    const summary = generateOrderSummary(orderData);
    const encodedMessage = encodeURIComponent(summary);
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '573015555555';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    console.log('📱 Enviando pedido por WhatsApp...');
    setToastMessage('¡Pago exitoso! Enviando detalles por WhatsApp...');
    
    // Pequeño retraso para que el usuario vea la notificación
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1500);
  };

  const handleWhatsAppCheckout = () => {
    if (!formData.fullName || !formData.phone) {
      alert('Por favor completa nombre y teléfono');
      return;
    }

    const summary = generateOrderSummary();
    const encodedMessage = encodeURIComponent(summary);
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '573015555555';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    clearCart();
    setIsCartOpen(false);
  };

  const handleWompiCheckout = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!logoFile) {
      alert('Por favor adjunta un logo (imagen o PDF)');
      return;
    }

    const wompiWindow = window.open('', '_blank', 'noopener,noreferrer');

    setIsProcessing(true);

    try {
      const reference = `ORDER-${Date.now()}`;
      const total = Math.round(getTotal() * 100); // En centavos

      console.log('🔄 Iniciando pago con Wompi...');

      // Guardar datos del pedido para enviar por WhatsApp después del pago
      const orderData = {
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          notes: formData.notes
        },
        total: getTotal(),
        reference,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      console.log('💾 Datos del pedido guardados para WhatsApp');

      console.log('⬆️ Subiendo logo...');
      await uploadLogo(reference);
      console.log('✅ Logo subido');

      // Llamar al backend para crear la transacción
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_in_cents: total,
          reference,
          customer_email: formData.email,
          customer_data: {
            phone_number: formData.phone,
            full_name: formData.fullName,
          },
          metadata: {
            address: formData.address,
            city: formData.city,
            notes: formData.notes,
            items: cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el link de pago');
      }

      console.log('✅ Link generado:', data);

      // Abrir checkout de Wompi en una pestaña nueva
      if (data.checkout_url) {
        console.log('🔗 Abriendo Wompi en pestaña nueva...');
        if (wompiWindow) {
          wompiWindow.location.href = data.checkout_url;
          setToastMessage('Se abrió Wompi en una nueva pestaña. Completa el pago y regresa aquí.');
        } else {
          const confirmRedirect = window.confirm('El navegador bloqueó la pestaña nueva. ¿Deseas abrir el pago en esta pestaña?');
          if (confirmRedirect) {
            window.location.href = data.checkout_url;
            return;
          }
          alert('Habilita los pop-ups para abrir el pago en una nueva pestaña.');
        }
        setIsProcessing(false);
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      alert(`Error: ${error.message}`);
      localStorage.removeItem('pendingOrder');
      wompiWindow.close();
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === 'whatsapp') {
      setShowWhatsAppWarning(true);
    } else if (paymentMethod === 'wompi') {
      handleWompiCheckout();
    }
  };

  const handleConfirmWhatsApp = () => {
    setShowWhatsAppWarning(false);
    handleWhatsAppCheckout();
  };

  return (
    <div className="checkout-container">
      <button className="back-btn" onClick={onBack}>
        ← Volver al Carrito
      </button>

      <div className="checkout-content">
        <div className="checkout-form">
          <h2>Información de Compra</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Nombre Completo *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+57 300 0000000"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Calle y número"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Tu ciudad"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas Adicionales</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Datos necesarios para la entrega, redes sociales, direccion, telefonos, etc."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="logoFile">Logo (imagen o PDF) *</label>
              <input
                type="file"
                id="logoFile"
                name="logoFile"
                accept="image/*,application/pdf"
                onChange={handleLogoChange}
                required={paymentMethod === 'wompi'}
              />
              {logoError && <p style={{ color: '#d9534f', marginTop: '8px' }}>{logoError}</p>}
            </div>

            <div className="form-group">
              <label>Método de Pago *</label>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    value="wompi"
                    checked={paymentMethod === 'wompi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>💳 Wompi (Pasarela de pago)</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    value="whatsapp"
                    checked={paymentMethod === 'whatsapp'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>💬 WhatsApp (Gestionar por chat)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={isProcessing}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {isProcessing ? 'Procesando...' : 'Completar Compra'}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h3>Resumen del Pedido</h3>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div>
                  <p className="item-name">{item.name}</p>
                  <p className="item-qty">Cantidad: {item.quantity}</p>
                </div>
                <p className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Envío:</span>
              <span>Consultar</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <p className="payment-info">
            {paymentMethod === 'wompi'
              ? '🔒 Pago seguro con Wompi. Tus datos están protegidos.'
              : '📱 Se abrirá WhatsApp para confirmar tu pedido.'}
          </p>
        </div>
      </div>
      
      {toastMessage && <Toast message={toastMessage} duration={3000} />}
      
      {showWhatsAppWarning && (
        <div className="modal-overlay" onClick={() => setShowWhatsAppWarning(false)}>
          <div className="whatsapp-warning-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowWhatsAppWarning(false)}>×</button>
            <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>⚠️ Importante</h3>
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
              Si seleccionas esta opción, <strong>debes enviar el comprobante de compra</strong> a través de WhatsApp.
            </p>
            <p style={{ marginBottom: '20px', fontWeight: '600' }}>
              Puedes realizar tu pago a través de cualquiera de estos métodos:
            </p>
            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
              <img 
                src="/pagos.png" 
                alt="Métodos de pago" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowWhatsAppWarning(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn" 
                onClick={handleConfirmWhatsApp}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📲</span> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
