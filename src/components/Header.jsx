import { useCart } from '../hooks/useCart';
import './Header.css';

export default function Header() {
  const { isCartOpen, setIsCartOpen, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="header">
      <div className="header-container header-container--compact">
        <button
          className="cart-button"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          <span className="cart-icon">🛒</span>
          {totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}
        </button>
      </div>
    </header>
  );
}
