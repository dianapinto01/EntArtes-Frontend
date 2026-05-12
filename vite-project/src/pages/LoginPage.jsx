import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import LoginForm from "../components/auth/LoginForm";
import "../styles/loginstyle.css";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const handleNavigate = (target) => {
    if (target === "password") {
      navigate("/recuperar-senha");
      return;
    }

    if (target === "login") {
      navigate("/");
      return;
    }
  };

  return (
    <div className="page">
      <HeaderGlobal />

      <main className="main">
        <section className="background">

          <img
            src="/images/Entartes-5.png"
            alt=""
            className="background__image"
          />

          <div className="background__overlay"></div>

          <section className="login">
            <LoginForm
              onNavigate={handleNavigate}
              onLoginSuccess={onLoginSuccess}
            />
          </section>

        </section>
      </main>

      <Footer />
    </div>
  );
}
