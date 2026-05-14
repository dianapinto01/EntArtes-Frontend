import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Sidebar from "../components/layout/sidebar";
import Footer from "../components/layout/Footer";
import "../styles/coachingstyle.css";
import "../styles/coachingsessionsstyle.css";
import "../styles/attendancestyle.css";

const API = "http://localhost:3000/api/v1";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${d}-${m}-${y}`;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr.slice(0, 10) === today;
}

export default function AttendancePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const auth = JSON.parse(localStorage.getItem("entartes_auth") || "{}");
  const userId = auth?.user?.id ?? null;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const teachersRes = await fetch(`${API}/teachers`);
      const teachers = await teachersRes.json();
      const prof = (teachers || []).find(t => t.utilizador_id === userId);
      if (!prof) { setLoading(false); return; }

      // Usa /coachings (findActive) para obter TODAS as sessões,
      // incluindo validadas — para presenças o estado de validação não importa
      const res  = await fetch(`${API}/coachings`);
      const data = await res.json();
      const hoje = (Array.isArray(data) ? data : [])
        .filter(s =>
          s.formato === "grupo" &&
          s.professor_id === prof.id &&
          isToday(s.data_inicio)
        )
        .sort((a, b) => (a.hora_inicio ?? "").localeCompare(b.hora_inicio ?? ""));
      setSessions(hoje);
    } catch {
      showMessage("error", "Não foi possível carregar as sessões.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

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
            <h2>Gestão de Presenças</h2>
          </div>

          {loading ? (
            <p className="cs-empty">A carregar sessões...</p>
          ) : sessions.length === 0 ? (
            <p className="cs-empty">Sem sessões de grupo hoje</p>
          ) : (
            <div className="cb-list">
              {sessions.map(s => (
                <div
                  key={s.id}
                  className="cb-card att-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/gestao-presencas/${s.id}`, {
                    state: {
                      titulo: `Sessão de Grupo | ${formatDate(s.data_inicio)}`,
                      hora: s.hora_inicio?.slice(0, 5) ?? "",
                      horaFim: s.hora_fim?.slice(0, 5) ?? "",
                    }
                  })}
                  onKeyDown={e =>
                    (e.key === "Enter" || e.key === " ") &&
                    navigate(`/gestao-presencas/${s.id}`, {
                      state: {
                        titulo: `Sessão de Grupo | ${formatDate(s.data_inicio)}`,
                        hora: s.hora_inicio?.slice(0, 5) ?? "",
                        horaFim: s.hora_fim?.slice(0, 5) ?? "",
                      }
                    })
                  }
                >
                  <div className="cb-card-top">
                    <span className="cb-card-title">
                      Sessão de Grupo | {formatDate(s.data_inicio)}
                    </span>
                    <span className="att-badge-hora">
                      {s.hora_inicio?.slice(0, 5) ?? "—"} – {s.hora_fim?.slice(0, 5) ?? "—"}
                    </span>
                  </div>
                  <p className="cb-card-sub">{s.modalidade ?? "—"}</p>
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
