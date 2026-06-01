import { useState, useEffect, useCallback } from "react";
import { Search, Calendar, CheckSquare, X } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Sidebar from "../components/layout/sidebar";
import Footer from "../components/layout/Footer";
import CoachingForm from "../components/coaching/CoachingForm";
import "../styles/coachingstyle.css";
import "../styles/professordashboardstyle.css";
import "../styles/availablelessionsstyle.css";
import "../styles/coachingsessaoalunosstyle.css";

const API = "http://localhost:3000/api/v1";
const ITEMS_PER_PAGE = 4;

function getAuth() {
  try { return JSON.parse(localStorage.getItem("entartes_auth") || "null"); }
  catch { return null; }
}

export default function CoachingBookingPage() {
  const auth          = getAuth();
  const responsavelId = auth?.user?.responsavel_id ?? null;

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [message,     setMessage]     = useState(null);

  // Sessions state
  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [alunos,       setAlunos]       = useState([]);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);

  // Enrollment modal
  const [modal,        setModal]        = useState(null);
  const [alunoSel,     setAlunoSel]     = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  // Detail modal
  const [detailModal,   setDetailModal]   = useState(null);
  const [sessionAlunos, setSessionAlunos] = useState([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const showMessage = (type, text) => setMessage({ type, text });

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

  useEffect(() => {
    loadLessons();
    if (!responsavelId) return;
    fetch(`${API}/session-students/responsavel/${responsavelId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setAlunos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [loadLessons, responsavelId]);

  const filtered = lessons.filter(l => {
    const vagas = (l.max_alunos ?? 0) - (l.inscritos ?? 0);
    if (vagas <= 0) return false;
    // Sessões de grupo com alunos permitidos só são visíveis para esses alunos
    const permitidos = l.alunos_permitidos ?? [];
    if (permitidos.length > 0) {
      const alunoIds = alunos.map(a => a.id);
      if (!alunoIds.some(id => permitidos.some(p => p.id === id))) return false;
    }
    const titulo = `${l.modalidade ?? ""} - ${l.professor ?? ""}`;
    const matchName = !searchTerm || titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = !selectedDate || (l.data_inicio ?? "").slice(0, 10) === selectedDate;
    return matchName && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page       = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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

  const handleDetailClick = async (lesson) => {
    setDetailModal(lesson);
    setSessionAlunos([]);
    setLoadingAlunos(true);
    try {
      const res  = await fetch(`${API}/session-students/sessao/${lesson.id}`);
      const data = res.ok ? await res.json() : [];
      setSessionAlunos(Array.isArray(data) ? data : []);
    } catch {
      setSessionAlunos([]);
    } finally {
      setLoadingAlunos(false);
    }
  };

  function initials(nome) {
    return (nome ?? "")
      .split(" ")
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? "")
      .join("");
  }

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

        <div className="cb-content">
          <CoachingForm
            onCreated={() => { loadLessons(); }}
            setMessage={setMessage}
          />

          <div className="cb-sessions-panel">
            <h3 className="cb-sessions-title">Aulas disponíveis</h3>

            <div className="cb-sessions-toolbar">
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
              <p style={{ color: "#fff", fontSize: "0.9rem" }}>A carregar sessões...</p>
            ) : (
              <div className="cb-sessions-list">
                {paginated.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", padding: "20px 0", fontSize: "0.9rem" }}>
                    Nenhuma sessão disponível
                  </p>
                ) : (
                  paginated.map(lesson => {
                    const vagas = (lesson.max_alunos ?? 0) - (lesson.inscritos ?? 0);
                    const titulo = `${lesson.modalidade ?? "Coaching"} - Prof. ${lesson.professor ?? "—"}`;
                    return (
                      <div
                        key={lesson.id}
                        className="cb-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => handleDetailClick(lesson)}
                        onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleDetailClick(lesson)}
                      >
                        <div className="cb-card-top">
                          <span className="cb-card-title">{titulo}</span>
                          <span className="cb-badge cb-badge--pendente">
                            {vagas} vaga{vagas !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="cb-card-sub">
                          {(lesson.data_inicio ?? "").slice(0, 10).split("-").reverse().join("/")} · {(lesson.hora_inicio ?? "").slice(0, 5)}
                        </p>
                        <button
                          type="button"
                          className={`al-card__btn${vagas <= 0 ? " al-card__btn--enrolled" : ""}`}
                          onClick={e => { e.stopPropagation(); handleEnrollClick(lesson); }}
                          disabled={vagas <= 0}
                        >
                          {vagas <= 0 ? "Sem vagas" : "Inscrever"}
                          <CheckSquare size={16} strokeWidth={2} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="cb-pagination">
                {page > 1 && (
                  <button type="button" className="cb-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    ← Anterior
                  </button>
                )}
                <button
                  type="button"
                  className="cb-page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {detailModal && (
        <div className="cb-detail-overlay" onClick={() => setDetailModal(null)}>
          <div className="cb-detail-card" onClick={e => e.stopPropagation()}>
            <div className="csa-header">
              <button
                type="button"
                className="csa-back-btn"
                onClick={() => setDetailModal(null)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
              <h2 className="csa-title">
                {detailModal.modalidade ?? "Coaching"} — Prof. {detailModal.professor ?? "—"}
              </h2>
            </div>

            <div className="cb-detail-info">
              <div className="cb-detail-row">
                <span>Data</span>
                <span>{(detailModal.data_inicio ?? "").slice(0, 10).split("-").reverse().join("/")}</span>
              </div>
              <div className="cb-detail-row">
                <span>Horário</span>
                <span>{(detailModal.hora_inicio ?? "").slice(0, 5)} – {(detailModal.hora_fim ?? "").slice(0, 5)}</span>
              </div>
              <div className="cb-detail-row">
                <span>Modalidade</span>
                <span>{detailModal.modalidade ?? "—"}</span>
              </div>
              {detailModal.estudio && (
                <div className="cb-detail-row">
                  <span>Estúdio</span>
                  <span>{detailModal.estudio}</span>
                </div>
              )}
              <div className="cb-detail-row">
                <span>Formato</span>
                <span style={{ textTransform: "capitalize" }}>{detailModal.formato ?? "—"}</span>
              </div>
            </div>

            {(detailModal.alunos_permitidos ?? []).length > 0 && (
              <>
                <p className="cb-detail-section-title">Alunos permitidos</p>
                <div className="csa-list">
                  {detailModal.alunos_permitidos.map(p => (
                    <div key={p.id} className="csa-aluno-row">
                      <div className="csa-avatar">{initials(p.nome)}</div>
                      <div className="csa-aluno-info">
                        <span className="csa-aluno-nome">{p.nome ?? "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="cb-detail-section-title">Alunos inscritos</p>

            {loadingAlunos ? (
              <p className="csa-loading">A carregar alunos...</p>
            ) : sessionAlunos.length === 0 ? (
              <p className="csa-empty">Sem alunos inscritos nesta sessão.</p>
            ) : (
              <div className="csa-list">
                {sessionAlunos.map(entry => (
                  <div key={entry.id} className="csa-aluno-row">
                    <div className="csa-avatar">{initials(entry.aluno?.nome)}</div>
                    <div className="csa-aluno-info">
                      <span className="csa-aluno-nome">{entry.aluno?.nome ?? "—"}</span>
                      {detailModal.modalidade && (
                        <span className="csa-aluno-modalidade">{detailModal.modalidade}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
