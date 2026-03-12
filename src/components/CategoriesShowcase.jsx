import { useNavigate } from 'react-router-dom';
import products from '../data/products.json';
import './CategoriesShowcase.css';

const categories = [
  { id: 'hamburguesa', label: 'Hamburguesas', emoji: '🍔', color: '#FF6B6B' },
  { id: 'pollo', label: 'Pollo', emoji: '🍗', color: '#FFD93D' },
  { id: 'asiatica', label: 'Asiática', emoji: '🥡', color: '#6BCB77' },
  { id: 'postres', label: 'Postres', emoji: '🍩', color: '#D946EF' },
  { id: 'otros', label: 'Otros', emoji: '📦', color: '#95A5A6' },
];

export default function CategoriesShowcase() {
  const navigate = useNavigate();

  // Obtener la primera imagen de cada categoría
  const getCategoryImage = (categoryId) => {
    const product = products.find(p => p.category === categoryId);
    return product?.images?.[0] || '/products/default.png';
  };

  const handleCategoryClick = (categoryId) => {
    navigate('/productos');
    // Scroll to category filter after navigation
    setTimeout(() => {
      const button = document.querySelector(`.category-btn[data-category="${categoryId}"]`);
      if (button) button.click();
    }, 100);
  };

  return (
    <section id="productos" className="categories-showcase">
      <h2 className="section-title">
        <span>Explora Nuestras Categorías</span>
      </h2>

      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category.id)}
            style={{ '--accent-color': category.color }}
          >
            <div className="category-image-wrapper">
              <img 
                src={getCategoryImage(category.id)} 
                alt={category.label}
                className="category-image"
              />
              <div className="category-overlay"></div>
            </div>
            
            <div className="category-info">
              <div className="category-emoji">{category.emoji}</div>
              <h3 className="category-name">{category.label}</h3>
              <p className="category-count">
                {products.filter(p => p.category === category.id).length} productos
              </p>
            </div>

            <div className="category-action">
              <span>Ver más →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
