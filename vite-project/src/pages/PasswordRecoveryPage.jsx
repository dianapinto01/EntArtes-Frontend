import HeaderGlobal from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PasswordRecoveryForm from "../components/auth/PasswordRecoveryForm";
import "../styles/recoverystyle.css";

export default function PasswordRecoveryPage() {
  return (
    <div className="page">
      <HeaderGlobal />

      <main className="main">
        <section className="recovery-background">

          <img
            src="/images/Entartes-5.png"
            alt=""
            className="recovery-background__image"
          />

          <div className="recovery-background__overlay"></div>

          <div className="recovery__content">
            <h1 className="recovery__title">Respire...</h1>
            <p className="recovery__subtitle">Aqui poderá mudar a sua password</p>
          </div>

          <section className="recovery">
            <PasswordRecoveryForm />
          </section>

        </section>
      </main>

      <Footer />
    </div>
  );
}