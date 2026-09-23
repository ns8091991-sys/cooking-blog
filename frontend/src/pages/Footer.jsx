export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-8 mt-12">
      <div className="glass rounded-2xl px-6 py-4 text-center">
        <p className="text-sm text-gray-500">
          Готовим вместе · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}