import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Закрываем меню при смене страницы
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Блокируем скролл, пока меню открыто
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="header">
        <div className="container header__inner">

          <Link to="/" className="header__logo">
            <div className="header__logo-mark">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F3E3B2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="header__logo-text">Готовим вместе</span>
          </Link>

          {/* Десктоп-навигация */}
          <nav className="header__nav">
            <Link to="/recipes" className={`nav-link ${isActive('/recipes') ? 'active' : ''}`}>
              Рецепты
            </Link>
            <Link to="/shopping-list" className={`nav-link ${isActive('/shopping-list') ? 'active' : ''}`}>
              Список
            </Link>

            {user ? (
              <>
                <Link to="/create" className="header__create">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="16" height="16">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Рецепт
                </Link>

                <div className="header__divider" />

                <div className="header__user">
                  <Link to="/profile" className="header__profile-link">
                    <div className="avatar">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="header__username">
                      {user.name || user.email}
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="icon-btn" title="Выйти">
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Войти</Link>
                <Link to="/register" className="btn btn--red">Регистрация</Link>
              </>
            )}
          </nav>

          {/* Бургер — только на мобильных */}
          <button
            className="burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>

        </div>
      </header>

      {/* Мобильное меню */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <Link to="/recipes" className="mobile-nav__link">
          Рецепты
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
        <Link to="/shopping-list" className="mobile-nav__link">
          Список покупок
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        {user ? (
          <>
            <Link to="/create" className="mobile-nav__link">
              Создать рецепт
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <div className="mobile-nav__user">
              <div className="avatar">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--maroon)' }}>
                  {user.name || 'Без имени'}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(70, 70, 42, 0.6)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>

            <div className="mobile-nav__actions">
              <Link to="/profile" className="mobile-nav__link">
                Мой профиль
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <button onClick={handleLogout} className="btn btn--outline">
                Выйти
              </button>
            </div>
          </>
        ) : (
          <div className="mobile-nav__actions">
            <Link to="/login" className="btn btn--outline">
              Войти
            </Link>
            <Link to="/register" className="btn btn--red">
              Регистрация
            </Link>
            <Link to="/create" className="header__create">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="16" height="16">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Рецепт
            </Link>
            <Link to="/create" className="mobile-nav__link">
              Создать рецепт
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
