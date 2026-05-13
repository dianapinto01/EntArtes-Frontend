import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/coachingstyle.css";
import "../styles/coachingsessionsstyle.css";
import "../styles/professordashboardstyle.css";

const API = "http://localhost:3000/api/v1";
const PER_PAGE = 3;

const NAV_ITEMS_RESPONSAVEL = [
  { label: "Eventos",   desc: "Consulte os eventos disponíveis", path: "/eventos"           },
  { label: "Horário",   desc: "Consulte o seu horário",          path: "/schedule"          },
  { label: "Histórico", desc: "Veja o seu histórico",            path: "/historico"         },
  { label: "Coaching",  desc: "Peça uma sessão de coaching",     path: "/aulas-disponiveis" },
];

const NAV_ITEMS_PROFESSOR = [
  { label: "Coaching",            desc: "Marque aqui sessões privadas",      path: "/coaching"         },
  { label: "Validar sessões",     desc: "Valide as sessões de coaching",     path: "/sessoes-coaching" },
  { label: "Inventário",          desc: "Alugue ou publique o seu figurino", path: null                },
  { label: "Horário",             desc: "Consulte o seu horário",            path: "/schedule"         },
  { label: "Estúdios",            desc: "Consulte os estúdios disponíveis",  path: null                },
  { label: "Estatísticas",        desc: "Confira as estatísticas pessoais",  path: null                },
  { label: "Inserção de horário", desc: "Insira o horário para coachings",   path: null                },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${d}-${m}-${y}`;
}

export default function CoachingSessionsPage() {
  const navigate   = useNavigate();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [sessions,   setSessions]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [validating, setValidating] = useState(null);
  const [message,    setMessage]    = useState(null);
  const [page,       setPage]       = useState(1);

  const auth         = JSON.parse(localStorage.getItem("entartes_auth") || "{}");
  const userId       = auth.user?.id ?? null;
  const responsavelId = auth.user?.responsavel_id ?? null;
  const isProfessor  = !responsavelId;
  const navItems     = isProfessor ? NAV_ITEMS_PROFESSOR : NAV_ITEMS_RESPONSAVEL;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (isProfessor) {
        const res      = await fetch(`${API}/teachers`);
        const teachers = await res.json();
        const prof     = teachers.find(t => t.utilizador_id === userId);
        if (!prof) { setLoading(false); return; }
        url = `${API}/coachings/professor/${prof.id}`;
      } else {
        url = `${API}/coachings/responsavel/${responsavelId}`;
      }

      const res  = await fetch(url);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      showMessage("error", "Não foi possível carregar as sessões.");
    } finally {
      setLoading(false);
    }
  }, [userId, responsavelId, isProfessor]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleValidar = async (sessaoId) => {
    setValidating(sessaoId);
    try {
      const res = await fetch(`${API}/validations/coaching-sessions`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          estado:          "realizada",
          papel_validador: isProfessor ? "professor" : "responsavel",
          sessao_id:       sessaoId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao validar");
      }
      setSessions(prev => prev.filter(s => s.id !== sessaoId));
      showMessage("success", "Sessão validada com sucesso!");
      if (paginated.length === 1 && page > 1) setPage(p => p - 1);
    } catch (err) {
      showMessage("error", err.message || "Não foi possível validar a sessão.");
    } finally {
      setValidating(null);
    }
  };

  const total     = Math.ceil(sessions.length / PER_PAGE);
  const paginated = sessions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      <nav className={`prof-sidebar${menuOpen ? " prof-sidebar--open" : ""}`}>
        {navItems.map(item => (
          <button
            key={item.label}
            type="button"
            className={`prof-nav-item${!item.path ? " prof-nav-item--disabled" : ""}`}
            onClick={() => { if (item.path) { setMenuOpen(false); navigate(item.path); } }}
          >
            <Star size={20} strokeWidth={1.5} className="prof-nav-icon" />
            <span className="prof-nav-text">
              <span className="prof-nav-label">{item.label}</span>
              <span className="prof-nav-desc">{item.desc}</span>
            </span>
          </button>
        ))}
      </nav>

      {menuOpen && (
        <div
          className="prof-sidebar-overlay"
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && setMenuOpen(false)}
        />
      )}

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
            >
              ←
            </button>
            <h2>Sessões de Coaching</h2>
          </div>

          {loading ? (
            <p className="cs-empty">A carregar sessões...</p>
          ) : sessions.length === 0 ? (
            <p className="cs-empty">Sem sessões pendentes de validação</p>
          ) : (
            <div className="cb-list">
              {paginated.map(s => {
                const hora = s.hora_inicio?.slice(0, 5) ?? "";
                return (
                  <div key={s.id} className="cb-card cs-card">
                    <div className="cb-card-top">
                      <span className="cb-card-title">
                        Sessão de Coaching | {formatDate(s.data_inicio)}
                      </span>
                    </div>
                    <p className="cb-card-sub">
                      {isProfessor
                        ? `Aluno: ${s.aluno ?? s.responsavel ?? "—"}`
                        : `Prof. ${s.professor ?? "—"}`
                      }{hora ? ` às ${hora}` : ""}
                    </p>
                    <button
                      type="button"
                      className="cs-validate-btn"
                      disabled={validating === s.id}
                      onClick={() => handleValidar(s.id)}
                    >
                      {validating === s.id ? "A validar..." : "Validar coaching"}
                    </button>
                  </div>
                );
              })}

              {total > 1 && (
                <div className="cb-pagination">
                  {page > 1 && (
                    <button type="button" className="cb-page-btn" onClick={() => setPage(p => p - 1)}>
                      ← Anterior
                    </button>
                  )}
                  <button
                    type="button"
                    className="cb-page-btn"
                    onClick={() => setPage(p => Math.min(total, p + 1))}
                    disabled={page >= total}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
