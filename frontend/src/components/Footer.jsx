export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__logo">
          Готовим <span className="italic text-bordeaux">вместе</span>
        </span>
        <span className="footer__copy">
          © {new Date().getFullYear()} · Все права защищены
        </span>
      </div>
    </footer>
  );
}