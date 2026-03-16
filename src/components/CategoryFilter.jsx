import './CategoryFilter.css';

const categories = [
  { id: 'todos', label: 'Todos', emoji: '📦' },
  { id: 'hamburguesa', label: 'Hamburguesas', emoji: '🍔' },
  { id: 'perros', label: 'Perros', emoji: '🌭' },
  { id: 'pollo', label: 'Pollo', emoji: '🍗' },
  { id: 'asiatica', label: 'Asiática', emoji: '🥡' },
  { id: 'mariscos', label: 'Mariscos', emoji: '🐟' },
  { id: 'conos', label: 'Conos', emoji: '🍟' },
  { id: 'lechona', label: 'Lechona', emoji: '🥘' },
  { id: 'platos-arepas', label: 'Platos y Arepas', emoji: '🍽️' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'postres', label: 'Postres', emoji: '🍩' },
  { id: 'cajas-contenedores', label: 'Cajas y Contenedores', emoji: '📦' }
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="category-filter">
      <div className="category-buttons">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
            title={category.label}
            data-category={category.id}
          >
            <span className="category-emoji">{category.emoji}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
