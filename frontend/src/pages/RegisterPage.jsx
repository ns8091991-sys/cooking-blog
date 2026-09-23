import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/recipes');
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__head">
        <span className="eyebrow">Новый аккаунт</span>
        <h1 className="auth__title">
          Присоединяйтесь <em className="italic text-bordeaux">к нам</em>
        </h1>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth__form">
        <div className="field">
          <label className="field-label">Имя</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Как вас зовут"
            className="input"
          />
        </div>

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
            minLength={6}
            placeholder="Минимум 6 символов"
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn--red btn--full"
        >
          {loading ? 'Создаём…' : 'Создать аккаунт'}
        </button>
      </form>

      <p className="auth__footer">
        Уже есть аккаунт?{' '}
        <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}