import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/pedidosrecebidosstyle.css";

const API = "http://localhost:3000/api/v1";
const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
const PLACEHOLDER_IMAGES = [
  "/images/figurino1.png", "/images/figurino2.png",
  "/images/figurino3.png", "/images/figurino4.png",
];
const ESTADOS_DEVOLUCAO = [
  { value: "Disponivel",     label: "Devolvido (disponível)" },
  { value: "Em manutenção",  label: "Em manutenção" },
  { value: "A arranjar",     label: "A arranjar" },
  { value: "A Lavar",        label: "A Lavar" },
];

function getAuth() {
  try { return JSON.parse(localStorage.getItem("entartes_auth") || "null"); }
  catch { return null; }
}

export default function PedidosRecebidosPage() {
  const navigate = useNavigate();
  const [todasReservas, setTodasReservas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cores, setCores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalDevolver, setModalDevolver] = useState(null);
  const [estadoDevolucao, setEstadoDevolucao] = useState("Disponivel");
  const [quantidadeDevolvida, setQuantidadeDevolvida] = useState(1);
  const [sugestao, setSugestao] = useState({ inicio: "", fim: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filtros, setFiltros] = useState({ estado: "", tamanho: "", cor: "" });
  const [page, setPage] = useState(0);
  const PER_PAGE = 6;

  const auth = getAuth();
  const utilizadorId = auth?.user?.id;

  const carregar = useCallback(async () => {
    if (!utilizadorId) return;
    setLoading(true);
    try {
      const resFig = await fetch(`${API}/figurinos`);
      const todosFigurinos = await resFig.json();
      if (!Array.isArray(todosFigurinos)) return;

      const figurinosAlvo = todosFigurinos.filter(
        f => Number(f.utilizador_id) === Number(utilizadorId)
      );

      const resultados = await Promise.all(
        figurinosAlvo.map(async f => {
          const res = await fetch(`${API}/figurinos/${f.id}/reservas`);
          const data = await res.json();
          return (Array.isArray(data) ? data : []).map(r => ({ ...r, figurino: f }));
        })
      );
      const lista = resultados.flat();
      setTodasReservas(lista);
      setReservas(lista);
      setCores([...new Set(lista.map(r => capitalize(r.figurino?.cor)).filter(Boolean))].sort());
    } catch {
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [utilizadorId]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleFiltrar = () => {
    setPage(0);
    setReservas(todasReservas.filter(r => {
      if (filtros.estado && r.estado !== filtros.estado) return false;
      if (filtros.tamanho && r.figurino?.tamanho !== filtros.tamanho) return false;
      if (filtros.cor && capitalize(r.figurino?.cor) !== filtros.cor) return false;
      return true;
    }));
  };

  const handleAceitar = async id => {
    try {
      await fetch(`${API}/reservas/${id}/confirmar`, { method: "PATCH" });
      setActionMsg({ type: "success", text: "Reserva aceite." });
      carregar();
    } catch {
      setActionMsg({ type: "error", text: "Erro ao aceitar reserva." });
    }
  };

  const handleCancelar = async id => {
    try {
      await fetch(`${API}/reservas/${id}/cancelar`, { method: "PATCH" });
      setActionMsg({ type: "success", text: "Reserva cancelada." });
      carregar();
    } catch {
      setActionMsg({ type: "error", text: "Erro ao cancelar reserva." });
    }
  };

  const handleSugerir = async () => {
    if (!sugestao.inicio || !sugestao.fim) return;
    const hoje = new Date().toISOString().split("T")[0];
    if (sugestao.inicio < hoje) {
      setActionMsg({ type: "error", text: "A data de início não pode ser no passado." });
      return;
    }
    if (sugestao.fim < sugestao.inicio) {
      setActionMsg({ type: "error", text: "A data de fim não pode ser anterior à data de início." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reservas/${modal.reservaId}/sugerir`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sugestao_inicio: sugestao.inicio, sugestao_fim: sugestao.fim }),
      });
      if (res.ok) {
        setActionMsg({ type: "success", text: "Sugestão de datas enviada." });
        setModal(null);
        setSugestao({ inicio: "", fim: "" });
        carregar();
      } else {
        setActionMsg({ type: "error", text: "Erro ao enviar sugestão." });
      }
    } catch {
      setActionMsg({ type: "error", text: "Erro ao ligar ao servidor." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevolver = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reservas/${modalDevolver.reservaId}/devolver`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado_figurino: estadoDevolucao,
          quantidade_devolvida: quantidadeDevolvida,
        }),
      });
      if (res.ok) {
        setActionMsg({ type: "success", text: "Devolução registada com sucesso." });
        setModalDevolver(null);
        setEstadoDevolucao("Disponivel");
        setQuantidadeDevolvida(1);
        carregar();
      } else {
        setActionMsg({ type: "error", text: "Erro ao registar devolução." });
      }
    } catch {
      setActionMsg({ type: "error", text: "Erro ao ligar ao servidor." });
    } finally {
      setSubmitting(false);
    }
  };

  const estadoBadge = r => {
    if (r.estado === "Cancelada")  return <span className="pr__badge pr__badge--cancelada">Cancelada</span>;
    if (r.estado === "Confirmada") return <span className="pr__badge pr__badge--confirmada">Confirmada ✓</span>;
    if (r.estado === "Sugestão")   return <span className="pr__badge pr__badge--sugestao">Sugestão enviada</span>;
    if (r.estado === "Devolvida")  return <span className="pr__badge pr__badge--devolvida">Devolvida</span>;
    return <span className="pr__badge pr__badge--pendente">Pendente</span>;
  };

  return (
    <div className="pr-page">
      <HeaderGlobal />

      {/* MODAL SUGERIR DATAS */}
      {modal && (
        <div className="pr__modal-overlay" onClick={() => setModal(null)}>
          <div className="pr__modal" onClick={e => e.stopPropagation()}>
            <h3 className="pr__modal-title">Sugerir novas datas</h3>
            <p className="pr__modal-sub">A reserva será marcada como "Sugestão" até o utilizador responder.</p>
            <div className="pr__modal-fields">
              <div className="pr__modal-field">
                <label>Data de início</label>
                <input type="date" value={sugestao.inicio}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setSugestao(p => ({ ...p, inicio: e.target.value, fim: p.fim < e.target.value ? "" : p.fim }))} />
              </div>
              <div className="pr__modal-field">
                <label>Data de fim</label>
                <input type="date" value={sugestao.fim}
                  min={sugestao.inicio || new Date().toISOString().split("T")[0]}
                  onChange={e => setSugestao(p => ({ ...p, fim: e.target.value }))} />
              </div>
            </div>
            <div className="pr__modal-actions">
              <button className="pr__btn-cancelar" onClick={() => setModal(null)}>Cancelar</button>
              <button className="pr__btn-aceitar" onClick={handleSugerir} disabled={submitting}>
                {submitting ? "A enviar..." : "Enviar sugestão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTAR DEVOLUÇÃO */}
      {modalDevolver && (
        <div className="pr__modal-overlay" onClick={() => setModalDevolver(null)}>
          <div className="pr__modal" onClick={e => e.stopPropagation()}>
            <h3 className="pr__modal-title">Registar devolução</h3>
            <p className="pr__modal-sub">Escolhe o estado do figurino após a devolução.</p>

            {/* QUANTIDADE A DEVOLVER */}
            {modalDevolver.quantidadeTotal > 1 && (
              <div className="pr__devolver-qty">
                <span className="pr__devolver-qty-label">
                  Unidades a devolver (de {modalDevolver.quantidadeTotal})
                </span>
                <div className="pr__devolver-qty-controls">
                  <button
                    type="button"
                    className="pr__devolver-qty-btn"
                    onClick={() => setQuantidadeDevolvida(q => Math.max(1, q - 1))}
                    disabled={quantidadeDevolvida <= 1}
                  >−</button>
                  <span className="pr__devolver-qty-value">{quantidadeDevolvida}</span>
                  <button
                    type="button"
                    className="pr__devolver-qty-btn"
                    onClick={() => setQuantidadeDevolvida(q => Math.min(modalDevolver.quantidadeTotal, q + 1))}
                    disabled={quantidadeDevolvida >= modalDevolver.quantidadeTotal}
                  >+</button>
                </div>
              </div>
            )}

            <div className="pr__devolver-options">
              {ESTADOS_DEVOLUCAO.map(opt => (
                <button
                  key={opt.value}
                  className={`pr__devolver-opt${estadoDevolucao === opt.value ? " pr__devolver-opt--active" : ""}`}
                  onClick={() => setEstadoDevolucao(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="pr__modal-actions">
              <button className="pr__btn-cancelar" onClick={() => setModalDevolver(null)}>Cancelar</button>
              <button className="pr__btn-aceitar" onClick={handleDevolver} disabled={submitting}>
                {submitting ? "A registar..." : "Confirmar devolução"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pr__background">
        <img src="/images/Entartes-6.png" alt="" className="pr__bg-image" />
        <div className="pr__bg-overlay" />

        <div className="pr__center">
          <div className="pr__top-bar">
            <button className="pr__back-btn" onClick={() => navigate("/figurinos")}>←</button>
            <h1 className="pr__title">Pedidos recebidos</h1>
          </div>

          {/* FILTROS */}
          <div className="pr__filters">
            <select value={filtros.estado} onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}>
              <option value="">Estado</option>
              {["Pendente","Sugestão","Confirmada","Cancelada","Devolvida"].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filtros.tamanho} onChange={e => setFiltros(f => ({ ...f, tamanho: e.target.value }))}>
              <option value="">Tamanho</option>
              {[...new Set(todasReservas.map(r => r.figurino?.tamanho).filter(Boolean))].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filtros.cor} onChange={e => setFiltros(f => ({ ...f, cor: e.target.value }))}>
              <option value="">Cor</option>
              {cores.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="pr__search-btn" onClick={handleFiltrar}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {actionMsg && (
            <p className={`pr__action-msg pr__action-msg--${actionMsg.type}`}>{actionMsg.text}</p>
          )}

          {loading ? (
            <p className="pr__empty">A carregar...</p>
          ) : reservas.length === 0 ? (
            <p className="pr__empty">Não há pedidos de reserva nos teus figurinos.</p>
          ) : (
            <>
            <div className="pr__grid">
              {reservas.slice(page * PER_PAGE, (page + 1) * PER_PAGE).map((r, i) => (
                <div key={r.id} className="pr__card">
                  <img
                    src={r.figurino?.imagem ?? PLACEHOLDER_IMAGES[i % 4]}
                    alt={r.figurino?.titulo}
                    className="pr__card-img"
                  />
                  <p className="pr__card-title">{r.figurino?.titulo ?? "Figurino"}</p>
                  <div className="pr__card-dates">
                    <span>{r.data_inicio}</span>
                    <span>→</span>
                    <span>{r.data_fim}</span>
                  </div>
                  <div className="pr__card-meta-row">
                    {r.figurino?.cor && <span>{r.figurino.cor}</span>}
                    {r.figurino?.tamanho && <span>{r.figurino.tamanho}</span>}
                    {(r.quantidade ?? 1) > 1 && <span>{r.quantidade} un.</span>}
                    {r.valor_total != null && <span>{r.valor_total} €</span>}
                  </div>
                  {r.utilizador?.nome && (
                    <p className="pr__card-requester">{r.utilizador.nome}</p>
                  )}
                  <div className="pr__card-estado">{estadoBadge(r)}</div>

                  {/* Ações para reservas pendentes/sugestão */}
                  {r.estado !== "Cancelada" && r.estado !== "Confirmada" && r.estado !== "Devolvida" && (
                    <div className="pr__card-actions">
                      <button className="pr__btn-cancelar" onClick={() => handleCancelar(r.id)}>
                        Cancelar
                      </button>
                      <button
                        className="pr__btn-sugerir"
                        onClick={() => { setModal({ reservaId: r.id }); setSugestao({ inicio: "", fim: "" }); }}
                      >
                        Sugerir datas
                      </button>
                      <button className="pr__btn-aceitar" onClick={() => handleAceitar(r.id)}>
                        Aceitar
                      </button>
                    </div>
                  )}

                  {/* Ação de devolução para reservas confirmadas após a data de fim */}
                  {r.estado === "Confirmada" && (() => {
                    const hoje = new Date().toISOString().split("T")[0];
                    const podeDevolver = r.data_fim <= hoje;
                    return (
                      <div className="pr__card-actions">
                        {podeDevolver ? (
                          <button
                            className="pr__btn-devolver"
                            onClick={() => {
                              setModalDevolver({ reservaId: r.id, quantidadeTotal: r.quantidade ?? 1 });
                              setEstadoDevolucao("Disponivel");
                              setQuantidadeDevolvida(r.quantidade ?? 1);
                            }}
                          >
                            Registar devolução
                          </button>
                        ) : (
                          <p className="pr__devolver-info">
                            Devolução disponível a partir de {r.data_fim}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>

              {/* PAGINAÇÃO */}
              {reservas.length > PER_PAGE && (
                <div className="pr__pagination">
                  {page > 0 && (
                    <button className="pr__page-btn" onClick={() => setPage(p => p - 1)}>← Anterior</button>
                  )}
                  <span className="pr__page-info">{page + 1} / {Math.ceil(reservas.length / PER_PAGE)}</span>
                  {(page + 1) * PER_PAGE < reservas.length && (
                    <button className="pr__page-btn" onClick={() => setPage(p => p + 1)}>Próxima →</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
