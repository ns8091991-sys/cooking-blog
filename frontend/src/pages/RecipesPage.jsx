import { useEffect, useMemo, useState } from 'react';
import { recipesApi } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');

  useEffect(() => {
    recipesApi.list()
      .then(setRecipes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Динамический список категорий из существующих рецептов
  const categories = useMemo(() => {
    const set = new Set(recipes.map((r) => r.category).filter(Boolean));
    return ['Все', ...Array.from(set).sort()];
  }, [recipes]);

  // Фильтрация
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesCategory =
        activeCategory === 'Все' || r.category === activeCategory;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [recipes, search, activeCategory]);

  return (
    <div className="page">
      <div className="page__head">
        <span className="eyebrow">Каталог</span>
        <h1 className="page__title">
          Все <em className="italic text-bordeaux">рецепты</em>
        </h1>
        <p className="page__subtitle">
          {recipes.length > 0
            ? `${filtered.length} из ${recipes.length} в коллекции`
            : 'Пока ничего нет'}
        </p>
      </div>

      {loading && <div className="state">Загрузка…</div>}

      {error && <div className="state state--error">{error}</div>}

      {!loading && !error && recipes.length > 0 && (
        <>
          {/* Панель поиска и фильтров */}
          <div className="catalog-toolbar">

            {/* Поиск */}
            <div className="search">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию или описанию…"
                className="search__input"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="search__clear"
                  title="Очистить"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Категории */}
            {categories.length > 1 && (
              <div className="filters">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`filter-chip ${activeCategory === cat ? 'is-active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Результаты */}
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty__icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="empty__title">Ничего не найдено</h3>
              <p className="empty__text">
                Попробуйте изменить запрос или выбрать другую категорию
              </p>
            </div>
          ) : (
            <div className="recipes-grid">
              {filtered.map((r, index) => (
                <RecipeCard key={r.id} recipe={r} index={index} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && recipes.length === 0 && (
        <div className="empty">
          <div className="empty__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="empty__title">Пока нет рецептов</h3>
          <p className="empty__text">Создайте первый — он появится здесь</p>
        </div>
      )}
    </div>
  );
}