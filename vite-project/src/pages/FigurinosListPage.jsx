import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/figurinosliststyle.css";

const API = "http://localhost:3000/api/v1";

const PLACEHOLDER_IMAGES = [
  "/images/figurino1.png",
  "/images/figurino2.png",
  "/images/figurino3.png",
  "/images/figurino4.png",
];

export default function FigurinosListPage() {
  const navigate = useNavigate();
  const [figurinos, setFigurinos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/figurinos`)
      .then((res) => res.json())
      .then((data) => setFigurinos(Array.isArray(data) ? data.filter(f => f.estado_aluger !== "Indisponivel") : []))
      .catch(() => setFigurinos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="figlist-page">
      <HeaderGlobal />

      <main className="figlist__background">
        <img src="/images/Entartes-5.png" alt="" className="figlist__bg-image" />
        <div className="figlist__bg-overlay" />

        <div className="figlist__center">

          <div className="figlist__top-bar">
            <h1 className="figlist__title">Figurinos disponíveis</h1>
            <div className="figlist__top-actions">
              <button
                className="figlist__pedidos-btn"
                onClick={() => navigate("/pedidos-recebidos")}
              >
                Meus pedidos
              </button>
              <button
                className="figlist__publish-btn"
                onClick={() => navigate("/criar-figurino")}
              >
                + Publicar figurino
              </button>
            </div>
          </div>

          {loading ? (
            <p className="figlist__empty">A carregar...</p>
          ) : figurinos.length === 0 ? (
            <p className="figlist__empty">Nenhum figurino disponível.</p>
          ) : (
            <div className="figlist__list">
              {figurinos.map((f, i) => (
                <div key={f.id} className="figlist__card">
                  <img
                    src={f.imagem ?? PLACEHOLDER_IMAGES[i % 4]}
                    alt={f.titulo}
                    className="figlist__card-img"
                  />
                  <div className="figlist__card-info">
                    <p className="figlist__card-title">{f.titulo}</p>
                    <p className="figlist__card-meta">
                      {f.valor_por_dia != null ? `${f.valor_por_dia} € / dia` : "—"}
                      {f.tamanho ? ` · ${f.tamanho}` : ""}
                      {f.estado ? ` · ${f.estado}` : ""}
                    </p>
                  </div>
                  <button
                    className="figlist__card-btn"
                    onClick={() => navigate(`/figurinos/${f.id}`, {
                      state: { imagem: f.imagem ?? PLACEHOLDER_IMAGES[i % 4] }
                    })}
                  >
                    Ver figurino
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
