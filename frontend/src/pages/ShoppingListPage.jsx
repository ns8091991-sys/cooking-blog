import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import { shoppingApi } from '../api/shopping';
import { useAuth } from '../context/AuthContext';

export default function ShoppingListPage() {
    const { user, loading: authLoading } = useAuth();


    const [recipes, setRecipes] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [listTitle, setListTitle] = useState('');


    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);


    const [myLists, setMyLists] = useState([]);
    const [openList, setOpenList] = useState(null);

    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState(null);


    useEffect(() => {
        recipesApi.list().then(setRecipes).catch(() => { });

        if (user) {
            shoppingApi.myLists().then(setMyLists).catch(() => { });
        }
    }, [user]);

    const toggleRecipe = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

        setPreview(null);
        setSavedMsg(null);
    };

    const buildPreview = async () => {
        setError(null);
        setSavedMsg(null);

        if (selectedIds.length === 0) {
            setError('Выберите хотя бы один рецепт');
            return;
        }

        setPreviewLoading(true);
        try {
            const data = await shoppingApi.preview(selectedIds, listTitle || null);
            setPreview(data);
        } catch (err) {
            const d = err?.response?.data?.detail;
            setError(typeof d === 'string' ? d : 'Не удалось построить список');
        } finally {
            setPreviewLoading(false);
        }
    };

    const saveList = async () => {
        if (selectedIds.length === 0) {
            setError('Выберите хотя бы один рецепт');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await shoppingApi.save(selectedIds, listTitle || null);
            setSavedMsg('Список сохранён!');
            const lists = await shoppingApi.myLists();
            setMyLists(lists);
        } catch (err) {
            const d = err?.response?.data?.detail;
            setError(typeof d === 'string' ? d : 'Не удалось сохранить список');
        } finally {
            setSaving(false);
        }
    };

    const openSaved = async (id) => {
        try {
            const data = await shoppingApi.get(id);
            setOpenList(data);
        } catch {
            setError('Не удалось открыть список');
        }
    };

    const toggleItem = async (itemId) => {
        try {
            const res = await shoppingApi.toggleItem(itemId);
            setOpenList((prev) => ({
                ...prev,
                items: prev.items.map((it) =>
                    it.id === itemId ? { ...it, is_checked: res.is_checked } : it
                ),
            }));
        } catch {

        }
    };


    if (!authLoading && !user) {
        return (
            <div className="page">
                <div className="auth-required">
                    <div className="auth-required__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </div>
                    <h1 className="auth-required__title">
                        Нужен <em className="italic text-bordeaux">аккаунт</em>
                    </h1>
                    <p className="auth-required__text">
                        Список покупок доступен только авторизованным пользователям.
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
        <div className="page">

            <header className="page__head">
                <span className="eyebrow">Умный список</span>
                <h1 className="page__title">
                    Список <em className="italic text-bordeaux">покупок</em>
                </h1>
                <p className="page__subtitle">
                    Выберите рецепты — ингредиенты сложатся и сгруппируются по отделам.
                </p>
            </header>

            {error && <div className="form-error">{error}</div>}
            {savedMsg && <div className="form-success">{savedMsg}</div>}

            <div className="shopping-layout">

                {/* Левая колонка — выбор */}
                <aside className="shopping-side">
                    <div className="shopping-side__head">
                        <h2 className="shopping-side__title">Рецепты</h2>
                        <span className="shopping-side__count">
                            {selectedIds.length} выбрано
                        </span>
                    </div>

                    <div className="field" style={{ marginBottom: 16 }}>
                        <input
                            type="text"
                            value={listTitle}
                            onChange={(e) => setListTitle(e.target.value)}
                            placeholder="Название списка (необязательно)"
                            className="input"
                            maxLength={80}
                        />
                    </div>

                    {recipes.length === 0 ? (
                        <p className="shopping-side__empty">Пока нет рецептов</p>
                    ) : (
                        <ul className="recipe-picker">
                            {recipes.map((r) => {
                                const checked = selectedIds.includes(r.id);
                                return (
                                    <li key={r.id}>
                                        <label className={`recipe-picker__item ${checked ? 'is-checked' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleRecipe(r.id)}
                                            />
                                            <span className="recipe-picker__box" aria-hidden>
                                                {checked && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </span>
                                            <span className="recipe-picker__title">{r.title}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <div className="shopping-side__actions">
                        <button
                            onClick={buildPreview}
                            disabled={previewLoading || selectedIds.length === 0}
                            className="btn btn--outline btn--full"
                        >
                            {previewLoading ? 'Считаем…' : 'Предпросмотр'}
                        </button>
                        <button
                            onClick={saveList}
                            disabled={saving || selectedIds.length === 0}
                            className="btn btn--red btn--full"
                        >
                            {saving ? 'Сохраняем…' : 'Сохранить список'}
                        </button>
                    </div>
                </aside>


                <main className="shopping-main">
                    {!preview ? (
                        <div className="empty">
                            <div className="empty__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                            </div>
                            <h3 className="empty__title">Список ещё не построен</h3>
                            <p className="empty__text">
                                Отметьте рецепты слева и нажмите «Предпросмотр»
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="shopping-main__head">
                                <h2 className="shopping-main__title">
                                    {preview.title || 'Список покупок'}
                                </h2>
                            </div>

                            <div className="shopping-groups">
                                {preview.groups.map((group) => (
                                    <section key={group.category} className="shopping-group">
                                        <h3 className="shopping-group__title">{group.category}</h3>
                                        <ul className="shopping-group__items">
                                            {group.items.map((item) => (
                                                <li key={item.ingredient_id} className="shopping-item">
                                                    <span className="shopping-item__name">{item.name}</span>
                                                    <span className="shopping-item__amount">
                                                        {item.amount} {item.unit || ''}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        </>
                    )}
                </main>

            </div>

            {myLists.length > 0 && (
                <section className="my-lists">
                    <div className="my-lists__head">
                        <h2 className="my-lists__title">
                            Мои <em className="italic text-bordeaux">списки</em>
                        </h2>
                    </div>

                    <ul className="my-lists__grid">
                        {myLists.map((sl) => (
                            <li key={sl.id}>
                                <button
                                    onClick={() => openSaved(sl.id)}
                                    className="my-lists__card"
                                >
                                    <span className="my-lists__card-title">
                                        {sl.title || 'Без названия'}
                                    </span>
                                    <span className="my-lists__card-date">
                                        {sl.created_at
                                            ? new Date(sl.created_at).toLocaleDateString('ru-RU')
                                            : ''}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>


                    {openList && (
                        <div className="saved-list">
                            <div className="saved-list__head">
                                <h3 className="saved-list__title">{openList.title}</h3>
                                <button
                                    onClick={() => setOpenList(null)}
                                    className="saved-list__close"
                                    title="Закрыть"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <ul className="saved-list__items">
                                {openList.items.map((item) => (
                                    <li key={item.id} className={`saved-item ${item.is_checked ? 'is-checked' : ''}`}>
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className="saved-item__check"
                                            aria-label="Отметить"
                                        >
                                            {item.is_checked && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                        <span className="saved-item__name">{item.name}</span>
                                        <span className="saved-item__amount">
                                            {item.amount} {item.unit || ''}
                                        </span>
                                        <span className="saved-item__cat">{item.category}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}

        </div>
    );
}