import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CreateCostumeForm from "../components/costumes/CreateCostumeForm";
import "../styles/createcostumestyle.css";

const GALLERY_IMAGES = [
  "/images/figurino1.png",
  "/images/figurino2.png",
  "/images/figurino3.png",
  "/images/figurino4.png",
];

export default function CreateCostumePage({ onNavigate }) {
  return (
    <div className="create-costume-page">
      <Header />

      <main className="create-costume__background">

        {/* FUNDO */}
        <img
          src="/images/Entartes-5.png"
          alt=""
          className="create-costume__bg-image"
        />
        <div className="create-costume__bg-overlay" />

        {/* FORMULÁRIO */}
        <CreateCostumeForm
          onBack={() => onNavigate?.("home")}
          onSuccess={() => onNavigate?.("figurinos")}
        />

        {/* GRELHA DE IMAGENS */}
        <div className="create-costume__gallery">
          {GALLERY_IMAGES.map((src, i) => (
            <div key={i} className="create-costume__gallery-item">
              <img src={src} alt={`Figurino ${i + 1}`} />
            </div>
          ))}
        </div>

        {/* BOTÃO PRÓXIMA */}
        <button
          className="create-costume__next-btn"
          onClick={() => onNavigate?.("figurinos")}
        >
          Próxima →
        </button>

      </main>

      <Footer />
    </div>
  );
}