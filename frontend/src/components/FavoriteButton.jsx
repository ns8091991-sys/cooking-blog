import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesApi } from '../api/favorites';
import { useNavigate } from 'react-router-dom';

export default function FavoriteButton({ recipeId, initialActive, onToggle }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [active, setActive] = useState(initialActive || false);
    const [loading, setLoading] = useState(false);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            if (active) {
                await favoritesApi.remove(recipeId);
                setActive(false);
                onToggle?.(recipeId, false);
            } else {
                await favoritesApi.add(recipeId);
                setActive(true);
                onToggle?.(recipeId, true);
            }
        } catch {
            // игнорируем
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className={`favorite-btn ${active ? 'is-active' : ''}`}
            title={active ? 'Убрать из избранного' : 'В избранное'}
            aria-label="Избранное"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );
}