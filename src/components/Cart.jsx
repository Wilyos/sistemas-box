import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import Checkout from './Checkout';
import './Cart.css';

export default function Cart() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, updateItemOptions, getTotal, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isCartOpen) return null;

  if (showCheckout) {
    return <Checkout onBack={() => setShowCheckout(false)} />;
  }

  // Función para cambiar la tinta y recalcular el precio
  const handleInkTypeChange = (itemIndex, newInkType) => {
    const item = cartItems[itemIndex];
    if (!item) return;

    let newPrice = item.price;
    // Si el producto tiene estructura de precios dinámicos
    if (item.basePriceOneColor && item.priceColor) {
      newPrice = newInkType === 'oneColor' ? Number(item.basePriceOneColor) : Number(item.priceColor);
    }
    
    updateItemOptions(itemIndex, newInkType, item.paperType, newPrice, item.selectedPaperLabel);
  };

  // Función para cambiar el papel
  const handlePaperTypeChange = (itemIndex, newPaperType) => {
    const item = cartItems[itemIndex];
    if (!item) return;

    // Encontrar el label del papel seleccionado
    const selectedPaper = item.paperTypes?.find(p => p.id === newPaperType);
    const newLabel = selectedPaper?.label || item.selectedPaperLabel;

    updateItemOptions(itemIndex, item.inkType, newPaperType, item.price, newLabel);
  };

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Carrito de Compras</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito está vacío</p>
            <button className="btn" onClick={() => setIsCartOpen(false)}>
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.inkType}-${item.paperType}-${index}`} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    
                    {/* Selector de Tinta */}
                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                        Tinta:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`ink-${index}`}
                            value="oneColor"
                            checked={item.inkType === 'oneColor'}
                            onChange={() => handleInkTypeChange(index, 'oneColor')}
                            style={{ cursor: 'pointer' }}
                          />
                          Una tinta {item.basePriceOneColor && `($${Number(item.basePriceOneColor).toFixed(2)})`}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`ink-${index}`}
                            value="color"
                            checked={item.inkType === 'color'}
                            onChange={() => handleInkTypeChange(index, 'color')}
                            style={{ cursor: 'pointer' }}
                          />
                          A color {item.priceColor && `($${Number(item.priceColor).toFixed(2)})`}
                        </label>
                      </div>
                    </div>

                    {/* Selector de Papel */}
                    {item.paperTypes && item.paperTypes.length > 0 && (
                      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                          Papel:
                        </label>
                        <select
                          value={item.paperType}
                          onChange={(e) => handlePaperTypeChange(index, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            border: '1px solid var(--primary)',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            backgroundColor: 'white'
                          }}
                        >
                          {item.paperTypes.map((paper) => (
                            <option key={paper.id} value={paper.id}>
                              {paper.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <p className="cart-item-price" style={{ marginTop: '8px' }}>${item.price.toFixed(2)}</p>
                  </div>

                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1000, item.quantity - 1000))}
                      className="qty-btn"
                    >
                      −
                    </button>
                    <span className="qty">{item.quantity.toLocaleString()}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1000)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
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

            <div className="cart-actions">
              <button className="btn" onClick={() => setShowCheckout(true)}>
                Proceder al Pago
              </button>
              <button
                className="btn-secondary"
                onClick={() => setIsCartOpen(false)}
              >
                Continuar Comprando
              </button>
              <button
                className="btn-text"
                onClick={() => {
                  clearCart();
                  setIsCartOpen(false);
                }}
              >
                Vaciar Carrito
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
