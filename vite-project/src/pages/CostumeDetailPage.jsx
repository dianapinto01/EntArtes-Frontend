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

function calcDias(inicio, fim) {
  if (!inicio || !fim) return 0;
  const diff = Math.ceil((new Date(fim) - new Date(inicio)) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

export default function CostumeDetailPage() {
  const { id: figurinoId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const imagemFallback = state?.imagem ?? "/images/figurino1.png";

  const [figurino, setFigurino] = useState(null);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState(1);
  const [quantidadePedida, setQuantidadePedida] = useState(1);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!figurinoId) return;
    Promise.all([
      fetch(`${API}/figurinos/${figurinoId}`).then(r => r.json()),
      fetch(`${API}/figurinos/${figurinoId}/reservas`).then(r => r.json()).catch(() => []),
    ]).then(([fig, reservas]) => {
      setFigurino(fig);
      const total = fig?.quantidade ?? 1;
      const ativas = Array.isArray(reservas)
        ? reservas.filter(r => r.estado !== "Cancelada" && r.estado !== "Devolvida")
        : [];
      const reservado = ativas.reduce((sum, r) => sum + (r.quantidade ?? 1), 0);
      const disponivel = Math.max(0, total - reservado);
      setQuantidadeDisponivel(disponivel);
      setQuantidadePedida(disponivel > 0 ? 1 : 0);
    }).catch(() => setFigurino(null));
  }, [figurinoId]);

  const dias = calcDias(dataInicio, dataFim);
  const precoEstimado =
    figurino?.valor_por_dia && quantidadePedida > 0 && dias > 0
      ? (figurino.valor_por_dia * quantidadePedida * dias).toFixed(2)
      : null;

  const handleFazerPedido = async () => {
    if (!dataInicio || !dataFim) {
      setMessage({ type: "error", text: "Preenche as datas de início e fim." });
      return;
    }
    if (dataInicio > dataFim) {
      setMessage({ type: "error", text: "A data de início não pode ser depois da data de fim." });
      return;
    }
    if (quantidadePedida < 1 || quantidadePedida > quantidadeDisponivel) {
      setMessage({ type: "error", text: `Escolhe uma quantidade entre 1 e ${quantidadeDisponivel}.` });
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

      const resCreate = await fetch(`${API}/figurinos/${figurinoId}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilizador_id: utilizadorId,
          data_inicio: dataInicio,
          data_fim: dataFim,
          quantidade: quantidadePedida,
        }),
      });

      const reserva = await resCreate.json();

      if (!resCreate.ok) {
        const raw = reserva.error;
        const errorText = typeof raw === "string"
          ? raw
          : Array.isArray(raw?.message)
            ? raw.message.join(", ")
            : raw?.message || `Erro ${resCreate.status} ao criar pedido.`;
        setMessage({ type: "error", text: errorText });
        return;
      }

      // O backend trata automaticamente de marcar o figurino como Indisponivel se o stock esgotar
      setMessage({ type: "success", text: "Pedido realizado com sucesso! A redirecionar..." });
      setDataInicio("");
      setDataFim("");
      setTimeout(() => navigate("/figurinos"), 1500);
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
        <img src="/images/Entartes-6.png" alt="" className="costume-detail__bg-image" />
        <div className="costume-detail__bg-overlay" />

        <div className="costume-detail__card">
          <button className="costume-detail__back-btn" onClick={() => navigate("/figurinos")}>
            ←
          </button>

          <img
            src={figurino?.imagem ?? imagemFallback}
            alt={figurino?.titulo ?? "Figurino"}
            className="costume-detail__image"
          />

          {/* INFO: preço, tamanho, disponíveis */}
          <div className="costume-detail__info-row">
            <div className="costume-detail__info-field">
              <span className="costume-detail__info-label">Preço/dia</span>
              <span className="costume-detail__info-value">
                {figurino?.valor_por_dia ? `${figurino.valor_por_dia} €` : "—"}
              </span>
            </div>
            <div className="costume-detail__info-field">
              <span className="costume-detail__info-label">Tamanho</span>
              <span className="costume-detail__info-value">{figurino?.tamanho ?? "—"}</span>
            </div>
            <div className="costume-detail__info-field">
              <span className="costume-detail__info-label">Disponíveis</span>
              <span className="costume-detail__info-value">{quantidadeDisponivel}</span>
            </div>
          </div>

          {/* SELETOR DE QUANTIDADE (só aparece se houver mais de 1 disponível) */}
          {quantidadeDisponivel > 1 && (
            <div className="costume-detail__qty-row">
              <span className="costume-detail__qty-label">Quantidade</span>
              <div className="costume-detail__qty-controls">
                <button
                  type="button"
                  className="costume-detail__qty-btn"
                  onClick={() => setQuantidadePedida(q => Math.max(1, q - 1))}
                  disabled={quantidadePedida <= 1}
                >
                  −
                </button>
                <span className="costume-detail__qty-value">{quantidadePedida}</span>
                <button
                  type="button"
                  className="costume-detail__qty-btn"
                  onClick={() => setQuantidadePedida(q => Math.min(quantidadeDisponivel, q + 1))}
                  disabled={quantidadePedida >= quantidadeDisponivel}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* DATAS */}
          <div className="costume-detail__dates-row">
            <div className="costume-detail__date-field">
              <input
                type="date"
                value={dataInicio}
                min={today}
                max={dataFim || undefined}
                onChange={e => setDataInicio(e.target.value)}
              />
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="costume-detail__date-field">
              <input
                type="date"
                value={dataFim}
                min={dataInicio || today}
                onChange={e => setDataFim(e.target.value)}
              />
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* ESTIMATIVA DE PREÇO */}
          {precoEstimado && (
            <div className="costume-detail__price-estimate">
              <span className="costume-detail__price-total">{precoEstimado} €</span>
              <span className="costume-detail__price-detail">
                {quantidadePedida} un. × {dias} {dias === 1 ? "dia" : "dias"} × {figurino.valor_por_dia} €
              </span>
            </div>
          )}

          {/* BOTÃO */}
          <button
            className="costume-detail__order-btn"
            onClick={handleFazerPedido}
            disabled={loading || quantidadeDisponivel === 0}
          >
            {quantidadeDisponivel === 0
              ? "Sem stock disponível"
              : loading
                ? "A processar..."
                : "Fazer pedido"}
          </button>

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
