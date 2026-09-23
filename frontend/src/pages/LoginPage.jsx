import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/recipes');
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__head">
        <span className="eyebrow">Вход в аккаунт</span>
        <h1 className="auth__title">
          С <em className="italic text-bordeaux">возвращением</em>
        </h1>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth__form">
        <div className="field">
          <label className="field-label">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="input"
          />
        </div>

        <div className="field">
          <label className="field-label">Пароль</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn--dark btn--full"
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>

      <p className="auth__footer">
        Нет аккаунта?{' '}
        <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}