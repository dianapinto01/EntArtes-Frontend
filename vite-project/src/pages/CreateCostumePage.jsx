import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import CreateCostumeForm from "../components/costumes/CreateCostumeForm";
import "../styles/createcostumestyle.css";

const GALLERY_IMAGES = [
  "/images/figurino1.png",
  "/images/figurino2.png",
  "/images/figurino3.png",
  "/images/figurino4.png",
];

export default function CreateCostumePage() {
  const navigate = useNavigate();

  return (
    <div className="create-costume-page">
      <HeaderGlobal />

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
          onBack={() => navigate("/figurinos")}
          onSuccess={() => navigate("/figurinos")}
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
          onClick={() => navigate("/figurinos")}
        >
          Próxima →
        </button>

      </main>

      <Footer />
    </div>
  );
}