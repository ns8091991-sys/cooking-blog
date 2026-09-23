import { useEffect, useState } from 'react';
import { recipesApi } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    recipesApi.list()
      .then(setRecipes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page__head">
        <span className="eyebrow">Каталог</span>
        <h1 className="page__title">
          Все <em className="italic text-bordeaux">рецепты</em>
        </h1>
        <p className="page__subtitle">
          {recipes.length > 0 ? `${recipes.length} в коллекции` : 'Пока ничего нет'}
        </p>
      </div>

      {loading && <div className="state">Загрузка…</div>}

      {error && <div className="state state--error">{error}</div>}

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

      {!loading && !error && recipes.length > 0 && (
        <div className="recipes-grid">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}