import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Pencil } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/professoravailabilitystyle.css";

const API = "http://localhost:3000/api/v1";
const PAGE_SIZE = 4;

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("entartes_auth") || "null");
  } catch {
    return null;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplay(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
}

export default function ProfessorAvailabilityPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const token = auth?.accessToken;

  const [professorId, setProfessorId] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [vagas, setVagas] = useState([]);
  const [editingVaga, setEditingVaga] = useState(null);
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dateInputRef = useRef(null);

  const timeOptions = Array.from({ length: 33 }, (_, i) => {
    const totalMins = 6 * 60 + i * 30;
    const h = String(Math.floor(totalMins / 60)).padStart(2, "0");
    const m = String(totalMins % 60).padStart(2, "0");
    return `${h}:${m}`;
  });

  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    if (!auth?.user?.id) { navigate("/"); return; }
    fetch(`${API}/teachers`)
      .then(r => r.json())
      .then(teachers => {
        const p = teachers.find(t => t.utilizador_id === auth.user.id);
        if (p) setProfessorId(p.id);
      })
      .catch(() => {});
  }, []);

  const loadVagas = useCallback(() => {
    if (!professorId) return;
    const today = todayISO();
    fetch(`${API}/vagas`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter(v => {
          const vProfId = v.professor_id ?? v.professor?.id;
          const vDate = v.data?.slice(0, 10);
          return vProfId === professorId && vDate === today;
        });

        // Deduplicate by time slot — if the same hora_inicio+hora_fim appears twice
        // (once as "disponivel" and once as "ocupado"), keep only the "ocupado" one.
        const seen = new Map();
        for (const v of filtered) {
          const key = `${v.hora_inicio?.slice(0, 5)}-${v.hora_fim?.slice(0, 5)}`;
          const existing = seen.get(key);
          const isOcupado = v.estado !== "disponivel" && v.estado !== "disponível";
          if (!existing || isOcupado) seen.set(key, v);
        }

        const deduped = Array.from(seen.values());
        deduped.sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
        setVagas(deduped);
      })
      .catch(() => setVagas([]));
  }, [professorId]);

  useEffect(() => { loadVagas(); }, [loadVagas]);

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function resetForm() {
    setDate(todayISO());
    setStartTime("10:00");
    setEndTime("18:00");
    setEditingVaga(null);
  }

  function startEdit(vaga) {
    setEditingVaga(vaga);
    setDate(vaga.data?.slice(0, 10) || todayISO());
    setStartTime(vaga.hora_inicio?.slice(0, 5) || "10:00");
    setEndTime(vaga.hora_fim?.slice(0, 5) || "18:00");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      showMessage("error", "Preenche todos os campos");
      return;
    }
    if (startTime >= endTime) {
      showMessage("error", "A hora de início tem de ser anterior à hora de fim");
      return;
    }

    setSubmitting(true);
    try {
      const body = { data: date, hora_inicio: startTime, hora_fim: endTime };

      if (editingVaga) {
        const res = await fetch(`${API}/vagas/${editingVaga.id}`, {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw res;
        showMessage("success", "Horário atualizado com sucesso");
      } else {
        const res = await fetch(`${API}/vagas`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ ...body, professor_id: professorId }),
        });
        if (!res.ok) throw res;
        showMessage("success", "Horário inserido com sucesso");
      }

      resetForm();
      loadVagas();
    } catch (err) {
      const status = err?.status ?? 0;
      const errorMessages = {
        400: "O horário que selecionou já se encontra com vaga.",
        401: "Sessão expirada. Faz login novamente.",
        403: "Não tens permissão para realizar esta ação.",
        422: "Os dados enviados não são válidos.",
        500: "Erro no servidor. Tenta mais tarde.",
      };
      showMessage("error", errorMessages[status] ?? "Erro ao guardar. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    const vaga = vagas.find(v => v.id === id);
    if (vaga && vaga.estado !== "disponivel" && vaga.estado !== "disponível") {
      showMessage("error", "Não é possível eliminar um horário que já está reservado por um aluno.");
      return;
    }
    try {
      await fetch(`${API}/vagas/${id}`, { method: "DELETE", headers: authHeaders });
      if (editingVaga?.id === id) resetForm();
      loadVagas();
      showMessage("success", "Horário eliminado");
    } catch {
      showMessage("error", "Erro ao eliminar");
    }
  }

  const totalPages = Math.ceil(vagas.length / PAGE_SIZE);
  const pageVagas = vagas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      {message && (
        <div className={`pa-alert pa-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      <main className="pa-main">
        <img className="pa-bg" src="/images/paginainicial.png" alt="" aria-hidden="true" />
        <div className="pa-overlay" />

        <div className="pa-content">

          {/* FORM CARD */}
          <div className="pa-form-card">
            <div className="pa-form-header">
              <button
                type="button"
                className="pa-back-btn"
                onClick={() => navigate("/professor")}
              >
                ←
              </button>
              <h2>{editingVaga ? "Editar Horário" : "Inserir Horário"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pa-pill pa-pill--date">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="pa-date-hidden"
                />
                <span className="pa-date-display">{formatDisplay(date)}</span>
                <button
                  type="button"
                  className="pa-pill-icon-btn"
                  onClick={() => dateInputRef.current?.showPicker()}
                  tabIndex={-1}
                  aria-label="Abrir calendário"
                >
                  <Calendar size={16} />
                </button>
              </div>

              <div className="pa-pill-pair">
                <div className="pa-pill pa-pill--half">
                  <Clock size={14} className="pa-pill-icon" />
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  >
                    {timeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <span className="pa-time-sep">→</span>
                <div className="pa-pill pa-pill--half">
                  <Clock size={14} className="pa-pill-icon" />
                  <select
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  >
                    {timeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="pa-submit-btn" disabled={submitting}>
                {submitting ? "A guardar..." : editingVaga ? "Guardar alterações" : "Inserir"}
              </button>

              <button
                type="button"
                className="pa-cancel-btn"
                onClick={resetForm}
                style={{ visibility: editingVaga ? "visible" : "hidden" }}
              >
                Cancelar edição
              </button>
            </form>
          </div>

          {/* LIST */}
          <div className="pa-list-wrapper">
            <div className="pa-list">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => {
                const v = pageVagas[i];
                if (!v) {
                  return vagas.length === 0 && i === 0
                    ? <div key={`empty-${i}`} className="pa-card pa-card--placeholder">Ainda não há horários registados</div>
                    : <div key={`empty-${i}`} className="pa-card pa-card--placeholder" />;
                }
                const isLivre = v.estado === "disponivel" || v.estado === "disponível";
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`pa-card${editingVaga?.id === v.id ? " pa-card--active" : ""}`}
                    onClick={() => startEdit(v)}
                  >
                    <span className="pa-card-text">
                      <span className={`pa-status-dot${isLivre ? " pa-status-dot--livre" : " pa-status-dot--ocupado"}`} />
                      {formatDisplay(v.data)} | Registou horário das {v.hora_inicio?.slice(0, 5)} às {v.hora_fim?.slice(0, 5)}
                    </span>
                    <span className="pa-card-actions">
                      <span
                        role="button"
                        tabIndex={0}
                        className="pa-action-btn"
                        onClick={e => { e.stopPropagation(); startEdit(v); }}
                        onKeyDown={e => (e.key === "Enter" || e.key === " ") && (e.stopPropagation(), startEdit(v))}
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="pa-action-btn pa-action-btn--delete"
                        onClick={e => handleDelete(v.id, e)}
                        onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleDelete(v.id, e)}
                        title="Eliminar"
                      >
                        ✕
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pa-pagination">
              <button
                type="button"
                className="pa-page-btn"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="pa-page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Próxima →
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
