import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="page">
            <div className="not-found">
                <span className="not-found__num">404</span>

                <h1 className="not-found__title">
                    Страница не найдена
                </h1>

                <p className="not-found__text">
                    Возможно, рецепт удалили, ссылка устарела или вы ошиблись в адресе.
                </p>

                <div className="not-found__actions">
                    <Link to="/" className="btn btn--outline">
                        На главную
                    </Link>
                    <Link to="/recipes" className="btn btn--red">
                        К рецептам
                    </Link>
                </div>
            </div>
        </div>
    );
}