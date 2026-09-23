import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Завтрак',
  'Суп',
  'Салат',
  'Основное',
  'Паста',
  'Десерт',
  'Напиток',
  'Другое',
];

export default function CreateRecipePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'Основное',
    cooking_time: '',
    servings: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Введите название рецепта');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        category: form.category || null,
        cooking_time: form.cooking_time ? Number(form.cooking_time) : null,
        servings: form.servings ? Number(form.servings) : null,
      };

      const recipe = await recipesApi.create(payload);
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Не удалось создать рецепт');
    } finally {
      setLoading(false);
    }
  };

  // Пока проверяем авторизацию — показываем заглушку
  if (authLoading) {
    return (
      <div className="page">
        <div className="state">Загрузка…</div>
      </div>
    );
  }

  // Не авторизован — просим войти
  if (!user) {
    return (
      <div className="page">
        <div className="auth-required">
          <div className="auth-required__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="auth-required__title">
            Нужен <em className="italic text-bordeaux">аккаунт</em>
          </h1>
          <p className="auth-required__text">
            Чтобы создавать рецепты, войдите или зарегистрируйтесь.
          </p>
          <div className="auth-required__actions">
            <Link to="/login" className="btn btn--outline">Войти</Link>
            <Link to="/register" className="btn btn--red">Регистрация</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--narrow">

      <nav className="breadcrumb">
        <Link to="/recipes" className="breadcrumb__link">Рецепты</Link>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__current">Новый рецепт</span>
      </nav>

      <header className="page__head">
        <span className="eyebrow">Новая запись</span>
        <h1 className="page__title">
          Создать <em className="italic text-bordeaux">рецепт</em>
        </h1>
        <p className="page__subtitle">
          Заполните основное. Шаги и ингредиенты добавите на следующем экране.
        </p>
      </header>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="recipe-form">

        <div className="field">
          <label className="field-label" htmlFor="title">Название *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Например, Паста карбонара"
            className="input"
            maxLength={120}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Кратко: чем интересен рецепт, откуда он, на что обратить внимание"
            className="input textarea"
            rows={4}
            maxLength={500}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="image_url">Ссылка на картинку</label>
          <input
            id="image_url"
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/pasta.jpg"
            className="input"
          />
          <p className="field-hint">Можно оставить пустым — будет заглушка</p>
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="category">Категория</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input select"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="cooking_time">Время, мин</label>
            <input
              id="cooking_time"
              type="number"
              name="cooking_time"
              value={form.cooking_time}
              onChange={handleChange}
              placeholder="25"
              min="1"
              max="1440"
              className="input"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="servings">Порции</label>
            <input
              id="servings"
              type="number"
              name="servings"
              value={form.servings}
              onChange={handleChange}
              placeholder="2"
              min="1"
              max="100"
              className="input"
            />
          </div>
        </div>

        <div className="recipe-form__actions">
          <Link to="/recipes" className="btn btn--outline">
            Отмена
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn--red"
          >
            {loading ? 'Создаём…' : 'Создать рецепт'}
          </button>
        </div>

      </form>
    </div>
  );
}