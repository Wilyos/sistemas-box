import { useCart } from '../hooks/useCart';
import { FaShoppingCart } from 'react-icons/fa';
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
      <FaShoppingCart className="floating-cart-icon" />
      {totalItems > 0 && (
        <span className="floating-cart-badge">{totalItems}</span>
      )}
    </button>
  );
}
