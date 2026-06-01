import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, Building2 } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Sidebar from "../components/layout/sidebar";
import Footer from "../components/layout/Footer";
import {
  getTeachers,
  getStudios,
  getModalities,
  getProfessorVagas,
  createCoachingSessionDireto,
  getAllAlunos,
} from "../api";
import "../styles/professorcoachingstyle.css";
import "../styles/professordashboardstyle.css";


const API = "http://localhost:3000/api/v1";
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
  const [pageInd,  setPageInd]  = useState(0);
  const [pageGrp,  setPageGrp]  = useState(0);

  // --- dados carregados ---
  const [professor,       setProfessor]      = useState(null);   // { id, modalidade }
  const [allStudios,      setAllStudios]     = useState([]);     // todos os estúdios
  const [allVagas,        setAllVagas]       = useState([]);     // vagas do professor disponíveis
  const [todosAlunos,     setTodosAlunos]    = useState([]);     // todos os alunos (para seleção)
  const [loading,         setLoading]        = useState(true);

  // --- campos do formulário ---
  const [estudioId,       setEstudioId]      = useState("");
  const [modalidadeId,    setModalidadeId]   = useState("");
  const [data,            setData]           = useState("");
  const [vagaId,          setVagaId]         = useState("");
  const [numAlunos,       setNumAlunos]      = useState("");
  const [alunosPermitidos, setAlunosPermitidos] = useState([]);
  const [submitting,      setSubmitting]     = useState(false);

  // --- pedidos aceites (lista da direita) ---
  const [pedidosAceites, setPedidosAceites] = useState([]);

  // ── Carregar dados iniciais ──
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    (async () => {
      try {
        const [teachers, studios, alunos] = await Promise.all([
          getTeachers(),
          getStudios(),
          getAllAlunos(),
        ]);
        setTodosAlunos(Array.isArray(alunos) ? alunos : []);

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

        // sessões de coaching futuras do professor
        const sessoesRes = await fetch(`${API}/coachings/professor/${prof.id}`);
        const sessoes = sessoesRes.ok ? await sessoesRes.json() : [];
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const visiveis = (Array.isArray(sessoes) ? sessoes : [])
          .filter(s => s.data_inicio && new Date(s.data_inicio) >= cutoff)
          .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
        setPedidosAceites(visiveis);
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

  // Limpar alunos selecionados sempre que o número de alunos muda
  useEffect(() => { setAlunosPermitidos([]); }, [numAlunos]);

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  const handleMarcar = async (e) => {
    e.preventDefault();
    if (!estudioId)    return showMessage("error", "Seleciona um estúdio.");
    if (!modalidadeId) return showMessage("error", "Seleciona o tipo de aula.");
    if (!data)         return showMessage("error", "Seleciona uma data.");
    if (!vagaId)       return showMessage("error", "Seleciona um horário disponível.");
    if (!numAlunos || Number(numAlunos) < 1) return showMessage("error", "Indica o número de alunos.");
    const maxAlunos = Number(numAlunos);
    if (alunosPermitidos.length !== maxAlunos) {
      return showMessage("error", `Seleciona exatamente ${maxAlunos} aluno${maxAlunos > 1 ? "s" : ""}.`);
    }

    setSubmitting(true);
    try {
      await createCoachingSessionDireto({
        vaga_id:           Number(vagaId),
        estudio_id:        Number(estudioId),
        modalidade_id:     Number(modalidadeId),
        max_alunos:        Number(numAlunos),
        formato:           Number(numAlunos) > 1 ? "grupo" : "individual",
        alunos_permitidos: alunosPermitidos,
      });
      showMessage("success", "Sessão de coaching criada com sucesso!");
      // limpar formulário e recarregar vagas
      setEstudioId(""); setModalidadeId(""); setData(""); setVagaId(""); setNumAlunos(""); setAlunosPermitidos([]);
      const vagas = await getProfessorVagas(professor.id);
      setAllVagas(vagas);
    } catch (err) {
      showMessage("error", err.message || "Erro ao criar sessão.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Separar sessões por formato ──
  const sessoesIndividual = pedidosAceites.filter(s => s.formato === "individual");
  const sessoesGrupo      = pedidosAceites.filter(s => s.formato === "grupo");

  const totalPagesInd = Math.ceil(sessoesIndividual.length / ITEMS_PER_PAGE);
  const totalPagesGrp = Math.ceil(sessoesGrupo.length / ITEMS_PER_PAGE);
  const pageItemsInd  = sessoesIndividual.slice(pageInd * ITEMS_PER_PAGE, (pageInd + 1) * ITEMS_PER_PAGE);
  const pageItemsGrp  = sessoesGrupo.slice(pageGrp * ITEMS_PER_PAGE, (pageGrp + 1) * ITEMS_PER_PAGE);

  // ── Vaga selecionada (para mostrar hora no field) ──
  const vagaSelecionada = allVagas.find(v => String(v.id) === String(vagaId));

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

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

                {/* Alunos permitidos — visível sempre que numAlunos está definido */}
                {Number(numAlunos) >= 1 && (
                  <div className="pc-form-row pc-form-row--top">
                    <span className="pc-form-label">Alunos:</span>
                    <div className="pc-alunos-selector">
                      {todosAlunos.length === 0 ? (
                        <span className="pc-alunos-empty">Nenhum aluno disponível</span>
                      ) : (
                        todosAlunos.map(a => {
                          const isChecked = alunosPermitidos.includes(a.id);
                          const limitReached = alunosPermitidos.length >= Number(numAlunos);
                          const isDisabled = !isChecked && limitReached;
                          return (
                            <label
                              key={a.id}
                              className={`pc-aluno-check${isDisabled ? " pc-aluno-check--disabled" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={e => {
                                  if (e.target.checked) {
                                    if (!limitReached) {
                                      setAlunosPermitidos(prev => [...prev, a.id]);
                                    }
                                  } else {
                                    setAlunosPermitidos(prev => prev.filter(id => id !== a.id));
                                  }
                                }}
                              />
                              {a.nome}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

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

          {/* DIREITA: duas listas de sessões */}
          <div className="pc-right">

            {/* Individual */}
            <p className="pc-list-title">Individual</p>
            <div className="pc-list">
              {sessoesIndividual.length === 0 && !loading ? (
                <p style={{ textAlign: "center", color: "#888", fontSize: "0.85rem", padding: "0.5rem" }}>
                  Sem coachings marcados.
                </p>
              ) : (
                pageItemsInd.map(req => (
                  <div
                    key={req.id}
                    className="pc-request-card pc-request-card--clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/coaching/sessao/${req.id}`, {
                      state: {
                        titulo: `Aula - ${req.aluno ?? "Aluno"} às ${(req.hora_inicio ?? "").slice(0, 5)}`,
                        modalidade: req.modalidade ?? "",
                      }
                    })}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && navigate(`/coaching/sessao/${req.id}`, {
                      state: {
                        titulo: `Aula - ${req.aluno ?? "Aluno"} às ${(req.hora_inicio ?? "").slice(0, 5)}`,
                        modalidade: req.modalidade ?? "",
                      }
                    })}
                  >
                    <span className="pc-request-name">
                      Aula - {req.aluno ?? "Aluno"} às {(req.hora_inicio ?? "").slice(0, 5)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="pc-pagination">
              <button
                type="button"
                className="pc-next-btn"
                disabled={pageInd >= totalPagesInd - 1}
                onClick={() => setPageInd(p => p + 1)}
              >
                Próxima →
              </button>
            </div>

            {/* Grupo */}
            <p className="pc-list-title">Grupo</p>
            <div className="pc-list">
              {sessoesGrupo.length === 0 && !loading ? (
                <p style={{ textAlign: "center", color: "#888", fontSize: "0.85rem", padding: "0.5rem" }}>
                  Sem coachings marcados.
                </p>
              ) : (
                pageItemsGrp.map(req => (
                  <div
                    key={req.id}
                    className="pc-request-card pc-request-card--clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/coaching/sessao/${req.id}`, {
                      state: {
                        titulo: `Aula - Grupo às ${(req.hora_inicio ?? "").slice(0, 5)}`,
                        modalidade: req.modalidade ?? "",
                      }
                    })}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && navigate(`/coaching/sessao/${req.id}`, {
                      state: {
                        titulo: `Aula - Grupo às ${(req.hora_inicio ?? "").slice(0, 5)}`,
                        modalidade: req.modalidade ?? "",
                      }
                    })}
                  >
                    <span className="pc-request-name">
                      Aula - Grupo às {(req.hora_inicio ?? "").slice(0, 5)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="pc-pagination">
              <button
                type="button"
                className="pc-next-btn"
                disabled={pageGrp >= totalPagesGrp - 1}
                onClick={() => setPageGrp(p => p + 1)}
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
