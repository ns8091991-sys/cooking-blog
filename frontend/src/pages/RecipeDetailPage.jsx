import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import { ingredientsApi } from '../api/ingredients';
import { useAuth } from '../context/AuthContext';
import StepVideo from '../components/StepVideo';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [steps, setSteps] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showStepForm, setShowStepForm] = useState(false);
  const [showIngForm, setShowIngForm] = useState(false);

  const [stepForm, setStepForm] = useState({ title: '', description: '', duration: '', video_url: '' });
  const [ingForm, setIngForm] = useState({ name: '', amount: '', unit: 'г', category: 'разное' });

  const [stepError, setStepError] = useState(null);
  const [ingError, setIngError] = useState(null);
  const [stepSaving, setStepSaving] = useState(false);
  const [ingSaving, setIngSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      recipesApi.get(id),
      recipesApi.listSteps(id),
      recipesApi.listIngredients(id),
    ])
      .then(([r, s, i]) => {
        setRecipe(r);
        setSteps(s);
        setIngredients(i);
      })
      .catch((e) => {
        setError(e?.response?.status === 404 ? 'Рецепт не найден' : (e.message || 'Ошибка загрузки'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (showIngForm) {
      ingredientsApi.listAll().then(setAllIngredients).catch(() => { });
    }
  }, [showIngForm]);

  const isOwner = user && recipe && recipe.author_id === user.id;

  const handleStepChange = (e) => setStepForm({ ...stepForm, [e.target.name]: e.target.value });

  const submitStep = async (e) => {
    e.preventDefault();
    setStepError(null);
    if (!stepForm.title.trim()) {
      setStepError('Введите название шага');
      return;
    }
    setStepSaving(true);
    try {
      const payload = {
        order: steps.length + 1,
        title: stepForm.title.trim(),
        description: stepForm.description.trim() || null,
        duration: stepForm.duration ? Number(stepForm.duration) : null,
        video_url: stepForm.video_url.trim() || null,
      };
      const created = await recipesApi.addStep(id, payload);
      setSteps([...steps, created]);
      setStepForm({ title: '', description: '', duration: '', video_url: '' });
      setShowStepForm(false);
    } catch (err) {
      const d = err?.response?.data?.detail;
      setStepError(typeof d === 'string' ? d : 'Не удалось добавить шаг');
    } finally {
      setStepSaving(false);
    }
  };

  const handleIngChange = (e) => setIngForm({ ...ingForm, [e.target.name]: e.target.value });

  const submitIngredient = async (e) => {
    e.preventDefault();
    setIngError(null);
    if (!ingForm.name.trim()) { setIngError('Введите название'); return; }
    if (!ingForm.amount || Number(ingForm.amount) <= 0) { setIngError('Укажите количество'); return; }

    setIngSaving(true);
    try {
      const trimmedName = ingForm.name.trim();
      const existing = allIngredients.find((i) => i.name.toLowerCase() === trimmedName.toLowerCase());

      let ingredientId;
      if (existing) {
        ingredientId = existing.id;
      } else {
        const created = await ingredientsApi.create({
          name: trimmedName,
          unit: ingForm.unit || null,
          category: ingForm.category || null,
        });
        ingredientId = created.id;
      }

      const added = await recipesApi.addIngredient(id, {
        ingredient_id: ingredientId,
        amount: Number(ingForm.amount),
      });

      setIngredients([...ingredients, added]);
      setIngForm({ name: '', amount: '', unit: 'г', category: 'разное' });
      setShowIngForm(false);
    } catch (err) {
      const d = err?.response?.data?.detail;
      setIngError(typeof d === 'string' ? d : 'Не удалось добавить ингредиент');
    } finally {
      setIngSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить рецепт?')) return;
    try {
      await recipesApi.remove(id);
      navigate('/recipes');
    } catch {
      alert('Не удалось удалить');
    }
  };

  if (loading) return <div className="page"><div className="state">Загрузка рецепта…</div></div>;

  if (error) {
    return (
      <div className="page">
        <div className="state state--error">{error}</div>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/recipes" className="btn btn--outline">← К рецептам</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      <nav className="breadcrumb">
        <Link to="/recipes" className="breadcrumb__link">Рецепты</Link>
        <span className="breadcrumb__sep">/</span>
        <span className="breadcrumb__current">{recipe.title}</span>
      </nav>

      <header className="recipe-head">
        <div className="recipe-head__meta">
          {recipe.category && <span className="recipe-head__cat">{recipe.category}</span>}
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

        <h1 className="recipe-head__title">{recipe.title}</h1>
        {recipe.description && <p className="recipe-head__desc">{recipe.description}</p>}

        {recipe.image_url && (
          <div className="recipe-head__image">
            <img src={recipe.image_url} alt={recipe.title} />
          </div>
        )}

        {isOwner && (
          <div className="recipe-head__actions">
            <Link to={`/recipes/${id}/edit`} className="btn btn--outline">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Редактировать
            </Link>
            <button onClick={handleDelete} className="btn btn--outline">
              Удалить
            </button>
          </div>
        )}
      </header>

      <div className="recipe-body">

        <aside className="recipe-sidebar">
          <div className="recipe-sidebar__head">
            <h2 className="recipe-sidebar__title">Ингредиенты</h2>
            {ingredients.length > 0 && <span className="recipe-sidebar__count">{ingredients.length}</span>}
          </div>

          {ingredients.length === 0 && !showIngForm ? (
            <p className="recipe-sidebar__empty">Ингредиенты не указаны</p>
          ) : (
            <ul className="ingredients">
              {ingredients.map((ing) => (
                <li key={ing.id} className="ingredients__item">
                  <span className="ingredients__name">{ing.name}</span>
                  <span className="ingredients__amount">{ing.amount} {ing.unit || ''}</span>
                </li>
              ))}
            </ul>
          )}

          {isOwner && showIngForm && (
            <form onSubmit={submitIngredient} className="inline-form">
              {ingError && <div className="inline-form__error">{ingError}</div>}
              <div className="field">
                <label className="field-label">Ингредиент</label>
                <input type="text" name="name" value={ingForm.name} onChange={handleIngChange} list="ingredient-suggestions" placeholder="Начните вводить…" className="input" autoFocus />
                <datalist id="ingredient-suggestions">
                  {allIngredients.map((i) => <option key={i.id} value={i.name} />)}
                </datalist>
              </div>
              <div className="inline-form__row">
                <div className="field">
                  <label className="field-label">Кол-во</label>
                  <input type="number" name="amount" value={ingForm.amount} onChange={handleIngChange} placeholder="200" min="0.1" step="any" className="input" />
                </div>
                <div className="field">
                  <label className="field-label">Ед.</label>
                  <input type="text" name="unit" value={ingForm.unit} onChange={handleIngChange} placeholder="г" maxLength={10} className="input" />
                </div>
              </div>
              <div className="inline-form__actions">
                <button type="button" onClick={() => { setShowIngForm(false); setIngError(null); }} className="btn btn--outline btn--sm">Отмена</button>
                <button type="submit" disabled={ingSaving} className="btn btn--red btn--sm">{ingSaving ? '…' : 'Добавить'}</button>
              </div>
            </form>
          )}

          {isOwner && !showIngForm && (
            <button onClick={() => setShowIngForm(true)} className="btn btn--outline btn--full" style={{ marginTop: ingredients.length ? 16 : 0 }}>
              + Добавить ингредиент
            </button>
          )}

          <Link to="/shopping-list" className="btn btn--red btn--full" style={{ marginTop: 16 }}>
            В список покупок
          </Link>
        </aside>

        <main className="recipe-main">
          <div className="recipe-main__head">
            <h2 className="recipe-main__title">
              Приготовление
              {steps.length > 0 && <span className="recipe-main__count">{steps.length} шагов</span>}
            </h2>
          </div>

          {steps.length === 0 && !showStepForm ? (
            <div className="empty empty--compact">
              <p className="empty__text">Шаги пока не добавлены</p>
            </div>
          ) : (
            <ol className="steps">
              {steps.map((step, index) => (
                <li key={step.id} className="step">
                  <div className="step__num">{String(index + 1).padStart(2, '0')}</div>
                  <div className="step__body">
                    {step.title && <h3 className="step__title">{step.title}</h3>}
                    {step.description && <p className="step__text">{step.description}</p>}
                    {step.video_url && <StepVideo url={step.video_url} title={step.title} />}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {isOwner && showStepForm && (
            <form onSubmit={submitStep} className="inline-form" style={{ marginTop: 24 }}>
              {stepError && <div className="inline-form__error">{stepError}</div>}
              <div className="field">
                <label className="field-label">Название шага</label>
                <input type="text" name="title" value={stepForm.title} onChange={handleStepChange} placeholder="Нарезать лук" className="input" autoFocus />
              </div>
              <div className="field">
                <label className="field-label">Описание</label>
                <textarea name="description" value={stepForm.description} onChange={handleStepChange} placeholder="Что делать" className="input textarea" rows={3} />
              </div>
              <div className="inline-form__row">
                <div className="field">
                  <label className="field-label">Длительность, сек</label>
                  <input type="number" name="duration" value={stepForm.duration} onChange={handleStepChange} placeholder="120" min="1" className="input" />
                </div>
                <div className="field">
                  <label className="field-label">Видео URL</label>
                  <input type="url" name="video_url" value={stepForm.video_url} onChange={handleStepChange} placeholder="https://…" className="input" />
                </div>
              </div>
              <div className="inline-form__actions">
                <button type="button" onClick={() => { setShowStepForm(false); setStepError(null); }} className="btn btn--outline btn--sm">Отмена</button>
                <button type="submit" disabled={stepSaving} className="btn btn--red btn--sm">{stepSaving ? '…' : 'Добавить шаг'}</button>
              </div>
            </form>
          )}

          {isOwner && !showStepForm && (
            <button onClick={() => setShowStepForm(true)} className="btn btn--outline btn--full" style={{ marginTop: 24 }}>
              + Добавить шаг
            </button>
          )}
        </main>

      </div>
    </div>
  );
}
