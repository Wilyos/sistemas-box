import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import ImageCarousel from './ImageCarousel';

export default function ProductCard({ product, onDetailsClick, isVisible }) {
  const { addToCart } = useCart();
  const [selectedInkType, setSelectedInkType] = useState('oneColor');
  const [selectedPaperType, setSelectedPaperType] = useState(product?.paperTypes?.[0]?.id || 'paper1');

  // Las imágenes ahora están en la carpeta public, se sirven directamente
  const processedImages = product?.images?.filter(Boolean) || [];

  // Obtener el precio actual según la tinta seleccionada
  const getCurrentPrice = () => {
    const oneColorPrice = Number(product?.basePriceOneColor || product?.price || 0);
    const colorPrice = Number(product?.priceColor || product?.price || 0);
    return selectedInkType === 'oneColor' ? oneColorPrice : colorPrice;
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      price: getCurrentPrice(),
      inkType: selectedInkType,
      paperType: selectedPaperType,
      selectedPaperLabel: product.paperTypes?.find(p => p.id === selectedPaperType)?.label || ''
    };
    addToCart(cartItem, 1000);
    alert(`${product.name} agregado al carrito`);
  };

  const selectedPaper = product?.paperTypes?.find(p => p.id === selectedPaperType);

  return (
    <div className={`product-card ${isVisible ? 'animate' : ''}`}>
      {/* Carrusel de imágenes */}
      <ImageCarousel images={processedImages} />
      
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      
      {/* Mostrar medidas */}
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
        <strong>Medidas:</strong> {product.dimensions}
      </p>

      {/* Selector de Tinta */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
          Precio
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSelectedInkType('oneColor')}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedInkType === 'oneColor' ? 'var(--primary)' : '#e8e8e8',
              color: selectedInkType === 'oneColor' ? 'white' : '#333',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
          >
            Una Tinta: {Number(product?.basePriceOneColor || 0).toFixed(0)}
          </button>
          <button
            onClick={() => setSelectedInkType('color')}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedInkType === 'color' ? 'var(--primary)' : '#e8e8e8',
              color: selectedInkType === 'color' ? 'white' : '#333',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
          >
            A Color: {Number(product?.priceColor || 0).toFixed(0)}
          </button>
        </div>
      </div>

      {/* Selector de Papel */}
      {product?.paperTypes && product.paperTypes.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Tipo de Papel
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {product.paperTypes.map((paper) => (
              <button
                key={paper.id}
                onClick={() => setSelectedPaperType(paper.id)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedPaperType === paper.id ? 'var(--primary)' : '#e8e8e8',
                  color: selectedPaperType === paper.id ? 'white' : '#333',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {paper.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button
          className="product-link"
          onClick={() => onDetailsClick(product)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', flex: 1, textAlign: 'left' }}
        >
          Ver detalles →
        </button>
        <button
          className="btn"
          onClick={handleAddToCart}
          style={{ padding: '8px 15px', fontSize: '0.9rem' }}
        >
          🛒
        </button>
      </div>
    </div>
  );
}
