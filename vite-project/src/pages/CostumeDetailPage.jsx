import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/costumedetailstyle.css";

const API = "http://localhost:3000/api/v1";

const today = new Date().toISOString().split("T")[0];

function getUtilizadorId() {
  try {
    const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
    return auth?.user?.id ?? null;
  } catch {
    return null;
  }
}

export default function CostumeDetailPage() {
  const { id: figurinoId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const imagemFallback = state?.imagem ?? "/images/figurino1.png";
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
    if (dataInicio > dataFim) {
      setMessage({ type: "error", text: "A data de início não pode ser depois da data de fim." });
      return;
    }

    const utilizadorId = getUtilizadorId();
    if (!utilizadorId) {
      setMessage({ type: "error", text: "Tens de estar autenticado para fazer um pedido." });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // 1. Criar a reserva
      const resCreate = await fetch(`${API}/figurinos/${figurinoId}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilizador_id: utilizadorId,
          data_inicio: dataInicio,
          data_fim: dataFim,
        }),
      });

      const reserva = await resCreate.json();

      if (!resCreate.ok) {
        // O HttpExceptionFilter do backend devolve { error: ... }
        // Onde error pode ser uma string ou um objeto { message: string[] }
        const raw = reserva.error;
        const errorText = typeof raw === "string"
          ? raw
          : Array.isArray(raw?.message)
            ? raw.message.join(", ")
            : raw?.message || `Erro ${resCreate.status} ao criar pedido.`;
        setMessage({ type: "error", text: errorText });
        return;
      }

      // 2. Marcar o figurino como indisponível
      const resUpdate = await fetch(`${API}/figurinos/${figurinoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_aluger: "Indisponivel" }),
      });

      if (!resUpdate.ok) {
        const updateBody = await resUpdate.json().catch(() => ({}));
        const raw = updateBody.error;
        const errorText = typeof raw === "string"
          ? raw
          : Array.isArray(raw?.message)
            ? raw.message.join(", ")
            : typeof raw?.message === "string"
              ? raw.message
              : JSON.stringify(raw) || `Erro ${resUpdate.status} ao atualizar figurino.`;
        setMessage({ type: "error", text: errorText });
        return;
      }

      setTimeout(() => navigate("/figurinos"), 1500);
      setMessage({ type: "success", text: "Pedido realizado com sucesso! A redirecionar..." });
      setDataInicio("");
      setDataFim("");
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
            onClick={() => navigate("/figurinos")}
          >
            ←
          </button>

          {/* IMAGEM */}
          <img
            src={figurino?.imagem ?? imagemFallback}
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
                value={dataInicio}
                min={today}
                max={dataFim || undefined}
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
                value={dataFim}
                min={dataInicio || today}
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