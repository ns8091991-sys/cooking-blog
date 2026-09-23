import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero__row">

          {/* Текстовая колонка */}
          <div className="hero__text">
            <span className="eyebrow">Журнал о еде · 2026</span>

            <h1 className="hero__title">
              Готовим<br />
              <em className="italic text-bordeaux">вместе</em>
              <span className="text-bordeaux">.</span>
            </h1>

            <p className="hero__desc">
              Интерактивные рецепты, пошаговые видеоуроки
              и умный список покупок — всё в одном месте.
            </p>

            <div className="hero__actions">
              <Link to="/recipes" className="btn btn--dark">
                Смотреть рецепты
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/register" className="btn btn--outline">
                Присоединиться
              </Link>
            </div>
          </div>
          <div className="hero__media">
            <img src="/photho.jpg" alt="..." />
          </div>

        </div>
      </section>

      {/* MARQUEE */}
      <section className="marquee-band">
        <div className="marquee">
          {[0, 1].map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {['Пошаговые видео', 'Умный список', 'Свои рецепты', 'Таймеры', 'Готовим вместе'].map((text, i) => (
                <span key={i} className="marquee__item">
                  <span className="marquee__dot">●</span>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="features__inner">
          <div className="features__head">
            <h2 className="features__title">
              Что <em className="italic text-bordeaux">внутри</em>
            </h2>
            <span className="features__hint">— три причины</span>
          </div>

          {[
            { n: '01', t: 'Пошаговые видео', d: 'Каждый шаг рецепта — короткое видео. Не нужно искать нужный момент в длинной записи.' },
            { n: '02', t: 'Умный список', d: 'Выберите несколько рецептов — ингредиенты сложатся автоматически и сгруппируются по отделам.' },
            { n: '03', t: 'Свои рецепты', d: 'Сохраняйте любимые блюда, добавляйте вариации и делитесь ими с другими.' },
          ].map((f) => (
            <div key={f.n} className="feature-row">
              <span className="feature-row__num">{f.n}</span>
              <h3 className="feature-row__title">{f.t}</h3>
              <p className="feature-row__text">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <span className="eyebrow eyebrow--center">Начните сегодня</span>

        <h2 className="final-cta__title">
          Создайте свою<br />
          <em className="italic text-bordeaux">первую запись</em>
        </h2>

        <p className="final-cta__desc">
          Бесплатно. Без рекламы. Только вы и ваши рецепты.
        </p>

        <div className="final-cta__actions">
          <Link to="/register" className="btn btn--red">
            Создать аккаунт
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

    </div>
  );
}