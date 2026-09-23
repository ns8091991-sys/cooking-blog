import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();

    const [myRecipes, setMyRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        recipesApi.list()
            .then((all) => {
                const mine = all.filter((r) => r.author_id === user.id);
                setMyRecipes(mine);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [user]);

    const handleDelete = async (id) => {
        if (!confirm('Удалить рецепт? Это действие нельзя отменить.')) return;

        try {
            await recipesApi.remove(id);
            setMyRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch {
            alert('Не удалось удалить');
        }
    };

    // Не авторизован
    if (!authLoading && !user) {
        return (
            <div className="page">
                <div className="auth-required">
                    <div className="auth-required__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h1 className="auth-required__title">
                        Нужен <em className="italic text-bordeaux">аккаунт</em>
                    </h1>
                    <p className="auth-required__text">
                        Войдите, чтобы увидеть свой профиль и рецепты.
                    </p>
                    <div className="auth-required__actions">
                        <Link to="/login" className="btn btn--outline">Войти</Link>
                        <Link to="/register" className="btn btn--red">Регистрация</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (authLoading) {
        return <div className="page"><div className="state">Загрузка…</div></div>;
    }

    const initial = (user.name || user.email).charAt(0).toUpperCase();

    return (
        <div className="page">

            {/* Шапка профиля */}
            <header className="profile-head">
                <div className="profile-head__avatar">{initial}</div>
                <div className="profile-head__info">
                    <span className="eyebrow">Профиль</span>
                    <h1 className="profile-head__name">
                        {user.name || 'Без имени'}
                    </h1>
                    <p className="profile-head__email">{user.email}</p>
                </div>
            </header>

            {/* Статистика */}
            <section className="profile-stats">
                <div className="profile-stat">
                    <span className="profile-stat__num">{myRecipes.length}</span>
                    <span className="profile-stat__label">
                        {myRecipes.length === 1 ? 'рецепт' : 'рецептов'}
                    </span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat__num">
                        {myRecipes.reduce((acc, r) => acc + (r.cooking_time || 0), 0)}
                    </span>
                    <span className="profile-stat__label">минут готовки</span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat__num">
                        {new Set(myRecipes.map((r) => r.category).filter(Boolean)).size}
                    </span>
                    <span className="profile-stat__label">категорий</span>
                </div>
            </section>

            {/* Мои рецепты */}
            <section className="profile-section">
                <div className="profile-section__head">
                    <h2 className="profile-section__title">
                        Мои <em className="italic text-bordeaux">рецепты</em>
                    </h2>
                    <Link to="/create" className="btn btn--red btn--sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="14" height="14">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Новый рецепт
                    </Link>
                </div>

                {loading && <div className="state">Загрузка…</div>}

                {error && <div className="state state--error">{error}</div>}

                {!loading && !error && myRecipes.length === 0 && (
                    <div className="empty">
                        <div className="empty__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                                <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h3 className="empty__title">У вас пока нет рецептов</h3>
                        <p className="empty__text">Создайте первый — он появится здесь</p>
                    </div>
                )}

                {!loading && !error && myRecipes.length > 0 && (
                    <ul className="profile-recipes">
                        {myRecipes.map((r) => (
                            <li key={r.id} className="profile-recipe">
                                <div className="profile-recipe__media">
                                    {r.image_url ? (
                                        <img src={r.image_url} alt={r.title} />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgba(116,7,13,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                                            <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    )}
                                </div>

                                <div className="profile-recipe__body">
                                    {r.category && (
                                        <span className="profile-recipe__cat">{r.category}</span>
                                    )}
                                    <h3 className="profile-recipe__title">{r.title}</h3>
                                    <div className="profile-recipe__meta">
                                        {r.cooking_time && <span>{r.cooking_time} мин</span>}
                                        {r.servings && <span>{r.servings} порц.</span>}
                                    </div>
                                </div>

                                <div className="profile-recipe__actions">
                                    <Link
                                        to={`/recipes/${r.id}`}
                                        className="btn btn--outline btn--sm"
                                    >
                                        Открыть
                                    </Link>
                                    <Link
                                        to={`/recipes/${r.id}/edit`}
                                        className="btn btn--outline btn--sm"
                                    >
                                        Изменить
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="btn btn--outline btn--sm btn--danger"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

        </div>
    );
}