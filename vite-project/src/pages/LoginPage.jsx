import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import LoginForm from "../components/auth/LoginForm";
import "../styles/loginstyle.css";

export default function LoginPage({ onNavigate }) {
  return (
    <div className="page">
      <Header />

      <main className="main">
        <section className="background">

          <img
            src="/images/Entartes-5.png"
            alt=""
            className="background__image"
          />

          <div className="background__overlay"></div>

          <section className="login">
            <LoginForm onNavigate={onNavigate} />
          </section>

        </section>
      </main>

      <Footer />
    </div>
  );
}