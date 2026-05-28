import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/meusfigurinosstyle.css";

const API = "http://localhost:3000/api/v1";
const PLACEHOLDER_IMAGES = [
  "/images/figurino1.png", "/images/figurino2.png",
  "/images/figurino3.png", "/images/figurino4.png",
];
const ESTADOS_ALUGER = [
  { value: "Disponivel",    label: "Disponível" },
  { value: "Indisponivel",  label: "Indisponível" },
  { value: "Em manutenção", label: "Em manutenção" },
  { value: "A arranjar",    label: "A arranjar" },
  { value: "A Lavar",       label: "A Lavar" },
];
const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

function getUtilizadorId() {
  try {
    const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
    return auth?.user?.id ?? null;
  } catch { return null; }
}

const BADGE_MAP = {
  "Disponivel":    { cls: "mf__badge--disponivel",  label: "Disponível" },
  "Indisponivel":  { cls: "mf__badge--indisponivel", label: "Indisponível" },
  "Em manutenção": { cls: "mf__badge--manutencao",   label: "Em manutenção" },
  "A arranjar":    { cls: "mf__badge--arranjar",      label: "A arranjar" },
  "A Lavar":       { cls: "mf__badge--lavar",         label: "A Lavar" },
};

export default function MeusFigurinosPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [figurinos, setFigurinos] = useState([]);
  const [cores, setCores] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [estadosFiltro, setEstadosFiltro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState({});
  const [actionMsg, setActionMsg] = useState(null);
  const [saving, setSaving] = useState({});
  const [filters, setFilters] = useState({ cor: "", tamanho: "", estado: "" });
  const [confirmarDelete, setConfirmarDelete] = useState(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 6;

  const carregar = useCallback(async () => {
    const userId = getUtilizadorId();
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/figurinos`);
      const data = await res.json();
      const meus = Array.isArray(data)
        ? data.filter(f => Number(f.utilizador_id) === Number(userId))
        : [];
      setTodos(meus);
      setFigurinos(meus);
      setCores([...new Set(meus.map(f => capitalize(f.cor)).filter(Boolean))].sort());
      setTamanhos([...new Set(meus.map(f => f.tamanho).filter(Boolean))].sort());
      setEstadosFiltro([...new Set(meus.map(f => f.estado_aluger ?? "Disponivel"))].sort());
      const init = {};
      meus.forEach(f => { init[f.id] = f.estado_aluger ?? "Disponivel"; });
      setEstados(init);
    } catch {
      setFigurinos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleSearch = () => {
    setPage(0);
    setFigurinos(todos.filter(f => {
      if (filters.cor && capitalize(f.cor) !== filters.cor) return false;
      if (filters.tamanho && f.tamanho !== filters.tamanho) return false;
      if (filters.estado && (f.estado_aluger ?? "Disponivel") !== filters.estado) return false;
      return true;
    }));
  };

  const handleGuardar = async (id) => {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`${API}/figurinos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_aluger: estados[id] }),
      });
      if (res.ok) {
        setActionMsg({ type: "success", text: "Estado atualizado com sucesso." });
        carregar();
      } else {
        setActionMsg({ type: "error", text: "Erro ao atualizar estado." });
      }
    } catch {
      setActionMsg({ type: "error", text: "Erro ao ligar ao servidor." });
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const handleEliminar = async (id) => {
    try {
      const res = await fetch(`${API}/figurinos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg({ type: "success", text: "Figurino eliminado com sucesso." });
        carregar();
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message ?? "Erro ao eliminar figurino.";
        setActionMsg({ type: "error", text: msg });
      }
    } catch {
      setActionMsg({ type: "error", text: "Erro ao ligar ao servidor." });
    } finally {
      setConfirmarDelete(null);
    }
  };

  const renderBadge = estado => {
    const info = BADGE_MAP[estado] ?? { cls: "mf__badge--disponivel", label: estado };
    return <span className={`mf__badge ${info.cls}`}>{info.label}</span>;
  };

  return (
    <div className="mf-page">
      <HeaderGlobal />

      <main className="mf__background">
        <img src="/images/Entartes-6.png" alt="" className="mf__bg-image" />
        <div className="mf__bg-overlay" />

        <div className="mf__center">
          <div className="mf__top-bar">
            <button className="mf__back-btn" onClick={() => navigate("/figurinos")}>←</button>
            <h1 className="mf__title">Os meus figurinos</h1>
          </div>

          {/* FILTROS */}
          <div className="mf__filters">
            <select value={filters.cor} onChange={e => setFilters(f => ({ ...f, cor: e.target.value }))}>
              <option value="">Cor</option>
              {cores.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.tamanho} onChange={e => setFilters(f => ({ ...f, tamanho: e.target.value }))}>
              <option value="">Tamanho</option>
              {tamanhos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.estado} onChange={e => setFilters(f => ({ ...f, estado: e.target.value }))}>
              <option value="">Estado</option>
              {estadosFiltro.map(e => {
                const info = BADGE_MAP[e];
                return <option key={e} value={e}>{info ? info.label : e}</option>;
              })}
            </select>
            <button className="mf__search-btn" onClick={handleSearch}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {actionMsg && (
            <p className={`mf__action-msg mf__action-msg--${actionMsg.type}`}>{actionMsg.text}</p>
          )}

          {loading ? (
            <p className="mf__empty">A carregar...</p>
          ) : figurinos.length === 0 ? (
            <p className="mf__empty">Nenhum figurino encontrado.</p>
          ) : (
            <>
            <div className="mf__grid">
              {figurinos.slice(page * PER_PAGE, (page + 1) * PER_PAGE).map((f, i) => (
                <div key={f.id} className="mf__card">
                  <img
                    src={f.imagem ?? PLACEHOLDER_IMAGES[i % 4]}
                    alt={f.titulo}
                    className="mf__card-img"
                  />
                  <p className="mf__card-title">{f.titulo}</p>
                  <div className="mf__card-meta">
                    {f.tamanho && <span>{f.tamanho}</span>}
                    {f.cor && <span>{f.cor}</span>}
                    {f.valor_por_dia != null && <span>{f.valor_por_dia} € / dia</span>}
                  </div>
                  <div className="mf__card-estado-atual">
                    {renderBadge(f.estado_aluger ?? "Disponivel")}
                  </div>
                  <select
                    className="mf__select"
                    value={estados[f.id] ?? f.estado_aluger ?? "Disponivel"}
                    onChange={e => setEstados(s => ({ ...s, [f.id]: e.target.value }))}
                  >
                    {ESTADOS_ALUGER.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    className="mf__btn-guardar"
                    onClick={() => handleGuardar(f.id)}
                    disabled={saving[f.id]}
                  >
                    {saving[f.id] ? "A guardar..." : "Guardar"}
                  </button>
                  <button
                    className="mf__btn-eliminar"
                    onClick={() => setConfirmarDelete(f.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

              {/* PAGINAÇÃO */}
              {figurinos.length > PER_PAGE && (
                <div className="mf__pagination">
                  {page > 0 && (
                    <button className="mf__page-btn" onClick={() => setPage(p => p - 1)}>← Anterior</button>
                  )}
                  <span className="mf__page-info">{page + 1} / {Math.ceil(figurinos.length / PER_PAGE)}</span>
                  {(page + 1) * PER_PAGE < figurinos.length && (
                    <button className="mf__page-btn" onClick={() => setPage(p => p + 1)}>Próxima →</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        {confirmarDelete && (
          <div className="mf__modal-overlay">
            <div className="mf__modal">
              <p className="mf__modal-text">Tens a certeza que queres eliminar este figurino?</p>
              <div className="mf__modal-actions">
                <button className="mf__modal-btn mf__modal-btn--sim" onClick={() => handleEliminar(confirmarDelete)}>
                  Sim
                </button>
                <button className="mf__modal-btn mf__modal-btn--nao" onClick={() => setConfirmarDelete(null)}>
                  Não
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
