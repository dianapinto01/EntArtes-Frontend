import { useState, useEffect, useCallback } from "react";
import { Search, Calendar, CheckSquare, X } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import "../styles/availablelessionsstyle.css";

const API = "http://localhost:3000/api/v1";
const ITEMS_PER_PAGE = 4;

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1, 2, 3];
  if (current > 4) pages.push("...");
  if (current > 3 && current < total - 2) pages.push(current);
  if (total - 1 > 3 && !pages.includes(total - 1)) pages.push("...");
  pages.push(total - 1, total);
  return [...new Set(pages)];
}

function getAuth() {
  try { return JSON.parse(localStorage.getItem("entartes_auth") || "null"); }
  catch { return null; }
}

export default function AvailableLessonsPage() {
  const navigate        = useNavigate();
  const auth            = getAuth();
  const responsavelId   = auth?.user?.responsavel_id ?? null;

  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [alunos,       setAlunos]       = useState([]);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [message,      setMessage]      = useState(null);

  // Modal de inscrição
  const [modal,        setModal]        = useState(null); // { lesson }
  const [alunoSel,     setAlunoSel]     = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  const showMessage = (type, text) => setMessage({ type, text });

  // Carregar sessões disponíveis
  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/coachings`);
      const data = res.ok ? await res.json() : [];
      const now  = new Date();
      const futuras = (Array.isArray(data) ? data : [])
        .filter(s => s.data_inicio && new Date(s.data_inicio) > now)
        .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
      setLessons(futuras);
    } catch {
      showMessage("error", "Erro ao carregar sessões.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar alunos do responsável
  useEffect(() => {
    loadLessons();
    if (!responsavelId) return;
    fetch(`${API}/session-students/responsavel/${responsavelId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setAlunos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [loadLessons, responsavelId]);

  // Filtros
  const filtered = lessons.filter(l => {
    const vagas = (l.max_alunos ?? 0) - (l.inscritos ?? 0);
    if (vagas <= 0) return false;
    const titulo = `${l.modalidade ?? ""} - ${l.professor ?? ""}`;
    const matchName = !searchTerm || titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = !selectedDate || (l.data_inicio ?? "").slice(0, 10) === selectedDate;
    return matchName && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page       = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const pages      = buildPageNumbers(page, totalPages);

  // Abrir modal de inscrição
  const handleEnrollClick = (lesson) => {
    if (!responsavelId) {
      showMessage("error", "Precisas de estar autenticado como responsável.");
      return;
    }
    if (alunos.length === 0) {
      showMessage("error", "Não tens alunos associados à tua conta.");
      return;
    }
    const vagas = (lesson.max_alunos ?? 0) - (lesson.inscritos ?? 0);
    if (vagas <= 0) {
      showMessage("error", "Esta sessão já não tem vagas disponíveis.");
      return;
    }
    setAlunoSel(alunos.length === 1 ? String(alunos[0].id) : "");
    setModal({ lesson });
  };

  // Confirmar inscrição
  const handleConfirm = async () => {
    if (!alunoSel) { showMessage("error", "Seleciona um aluno."); return; }
    const { lesson } = modal;
    setSubmitting(true);
    try {
      const dataStr    = (lesson.data_inicio ?? "").slice(0, 10);
      const horaInicio = (lesson.hora_inicio ?? "").slice(0, 5);
      const horaFim    = (lesson.hora_fim    ?? "").slice(0, 5);

      const res = await fetch(`${API}/pedidos-coaching`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          responsavel_id: responsavelId,
          aluno_id:       Number(alunoSel),
          professor_id:   lesson.professor_id,
          data:           dataStr,
          hora_inicio:    horaInicio,
          hora_fim:       horaFim,
          tipo_aula:      lesson.formato ?? "individual",
          modalidade_id:  lesson.modalidade_id ?? undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao criar pedido.");
      }

      showMessage("success", "Pedido de inscrição enviado com sucesso!");
      setModal(null);
      loadLessons();
    } catch (err) {
      showMessage("error", err.message || "Erro ao inscrever.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <HeaderGlobal />

      <main className="al-main">
        <img src="/images/Entartes-5.png" alt="" className="al-bg" />
        <div className="al-overlay" />

        {message && (
          <div className={`al-alert al-alert--${message.type}`}>{message.text}</div>
        )}

        <div className="al-coaching-btn-wrap">
          <button
            type="button"
            className="al-coaching-btn"
            onClick={() => navigate("/coaching-booking")}
          >
            Pedidos de coaching
            <span className="al-coaching-plus">+</span>
          </button>
        </div>

        <div className="al-content">
          <div className="al-toolbar">
            <div className="al-search-pill">
              <input
                type="text"
                placeholder="Nome da aula"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <Search size={16} strokeWidth={2} />
            </div>
            <div className="al-date-pill">
              <input
                type="date"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setCurrentPage(1); }}
              />
              <Calendar size={16} strokeWidth={2} />
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>A carregar sessões...</p>
          ) : (
            <div className="al-grid">
              {paginated.length === 0 ? (
                <p className="al-empty">Nenhuma sessão disponível</p>
              ) : (
                paginated.map(lesson => {
                  const vagas = (lesson.max_alunos ?? 0) - (lesson.inscritos ?? 0);
                  const titulo = `${lesson.modalidade ?? "Coaching"} - Prof. ${lesson.professor ?? "—"}`;
                  return (
                    <article key={lesson.id} className="al-card">
                      <h3 className="al-card__title">{titulo}</h3>
                      <p className="al-card__info">
                        {(lesson.data_inicio ?? "").slice(0, 10).split("-").reverse().join("/")} · {(lesson.hora_inicio ?? "").slice(0, 5)} - {vagas} vaga{vagas !== 1 ? "s" : ""}
                      </p>
                      <button
                        type="button"
                        className={`al-card__btn${vagas <= 0 ? " al-card__btn--enrolled" : ""}`}
                        onClick={() => handleEnrollClick(lesson)}
                        disabled={vagas <= 0}
                      >
                        {vagas <= 0 ? "Sem vagas" : "Inscrever"}
                        <CheckSquare size={16} strokeWidth={2} />
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="al-pagination">
              <button
                type="button"
                className="al-page-nav"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="al-page-dots">...</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`al-page-num${p === page ? " al-page-num--active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                className="al-page-nav"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de inscrição */}
      {modal && (
        <div className="al-modal-overlay" onClick={() => setModal(null)}>
          <div className="al-modal" onClick={e => e.stopPropagation()}>
            <div className="al-modal__header">
              <h3>Inscrever aluno</h3>
              <button type="button" className="al-modal__close" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="al-modal__info">
              {modal.lesson.modalidade} — {(modal.lesson.hora_inicio ?? "").slice(0, 5)} | Prof. {modal.lesson.professor}
            </p>
            {alunos.length > 1 && (
              <select
                className="al-modal__select"
                value={alunoSel}
                onChange={e => setAlunoSel(e.target.value)}
              >
                <option value="">Seleciona o aluno</option>
                {alunos.map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            )}
            {alunos.length === 1 && (
              <p className="al-modal__aluno">{alunos[0].nome}</p>
            )}
            <button
              type="button"
              className="al-modal__btn"
              onClick={handleConfirm}
              disabled={submitting || !alunoSel}
            >
              {submitting ? "A inscrever..." : "Confirmar inscrição"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
