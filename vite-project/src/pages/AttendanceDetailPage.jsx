import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Sidebar from "../components/layout/sidebar";
import Footer from "../components/layout/Footer";
import "../styles/coachingstyle.css";
import "../styles/attendancestyle.css";

const API = "http://localhost:3000/api/v1";

export default function AttendanceDetailPage() {
  const navigate   = useNavigate();
  const { sessaoId } = useParams();
  const location   = useLocation();
  const titulo  = location.state?.titulo  ?? "Sessão de Grupo";
  const hora    = location.state?.hora    ?? "";
  const horaFim = location.state?.horaFim ?? "";

  const [menuOpen,  setMenuOpen]  = useState(false);
  const [alunos,    setAlunos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState(null);
  const [message,   setMessage]   = useState(null);

  const auth  = JSON.parse(localStorage.getItem("entartes_auth") || "{}");
  const token = auth?.accessToken ?? null;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/session-students/sessao/${sessaoId}`);
      const data = await res.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch {
      showMessage("error", "Não foi possível carregar os alunos.");
    } finally {
      setLoading(false);
    }
  }, [sessaoId]);

  useEffect(() => { load(); }, [load]);

  const marcar = async (sessaoAlunoId, tipo) => {
    setUpdating(sessaoAlunoId);
    try {
      const res = await fetch(`${API}/session-students/${sessaoAlunoId}/${tipo}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const raw  = body?.message ?? body?.error ?? null;
        const msg  = Array.isArray(raw) ? raw.join(", ") : (raw || `Erro ao marcar ${tipo}`);
        throw new Error(String(msg));
      }
      const updated = await res.json();
      setAlunos(prev =>
        prev.map(a =>
          a.id === sessaoAlunoId
            ? { ...a, estado_participacao: updated.estado_participacao }
            : a
        )
      );
      showMessage("success", tipo === "presenca" ? "Presença marcada!" : "Falta marcada!");
    } catch (err) {
      showMessage("error", err.message || `Erro ao marcar ${tipo}.`);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="cb-main">
        <img src="/images/Entartes-5.png" alt="" className="cb-bg" />
        <div className="cb-overlay" />

        {message && (
          <div className={`cb-alert cb-alert--${message.type}`}>{message.text}</div>
        )}

        <div className="cs-content">
          <div className="cs-header-card">
            <button
              type="button"
              className="cb-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >←</button>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{titulo}</h2>
              {hora && (
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#666" }}>
                  {hora}{horaFim ? ` – ${horaFim}` : ""}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <p className="cs-empty">A carregar alunos...</p>
          ) : alunos.length === 0 ? (
            <p className="cs-empty">Sem alunos nesta sessão</p>
          ) : (
            <div className="att-list">
              {alunos.map(a => {
                const nome     = a.aluno?.nome ?? "—";
                const estado   = a.estado_participacao;
                const initials = nome
                  .split(" ")
                  .map(w => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div key={a.id} className="att-row">
                    <div className="att-avatar">{initials}</div>

                    <span className="att-nome">{nome}</span>

                    {estado && (
                      <span className={`att-badge att-badge--${estado}`}>
                        {estado === "presente" ? "Presente" : "Falta"}
                      </span>
                    )}

                    <div className="att-actions">
                      <button
                        type="button"
                        className={`att-btn att-btn--presente${estado === "presente" ? " att-btn--active" : ""}`}
                        disabled={updating === a.id}
                        onClick={() => marcar(a.id, "presenca")}
                        aria-label="Marcar presença"
                        title="Presença"
                      >✓</button>
                      <button
                        type="button"
                        className={`att-btn att-btn--falta${estado === "falta" ? " att-btn--active" : ""}`}
                        disabled={updating === a.id}
                        onClick={() => marcar(a.id, "falta")}
                        aria-label="Marcar falta"
                        title="Falta"
                      >✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
