import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    'Завтрак', 'Суп', 'Салат', 'Основное', 'Паста', 'Десерт', 'Напиток', 'Другое',
];

export default function EditRecipePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
        if (!user) return;

        recipesApi.get(id)
            .then((r) => {
                if (r.author_id !== user.id) {
                    setForbidden(true);
                    return;
                }
                setForm({
                    title: r.title || '',
                    description: r.description || '',
                    image_url: r.image_url || '',
                    category: r.category || 'Основное',
                    cooking_time: r.cooking_time ?? '',
                    servings: r.servings ?? '',
                });
            })
            .catch((e) => {
                if (e?.response?.status === 404) setNotFound(true);
                else setError(e.message || 'Ошибка загрузки');
            })
            .finally(() => setLoading(false));
    }, [id, user]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.title.trim()) {
            setError('Введите название');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                image_url: form.image_url.trim() || null,
                category: form.category || null,
                cooking_time: form.cooking_time ? Number(form.cooking_time) : null,
                servings: form.servings ? Number(form.servings) : null,
            };
            await recipesApi.update(id, payload);
            navigate(`/recipes/${id}`);
        } catch (err) {
            const d = err?.response?.data?.detail;
            setError(typeof d === 'string' ? d : 'Не удалось сохранить');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return <div className="page"><div className="state">Загрузка…</div></div>;
    }

    if (!user) {
        return (
            <div className="page">
                <div className="auth-required">
                    <h1 className="auth-required__title">Нужен аккаунт</h1>
                    <div className="auth-required__actions">
                        <Link to="/login" className="btn btn--outline">Войти</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="page">
                <div className="state state--error">Рецепт не найден</div>
            </div>
        );
    }

    if (forbidden) {
        return (
            <div className="page">
                <div className="state state--error">Нет прав на редактирование</div>
            </div>
        );
    }

    if (!form) {
        return <div className="page"><div className="state">Загрузка…</div></div>;
    }

    return (
        <div className="page page--narrow">

            <nav className="breadcrumb">
                <Link to="/recipes" className="breadcrumb__link">Рецепты</Link>
                <span className="breadcrumb__sep">/</span>
                <Link to={`/recipes/${id}`} className="breadcrumb__link">Рецепт</Link>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">Редактирование</span>
            </nav>

            <header className="page__head">
                <span className="eyebrow">Редактирование</span>
                <h1 className="page__title">
                    Изменить <em className="italic text-bordeaux">рецепт</em>
                </h1>
            </header>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit} className="recipe-form">
                <div className="field">
                    <label className="field-label">Название *</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="input"
                        maxLength={120}
                        autoFocus
                    />
                </div>

                <div className="field">
                    <label className="field-label">Описание</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="input textarea"
                        rows={4}
                        maxLength={500}
                    />
                </div>

                <div className="field">
                    <label className="field-label">Ссылка на картинку</label>
                    <input
                        type="url"
                        name="image_url"
                        value={form.image_url}
                        onChange={handleChange}
                        className="input"
                    />
                </div>

                <div className="field-row">
                    <div className="field">
                        <label className="field-label">Категория</label>
                        <select
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
                        <label className="field-label">Время, мин</label>
                        <input
                            type="number"
                            name="cooking_time"
                            value={form.cooking_time}
                            onChange={handleChange}
                            className="input"
                            min="1"
                            max="1440"
                        />
                    </div>
                    <div className="field">
                        <label className="field-label">Порции</label>
                        <input
                            type="number"
                            name="servings"
                            value={form.servings}
                            onChange={handleChange}
                            className="input"
                            min="1"
                            max="100"
                        />
                    </div>
                </div>

                <div className="recipe-form__actions">
                    <Link to={`/recipes/${id}`} className="btn btn--outline">
                        Отмена
                    </Link>
                    <button type="submit" disabled={saving} className="btn btn--red">
                        {saving ? 'Сохраняем…' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </div>
    );
}