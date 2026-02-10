import { useCart } from '../hooks/useCart';
import './FloatingCartButton.css';

export default function FloatingCartButton() {
  const { isCartOpen, setIsCartOpen, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const handleClick = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <button
      className="floating-cart-button"
      onClick={handleClick}
      aria-label="Abrir carrito de compras"
    >
      <span className="floating-cart-icon">🛒</span>
      {totalItems > 0 && (
        <span className="floating-cart-badge">{totalItems}</span>
      )}
    </button>
  );
}
