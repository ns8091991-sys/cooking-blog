import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card">

      <div className="recipe-card__media">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#74070D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
            <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </div>

      <div className="recipe-card__body">
        {recipe.category && (
          <span className="recipe-card__cat">{recipe.category}</span>
        )}

        <h3 className="recipe-card__title">{recipe.title}</h3>

        <div className="recipe-card__meta">
          {recipe.cooking_time && (
            <span className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {recipe.cooking_time} мин
            </span>
          )}
          {recipe.servings && (
            <span className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {recipe.servings} порц.
            </span>
          )}
        </div>
      </div>

    </Link>
  );
}