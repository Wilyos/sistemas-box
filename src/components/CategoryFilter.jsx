import './CategoryFilter.css';

const categories = [
  { id: 'todos', label: 'Todos', emoji: '📦' },
  { id: 'hamburguesa', label: 'Hamburguesas', emoji: '🍔' },
  { id: 'pollo', label: 'Pollo', emoji: '🍗' },
  { id: 'asiatica', label: 'Asiática', emoji: '🥡' },
  { id: 'postres', label: 'Postres', emoji: '🍩' },
  { id: 'otros', label: 'Otros', emoji: '📦' }
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
