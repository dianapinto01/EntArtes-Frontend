import { useState, useEffect } from "react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/costumedetailstyle.css";

const API = "http://localhost:3000/api/v1";
const UTILIZADOR_ID = 1;

export default function CostumeDetailPage({ onNavigate, figurinoId }) {
  const [figurino, setFigurino] = useState(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!figurinoId) return;
    fetch(`${API}/figurinos/${figurinoId}`)
      .then((res) => res.json())
      .then((data) => setFigurino(data))
      .catch(() => setFigurino(null));
  }, [figurinoId]);

  const handleFazerPedido = async () => {
    if (!dataInicio || !dataFim) {
      setMessage({ type: "error", text: "Preenche as datas de início e fim." });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`${API}/figurinos/${figurinoId}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilizador_id: UTILIZADOR_ID,
          data_inicio: dataInicio,
          data_fim: dataFim,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Erro ao fazer pedido.";
        setMessage({ type: "error", text: errorText });
        return;
      }

      // Navega para a página de sucesso com o id do pedido
      onNavigate?.("pedido-sucesso", data.id);
    } catch {
      setMessage({ type: "error", text: "Não foi possível ligar ao servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="costume-detail-page">
      <HeaderGlobal />

      <main className="costume-detail__background">

        <img
          src="/images/Entartes-5.png"
          alt=""
          className="costume-detail__bg-image"
        />
        <div className="costume-detail__bg-overlay" />

        <div className="costume-detail__card">

          {/* BOTÃO VOLTAR */}
          <button
            className="costume-detail__back-btn"
            onClick={() => onNavigate?.("figurinos")}
          >
            ←
          </button>

          {/* IMAGEM */}
          <img
            src={figurino?.imagem ?? "/images/figurino1.png"}
            alt={figurino?.titulo ?? "Figurino"}
            className="costume-detail__image"
          />

          {/* PREÇO E TAMANHO */}
          <div className="costume-detail__info-row">
            <div className="costume-detail__info-field">
              <span className="costume-detail__info-label">Preço/dia</span>
              <span className="costume-detail__info-value">
                {figurino?.valor_por_dia ? `${figurino.valor_por_dia} €` : "25 €"}
              </span>
            </div>
            <div className="costume-detail__info-field">
              <span className="costume-detail__info-label">Tamanho</span>
              <span className="costume-detail__info-value">
                {figurino?.tamanho ?? "XL"}
              </span>
            </div>
          </div>

          {/* DATAS */}
          <div className="costume-detail__dates-row">
            <div className="costume-detail__date-field">
              <input
                type="date"
                placeholder="Início"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"
                  stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#666"
                  strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="costume-detail__date-field">
              <input
                type="date"
                placeholder="Fim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"
                  stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#666"
                  strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* FAZER PEDIDO */}
          <button
            className="costume-detail__order-btn"
            onClick={handleFazerPedido}
            disabled={loading}
          >
            {loading ? "A processar..." : "Fazer pedido"}
          </button>

          {/* MENSAGEM */}
          {message && (
            <p className={`costume-detail__message costume-detail__message--${message.type}`}>
              {message.text}
            </p>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}