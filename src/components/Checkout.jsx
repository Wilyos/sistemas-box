import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import Toast from './Toast';
import PopupPermissionModal from './PopupPermissionModal';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPopupPermissionModal, setShowPopupPermissionModal] = useState(false);
  const [showWhatsAppWarning, setShowWhatsAppWarning] = useState(false);

  // Función mejorada para abrir popups con mejor detección
  const openPopupWithFallback = (url, windowName = '_blank', features = 'noopener,noreferrer') => {
    const newWindow = window.open(url, windowName, features);
    
    // Verificar si el popup fue bloqueado
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Popup bloqueado - mostrar modal de instrucciones
      setShowPopupPermissionModal(true);
      
      // Ofrecer alternativa
      const confirmRedirect = window.confirm(
        'Las ventanas emergentes están bloqueadas en tu navegador.\n\n' +
        '¿Deseas abrir el enlace en esta misma pestaña?\n\n' +
        '(Se recomienda habilitar popups para una mejor experiencia)'
      );
      
      if (confirmRedirect) {
        window.location.href = url;
      }
      
      return null;
    }
    
    // Popup abierto exitosamente
    return newWindow;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getInkLabel = (inkType) => (inkType === 'oneColor' ? 'Una tinta' : 'Varias tintas');

  const generateOrderSummary = () => {
    const items = cartItems
      .map((item, index) => {
        const inkLabel = getInkLabel(item.inkType);
        const paperLabel = item.selectedPaperLabel || item.paperType || 'No especificado';
        const subtotal = (item.price * item.quantity).toFixed(2);

        return [
          `${index + 1}. Empaque: ${item.name}`,
          `   - Tipo de tinta: ${inkLabel}`,
          `   - Papel: ${paperLabel}`,
          `   - Cantidad: ${item.quantity.toLocaleString()}`,
          `   - Valor: $${subtotal}`,
        ].join('\n');
      })
      .join('\n\n');

    return [
      `Hola, mi nombre es ${formData.fullName}.`,
      'Estos son mis datos y deseo adquirir los siguientes empaques:',
      '',
      '*MIS DATOS*',
      `- Nombre: ${formData.fullName}`,
      `- Teléfono: ${formData.phone}`,
      `- Correo: ${formData.email || 'No suministrado'}`,
      `- Dirección: ${formData.address || 'No suministrada'}`,
      `- Ciudad: ${formData.city || 'No suministrada'}`,
      formData.notes ? `- Observaciones: ${formData.notes}` : '- Observaciones: Ninguna',
      '',
      '*DETALLE DEL CARRITO*',
      items,
      '',
      `*TOTAL ESTIMADO: $${getTotal().toFixed(2)}*`,
      `Fecha: ${new Date().toLocaleString('es-CO')}`,
    ].join('\n');
  };

  const sendOrderToWhatsApp = () => {
    const summary = generateOrderSummary();
    const encodedMessage = encodeURIComponent(summary);
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '573015555555';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    console.log('📱 Enviando pedido por WhatsApp...');
    setToastMessage('¡Pago exitoso! Abriendo WhatsApp...');
    
    // Abrir WhatsApp inmediatamente (sin setTimeout para evitar bloqueo)
    return openPopupWithFallback(whatsappUrl);
  };

  const handleWhatsAppCheckout = async () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      alert('Por favor completa nombre, teléfono, dirección y ciudad');
      return;
    }

    setIsProcessing(true);
    const opened = sendOrderToWhatsApp();
    
    // Solo limpiar carrito si se abrió exitosamente o el usuario eligió una alternativa
    if (opened !== null) {
      setTimeout(() => {
        clearCart();
        setIsCartOpen(false);
      }, 1000);
    }
    setIsProcessing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowWhatsAppWarning(true);
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
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
              <label>Canal de Confirmación</label>
              <p className="payment-info" style={{ marginTop: '8px' }}>
                📱 Tu pedido se enviará por WhatsApp con todos los detalles del carrito.
              </p>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={isProcessing}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {isProcessing ? 'Preparando mensaje...' : 'Enviar Pedido por WhatsApp'}
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
                  <p className="item-qty">Tinta: {getInkLabel(item.inkType)}</p>
                  <p className="item-qty">Papel: {item.selectedPaperLabel || item.paperType || 'No especificado'}</p>
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

          <p className="payment-info">📱 Se abrirá WhatsApp con el resumen completo para confirmar tu pedido.</p>
        </div>
      </div>
      
      {toastMessage && <Toast message={toastMessage} duration={3000} />}
      
      <PopupPermissionModal 
        isOpen={showPopupPermissionModal}
        onClose={() => setShowPopupPermissionModal(false)}
        onTestPopup={(allowed) => {
          if (allowed) {
            setToastMessage('✅ ¡Popups habilitados correctamente!');
          }
        }}
      />
      
      {showWhatsAppWarning && (
        <div className="modal-overlay" onClick={() => setShowWhatsAppWarning(false)}>
          <div className="whatsapp-warning-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowWhatsAppWarning(false)}>×</button>
            <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>⚠️ Importante</h3>
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
              Vas a enviar tu pedido por WhatsApp con tus datos y el detalle completo del carrito.
            </p>
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
