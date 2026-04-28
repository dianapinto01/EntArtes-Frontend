export default function AppHeader() {
  return (
    <header className="app-header">

      <div className="app-header__left">☰</div>

      <div className="app-header__center">
        <img
          src="/images/logo.png"
          alt="Logótipo Ent'Artes"
          className="app-header__logo"
        />
      </div>

      <div className="app-header__right">👤</div>

    </header>
  );
}