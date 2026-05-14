import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import CostumeFilters from "../components/costumes/CostumeFilters";
import "../styles/costumespage.css";

const API = "http://localhost:3000/api/v1";

const PLACEHOLDER_IMAGES = [
  "/images/figurino1.png",
  "/images/figurino2.png",
  "/images/figurino3.png",
  "/images/figurino4.png",
];

export default function CostumesPage() {
  const navigate = useNavigate();
  const [figurinos, setFigurinos] = useState([]);

  useEffect(() => {
    fetch(`${API}/figurinos`)
      .then((res) => res.json())
      .then((data) => setFigurinos(Array.isArray(data) ? data : []))
      .catch(() => setFigurinos([]));
  }, []);

  const galleryItems = [...Array(4)].map((_, i) => ({
    id: figurinos[i]?.id ?? i,
    titulo: figurinos[i]?.titulo ?? `Figurino ${i + 1}`,
    imagem: figurinos[i]?.imagem ?? PLACEHOLDER_IMAGES[i],
    real: !!figurinos[i],
  }));

  return (
    <div className="costumes-page">
      <HeaderGlobal />

      <main className="costumes__background">

        <img
          src="/images/Entartes-5.png"
          alt=""
          className="costumes__bg-image"
        />
        <div className="costumes__bg-overlay" />

        {/* COLUNA ESQUERDA */}
        <div className="costumes__left">
          <CostumeFilters onResults={setFigurinos} />
          <div className="costumes__publish-box">
            <p>Deseja publicar um anúncio?</p>
            <button
              className="costumes__publish-btn"
              onClick={() => navigate("/criar-figurino")}
            >
              Publicar
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="costumes__right">

          {/* GALERIA + BOTÃO */}
          <div className="costumes__gallery-wrapper">
            <div className="costumes__gallery">
              {galleryItems.map((f, i) => (
                <div
                  key={f.id ?? i}
                  className="costumes__gallery-item"
                  onClick={() => f.real && onNavigate?.("figurino-detalhe", f.id)}
                >
                  <img src={f.imagem} alt={f.titulo} />
                </div>
              ))}
            </div>

            <button
              className="costumes__next-btn"
              onClick={() => navigate("/criar-figurino")}
            >
              Próxima →
            </button>
          </div>

          {/* BARRA LATERAL */}
          <div className="costumes__sidebar">
            <button
              className="costumes__sidebar-plus"
              onClick={() => onNavigate?.("pedidos")}
            >
              +
            </button>
            <span className="costumes__sidebar-label">Pedidos</span>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}