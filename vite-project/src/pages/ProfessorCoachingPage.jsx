import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Calendar, Clock, Users, Building2 } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import {
  getTeachers,
  getStudios,
  getModalities,
  getProfessorVagas,
  createCoachingSessionDireto,
} from "../api";
import "../styles/professorcoachingstyle.css";
import "../styles/professordashboardstyle.css";

const NAV_ITEMS = [
  { label: "Coaching",            desc: "Marque aqui sessões privadas",       path: "/coaching"         },
  { label: "Validar sessões",     desc: "Valide as sessões de coaching",      path: "/sessoes-coaching" },
  { label: "Inventário",          desc: "Alugue ou publique o seu figurino",  path: null                },
  { label: "Horário",             desc: "Consulte o seu horário",             path: "/schedule"         },
  { label: "Estúdios",            desc: "Consulte os estúdios disponíveis",   path: null                },
  { label: "Estatísticas",        desc: "Confira as estatísticas pessoais",   path: null                },
  { label: "Inserção de horário", desc: "Insira o horário para coachings",    path: "/inserir-horario"  },
];

const MOCK_REQUESTS = [
  { id: 1, nome: "Ana",    hora: "16:00", aceite: false },
  { id: 2, nome: "João",   hora: "17:00", aceite: true  },
  { id: 3, nome: "Inês",   hora: "18:00", aceite: false },
  { id: 4, nome: "Maria",  hora: "19:00", aceite: false },
  { id: 5, nome: "Carlos", hora: "20:00", aceite: true  },
  { id: 6, nome: "Sofia",  hora: "21:00", aceite: false },
];

const ITEMS_PER_PAGE = 3;

function norm(s) {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function getAuth() {
  try { return JSON.parse(localStorage.getItem("entartes_auth") || "null"); }
  catch { return null; }
}

export default function ProfessorCoachingPage() {
  const navigate  = useNavigate();
  const auth      = getAuth();
  const userId    = auth?.user?.id ?? null;
  const token     = auth?.accessToken ?? null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [message,  setMessage]  = useState(null);
  const [page,     setPage]     = useState(0);

  // --- dados carregados ---
  const [professor,    setProfessor]   = useState(null);   // { id, modalidade }
  const [allStudios,   setAllStudios]  = useState([]);     // todos os estúdios
  const [allVagas,     setAllVagas]    = useState([]);     // vagas do professor disponíveis
  const [loading,      setLoading]     = useState(true);

  // --- campos do formulário ---
  const [estudioId,    setEstudioId]   = useState("");
  const [modalidadeId, setModalidadeId]= useState("");
  const [data,         setData]        = useState("");
  const [vagaId,       setVagaId]      = useState("");
  const [numAlunos,    setNumAlunos]   = useState("");
  const [submitting,   setSubmitting]  = useState(false);

  // --- toggles mock (lista da direita) ---
  const [aceites, setAceites] = useState(() =>
    Object.fromEntries(MOCK_REQUESTS.map(r => [r.id, r.aceite]))
  );

  // ── Carregar dados iniciais ──
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    (async () => {
      try {
        const [teachers, studios] = await Promise.all([
          getTeachers(),
          getStudios(),
        ]);

        const prof = (teachers || []).find(t => t.utilizador_id === userId);
        if (!prof) { setLoading(false); return; }

        setProfessor({ id: prof.id, modalidade: prof.modalidade ?? "" });

        // estúdios compatíveis com a modalidade do professor
        const profModalNorm = norm(prof.modalidade);
        const compatible = (studios || []).filter(s =>
          s.estado === "operacional" &&
          (s.modalidades || []).some(m => norm(m.nome) === profModalNorm)
        );
        setAllStudios(compatible);

        // vagas disponíveis do professor
        const vagas = await getProfessorVagas(prof.id);
        setAllVagas(vagas);
      } catch {
        showMessage("error", "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // ── Modalidades do estúdio selecionado (filtradas pela modalidade do professor) ──
  const modalidadesDisponiveis = useMemo(() => {
    if (!estudioId || !professor) return [];
    const studio = allStudios.find(s => String(s.id) === String(estudioId));
    if (!studio) return [];
    const profNorm = norm(professor.modalidade);
    return (studio.modalidades || []).filter(m => norm(m.nome) === profNorm);
  }, [estudioId, allStudios, professor]);

  // ── Vagas disponíveis para a data selecionada ──
  const vagasForDate = useMemo(() => {
    if (!data || !professor) return [];
    return allVagas.filter(v => (v.data ?? "").slice(0, 10) === data);
  }, [data, allVagas, professor]);

  // Limpar vaga selecionada quando a data muda
  useEffect(() => { setVagaId(""); }, [data]);

  // Limpar modalidade quando estúdio muda
  useEffect(() => { setModalidadeId(""); }, [estudioId]);

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  const handleToggle = (id) => {
    setAceites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMarcar = async (e) => {
    e.preventDefault();
    if (!estudioId)    return showMessage("error", "Seleciona um estúdio.");
    if (!modalidadeId) return showMessage("error", "Seleciona o tipo de aula.");
    if (!data)         return showMessage("error", "Seleciona uma data.");
    if (!vagaId)       return showMessage("error", "Seleciona um horário disponível.");
    if (!numAlunos || Number(numAlunos) < 1) return showMessage("error", "Indica o número de alunos.");

    setSubmitting(true);
    try {
      await createCoachingSessionDireto({
        vaga_id:       Number(vagaId),
        estudio_id:    Number(estudioId),
        modalidade_id: Number(modalidadeId),
        max_alunos:    Number(numAlunos),
        formato:       "individual",
      });
      showMessage("success", "Sessão de coaching criada com sucesso!");
      // limpar formulário e recarregar vagas
      setEstudioId(""); setModalidadeId(""); setData(""); setVagaId(""); setNumAlunos("");
      const vagas = await getProfessorVagas(professor.id);
      setAllVagas(vagas);
    } catch (err) {
      showMessage("error", err.message || "Erro ao criar sessão.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Paginação da lista de pedidos ──
  const totalPages = Math.ceil(MOCK_REQUESTS.length / ITEMS_PER_PAGE);
  const pageItems  = MOCK_REQUESTS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  // ── Vaga selecionada (para mostrar hora no field) ──
  const vagaSelecionada = allVagas.find(v => String(v.id) === String(vagaId));

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      <nav className={`prof-sidebar${menuOpen ? " prof-sidebar--open" : ""}`}>
        {NAV_ITEMS.map(item => (
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

      <main className="pc-main">
        <img src="/images/paginainicial.png" alt="" className="pc-bg" />
        <div className="pc-overlay" />

        {message && (
          <div className={`pc-alert pc-alert--${message.type}`}>{message.text}</div>
        )}

        {/* Botão topo-direito */}
        <div className="pc-coaching-btn-wrap">
          <button
            type="button"
            className="pc-coaching-btn"
            onClick={() => navigate("/coaching-requests")}
          >
            Pedidos de coaching
            <span className="pc-coaching-plus">+</span>
          </button>
        </div>

        {/* Layout de duas colunas */}
        <div className="pc-content">

          {/* ESQUERDA: formulário */}
          <div className="pc-form-card">
            <h2 className="pc-form-title">Marcação de coachings</h2>

            {loading ? (
              <p style={{ textAlign: "center", color: "#888", fontSize: "0.9rem" }}>
                A carregar dados...
              </p>
            ) : (
              <form onSubmit={handleMarcar}>

                {/* Estúdio */}
                <div className="pc-form-row">
                  <span className="pc-form-label">Estúdio:</span>
                  <div className="pc-pill">
                    <select
                      value={estudioId}
                      onChange={e => setEstudioId(e.target.value)}
                    >
                      <option value="">Seleciona</option>
                      {allStudios.map(s => (
                        <option key={s.id} value={s.id}>{s.nome}</option>
                      ))}
                    </select>
                    <Building2 size={15} className="pc-pill-icon" />
                  </div>
                </div>

                {/* Tipo da aula (modalidade) — filtrado pelo estúdio */}
                <div className="pc-form-row">
                  <span className="pc-form-label">Tipo da aula:</span>
                  <div className="pc-pill">
                    <select
                      value={modalidadeId}
                      onChange={e => setModalidadeId(e.target.value)}
                      disabled={!estudioId}
                    >
                      <option value="">
                        {estudioId ? "Seleciona" : "Escolhe estúdio primeiro"}
                      </option>
                      {modalidadesDisponiveis.map(m => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Data */}
                <div className="pc-form-row">
                  <span className="pc-form-label">Data da aula:</span>
                  <div className="pc-pill">
                    <input
                      type="date"
                      value={data}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={e => setData(e.target.value)}
                    />
                    <Calendar size={15} className="pc-pill-icon" />
                  </div>
                </div>

                {/* Horário — só vagas disponíveis nessa data */}
                <div className="pc-form-row">
                  <span className="pc-form-label">Horário da aula:</span>
                  <div className="pc-pill">
                    <select
                      value={vagaId}
                      onChange={e => setVagaId(e.target.value)}
                      disabled={!data}
                    >
                      <option value="">
                        {data
                          ? vagasForDate.length === 0
                            ? "Sem vagas neste dia"
                            : "Seleciona"
                          : "Escolhe data primeiro"}
                      </option>
                      {vagasForDate.map(v => (
                        <option key={v.id} value={v.id}>
                          {(v.hora_inicio ?? "").slice(0, 5)} – {(v.hora_fim ?? "").slice(0, 5)}
                        </option>
                      ))}
                    </select>
                    <Clock size={15} className="pc-pill-icon" />
                  </div>
                </div>

                {/* Número de alunos */}
                <div className="pc-form-row">
                  <span className="pc-form-label">Nº de alunos:</span>
                  <div className="pc-pill">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={numAlunos}
                      onChange={e => setNumAlunos(e.target.value)}
                      placeholder="máx. alunos"
                    />
                    <Users size={15} className="pc-pill-icon" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="pc-marcar-btn"
                  disabled={submitting}
                >
                  {submitting ? "A criar..." : "✓ Marcar"}
                </button>
              </form>
            )}
          </div>

          {/* DIREITA: lista com toggles (mock — ligação futura) */}
          <div className="pc-right">
            <div className="pc-list">
              {pageItems.map(req => (
                <div key={req.id} className="pc-request-card">
                  <span className="pc-request-name">
                    Aula - {req.nome} às {req.hora}
                  </span>
                  <label className="pc-toggle">
                    <input
                      type="checkbox"
                      checked={aceites[req.id] || false}
                      onChange={() => handleToggle(req.id)}
                    />
                    <span className="pc-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>

            <div className="pc-pagination">
              <button
                type="button"
                className="pc-next-btn"
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
