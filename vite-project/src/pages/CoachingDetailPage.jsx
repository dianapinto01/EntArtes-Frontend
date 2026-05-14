import { useState } from "react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import { cancelCoachingRequest } from "../api";
import "../styles/coachingstyle.css";
import "../styles/coachingdetailstyle.css";

function formatHora(h) {
  return h ? h.slice(0, 5) : "—";
}

export default function CoachingDetailPage({ request, onBack, setMessage }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);

  if (!request) {
    return (
      <div className="page">
        <HeaderGlobal />
        <main className="cb-main">
          <img src="/images/Entartes-5.png" alt="" className="cb-bg" />
          <div className="cb-overlay" />
          <p style={{ position: "relative", zIndex: 2, color: "#fff" }}>Pedido não encontrado</p>
        </main>
        <Footer />
      </div>
    );
  }

  const professor  = request.professor?.utilizador?.nome || request.professor?.nome || request.professor || "—";
  const modalidade = request.modalidade?.nome || "—";
  const hora       = formatHora(request.hora_inicio);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelCoachingRequest(request.id);
      setMessage?.({ type: "success", text: "Pedido cancelado com sucesso!" });
      setTimeout(() => onBack?.(), 1200);
    } catch (err) {
      setMessage?.({ type: "error", text: err.message || "Erro ao cancelar o pedido" });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="page">
      <HeaderGlobal />

      <main className="cb-main">
        <img src="/images/Entartes-5.png" alt="" className="cb-bg" />
        <div className="cb-overlay" />

        <div className="cd-card">
          {/* Header: back arrow + title */}
          <div className="cd-header">
            <button className="cd-back" onClick={onBack} aria-label="Voltar">
              ←
            </button>
            <h2 className="cd-title">{modalidade !== "—" ? modalidade : request.tipo_aula} - {professor}</h2>
          </div>

          {/* Gray pill container */}
          <div className="cd-fields">
            <div className="cd-pill">{hora}</div>
            <div className="cd-pill">{modalidade !== "—" ? modalidade : request.tipo_aula}</div>
            <div className="cd-pill">{professor}</div>
          </div>

          {/* Cancel button */}
          {showConfirm ? (
            <div className="cd-confirm">
              <p>Tem a certeza que deseja desmarcar este pedido?</p>
              <div className="cd-confirm-btns">
                <button
                  className="cd-confirm-cancel"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                >
                  Não
                </button>
                <button
                  className="cd-confirm-ok"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {loading ? "A cancelar..." : "Sim"}
                </button>
              </div>
            </div>
          ) : (
            <button className="cd-btn" onClick={() => setShowConfirm(true)}>
              Desmarcar
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
