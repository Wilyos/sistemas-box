import { useState } from 'react';
import { useCart } from '../hooks/useCart';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1000);
  const [inkType, setInkType] = useState('oneColor'); // oneColor o color
  const [paperType, setPaperType] = useState(product?.paperTypes?.[0]?.id || 'paper1');

  if (!product) return null;

  // Calcular precio basado en las opciones seleccionadas
  const getCurrentPrice = () => {
    const oneColorPrice = Number(product.basePriceOneColor || product.price || 0);
    const colorPrice = Number(product.priceColor || product.price || 0);
    return inkType === 'oneColor' ? oneColorPrice : colorPrice;
  };

  const totalPrice = getCurrentPrice() * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      price: getCurrentPrice(),
      inkType,
      paperType,
      selectedPaperLabel: product.paperTypes.find(p => p.id === paperType)?.label,
      quantity
    };
    addToCart(cartItem, quantity);
    alert(`${product.name} (x${quantity}) agregado al carrito`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div
          className={`modal-icon ${product.color === 'secondary' ? 'secondary' : ''}`}
        >
          {product.icon}
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
          {product.name}
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '30px' }}>
          {product.description}
        </p>

        <div className="modal-info">
          <div className="modal-info-item">
            <label>Precio por unidad</label>
            <strong>${getCurrentPrice().toFixed(2)}</strong>
          </div>
          <div className="modal-info-item">
            <label>Material</label>
            <strong>{product.material}</strong>
          </div>
          <div className="modal-info-item">
            <label>Dimensiones</label>
            <strong>{product.dimensions}</strong>
          </div>
        </div>

        {/* Selector de Tintas */}
        <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '600' }}>
            Tipo de Tinta:
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="inkType"
                value="oneColor"
                checked={inkType === 'oneColor'}
                onChange={(e) => setInkType(e.target.value)}
                style={{ cursor: 'pointer' }}
              />
              <span>Una tinta - ${Number(product.basePriceOneColor || 0).toFixed(2)}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="inkType"
                value="color"
                checked={inkType === 'color'}
                onChange={(e) => setInkType(e.target.value)}
                style={{ cursor: 'pointer' }}
              />
              <span>A color - ${Number(product.priceColor || 0).toFixed(2)}</span>
            </label>
          </div>
        </div>

        {/* Selector de Papel */}
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '600' }}>
            Tipo de Papel:
          </label>
          <select
            value={paperType}
            onChange={(e) => setPaperType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid var(--primary)',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            {product.paperTypes.map((paper) => (
              <option key={paper.id} value={paper.id}>
                {paper.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cantidad */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '600' }}>
            Cantidad:
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => setQuantity(Math.max(1000, quantity - 1000))}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--primary)',
                background: 'white',
                color: 'var(--primary)',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
            >
              −
            </button>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
              {quantity.toLocaleString()}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1000)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--primary)',
                background: 'white',
                color: 'var(--primary)',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Total */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: 'rgba(242, 110, 34, 0.1)',
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: '600' }}>Total:</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>${totalPrice.toFixed(2)}</strong>
          </div>
        </div>

        <button
          className="btn"
          style={{ width: '100%', marginTop: '30px' }}
          onClick={handleAddToCart}
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
}
