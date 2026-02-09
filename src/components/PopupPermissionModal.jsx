import { useState, useEffect } from 'react';
import './PopupPermissionModal.css';

const PopupPermissionModal = ({ isOpen, onClose, onTestPopup }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleTestPopup = () => {
    const testWindow = window.open('', '_blank', 'width=1,height=1');
    
    if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
      // Popup bloqueado
      setShowInstructions(true);
      if (onTestPopup) onTestPopup(false);
    } else {
      // Popup permitido
      testWindow.close();
      if (onTestPopup) onTestPopup(true);
      onClose();
    }
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return {
        browser: 'Chrome',
        steps: [
          'Click en el icono 🔒 o ⓘ en la barra de direcciones',
          'Busca "Ventanas emergentes y redirecciones"',
          'Selecciona "Permitir"',
          'Recarga la página'
        ]
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Click en el icono 🔒 en la barra de direcciones',
          'Click en "Configuración de permisos"',
          'Desmarca "Bloquear ventanas emergentes"',
          'Recarga la página'
        ]
      };
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Ve a Safari > Preferencias',
          'Click en "Sitios web"',
          'Selecciona "Ventanas emergentes" en la lista',
          'Busca este sitio y selecciona "Permitir"'
        ]
      };
    } else if (userAgent.includes('edge')) {
      return {
        browser: 'Edge',
        steps: [
          'Click en el icono 🔒 en la barra de direcciones',
          'Busca "Ventanas emergentes y redirecciones"',
          'Selecciona "Permitir"',
          'Recarga la página'
        ]
      };
    }
    
    return {
      browser: 'tu navegador',
      steps: [
        'Busca el icono de bloqueo en la barra de direcciones',
        'Encuentra la configuración de ventanas emergentes',
        'Selecciona "Permitir" o "Siempre permitir"',
        'Recarga la página'
      ]
    };
  };

  const instructions = getBrowserInstructions();

  return (
    <div className="popup-permission-overlay">
      <div className="popup-permission-modal">
        <button className="popup-permission-close" onClick={onClose}>✕</button>
        
        {!showInstructions ? (
          <>
            <div className="popup-permission-icon">🔓</div>
            <h2>Necesitamos tu permiso</h2>
            <p>
              Para procesar tu pago y enviar tu pedido por WhatsApp, 
              necesitamos abrir ventanas adicionales.
            </p>
            <p className="popup-permission-note">
              ¡No te preocupes! Solo abriremos ventanas cuando hagas un pedido.
            </p>
            <div className="popup-permission-buttons">
              <button 
                className="popup-permission-test-btn"
                onClick={handleTestPopup}
              >
                Verificar permisos
              </button>
              <button 
                className="popup-permission-skip-btn"
                onClick={onClose}
              >
                Continuar de todos modos
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="popup-permission-warning-icon">⚠️</div>
            <h2>Las ventanas emergentes están bloqueadas</h2>
            <p>Para permitir ventanas emergentes en {instructions.browser}:</p>
            <ol className="popup-permission-steps">
              {instructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <div className="popup-permission-visual-hint">
              <p>Busca un ícono similar a estos en la barra de direcciones:</p>
              <div className="popup-permission-icons">
                <span>🔒</span>
                <span>ⓘ</span>
                <span className="blocked-icon">🚫</span>
              </div>
            </div>
            <button 
              className="popup-permission-retry-btn"
              onClick={handleTestPopup}
            >
              Probar de nuevo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PopupPermissionModal;
