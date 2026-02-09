import { useState, useEffect } from 'react';
import './PopupHintBanner.css';

const PopupHintBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya vio el banner
    const hasSeenBanner = localStorage.getItem('popupHintDismissed');
    
    if (!hasSeenBanner) {
      // Mostrar banner después de 2 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('popupHintDismissed', 'true');
  };

  const handleAllow = () => {
    // Test if popups are enabled
    const testWindow = window.open('', '_blank', 'width=1,height=1');
    
    if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
      // Popup blocked - show instructions
      alert(
        'Las ventanas emergentes están bloqueadas.\n\n' +
        'Para habilitarlas:\n' +
        '1. Haz clic en el ícono 🔒 o ⓘ en la barra de direcciones\n' +
        '2. Busca "Ventanas emergentes"\n' +
        '3. Selecciona "Permitir"\n' +
        '4. Recarga la página'
      );
    } else {
      // Popup allowed
      testWindow.close();
      alert('✅ ¡Las ventanas emergentes ya están habilitadas!');
      handleDismiss();
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="popup-hint-banner">
      <div className="popup-hint-content">
        <span className="popup-hint-icon">💡</span>
        <div className="popup-hint-text">
          <strong>Sugerencia:</strong> Habilita las ventanas emergentes para una mejor experiencia al realizar pedidos
        </div>
        <div className="popup-hint-actions">
          <button 
            className="popup-hint-btn-allow"
            onClick={handleAllow}
          >
            Verificar
          </button>
          <button 
            className="popup-hint-btn-dismiss"
            onClick={handleDismiss}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupHintBanner;
