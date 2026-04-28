import "../../styles/headerstyle.css";
export default function Header() {
  return (
    <header className="header">
      <img
        src="/images/logo.png"
        alt="Logótipo Ent'Artes"
        className="header__logo"
      />
    </header>
  );
}