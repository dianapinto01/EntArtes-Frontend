import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/meuspedidosfigurinosstyle.css";

const API = "http://localhost:3000/api/v1";
const PLACEHOLDER_IMAGES = [
  "/images/figurino1.png", "/images/figurino2.png",
  "/images/figurino3.png", "/images/figurino4.png",
];
const PER_PAGE = 6;

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

function getUtilizadorId() {
  try {
    const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
    return auth?.user?.id ?? null;
  } catch { return null; }
}

export default function MyPedidosPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cores, setCores] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [estadosFiltro, setEstadosFiltro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ estado: "", tamanho: "", cor: "" });

  const carregar = useCallback(async () => {
    const userId = getUtilizadorId();
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/reservas/utilizador/${userId}`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      setTodos(lista);
      setPedidos(lista);
      setCores([...new Set(lista.map(p => capitalize(p.figurino?.cor)).filter(Boolean))].sort());
      setTamanhos([...new Set(lista.map(p => p.figurino?.tamanho).filter(Boolean))].sort());
      setEstadosFiltro([...new Set(lista.map(p => p.estado).filter(Boolean))].sort());
    } catch {
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleSearch = () => {
    setPage(0);
    setPedidos(todos.filter(p => {
      if (filters.estado && p.estado !== filters.estado) return false;
      if (filters.tamanho && p.figurino?.tamanho !== filters.tamanho) return false;
      if (filters.cor && capitalize(p.figurino?.cor) !== filters.cor) return false;
      return true;
    }));
  };

  const totalPages = Math.ceil(pedidos.length / PER_PAGE);
  const pagina = pedidos.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleAceitarSugestao = async id => {
    try {
      const res = await fetch(`${API}/reservas/${id}/aceitar-sugestao`, { method: "PATCH" });
      if (res.ok) {
        setActionMsg({ type: "success", text: "Sugestão aceite. As datas foram atualizadas." });
        carregar();
      } else {
        setActionMsg({ type: "error", text: "Erro ao aceitar sugestão." });
      }
    } catch {
      setActionMsg({ type: "error", text: "Erro ao ligar ao servidor." });
    }
  };

  const handleRecusar = async id => {
    try {
      await fetch(`${API}/reservas/${id}/cancelar`, { method: "PATCH" });
      setActionMsg({ type: "success", text: "Pedido cancelado." });
      carregar();
    } catch {
      setActionMsg({ type: "error", text: "Erro ao cancelar pedido." });
    }
  };

  const renderEstado = p => {
    if (p.estado === "Sugestão") {
      return (
        <div className="mpf__sugestao-box">
          <p className="mpf__sugestao-label">O proprietário sugeriu novas datas:</p>
          <p className="mpf__sugestao-dates">{p.sugestao_inicio} → {p.sugestao_fim}</p>
          <div className="mpf__sugestao-actions">
            <button className="mpf__btn-recusar" onClick={() => handleRecusar(p.id)}>Recusar</button>
            <button className="mpf__btn-aceitar" onClick={() => handleAceitarSugestao(p.id)}>Aceitar datas</button>
          </div>
        </div>
      );
    }
    if (p.estado === "Confirmada") return <span className="mpf__badge mpf__badge--confirmada">Confirmada ✓</span>;
    if (p.estado === "Cancelada")  return <span className="mpf__badge mpf__badge--cancelada">Cancelada</span>;
    if (p.estado === "Devolvida")  return <span className="mpf__badge mpf__badge--devolvida">Devolvida</span>;
    return <span className="mpf__badge mpf__badge--pendente">Pendente</span>;
  };

  return (
    <div className="mpf-page">
      <HeaderGlobal />

      <main className="mpf__background">
        <img src="/images/Entartes-6.png" alt="" className="mpf__bg-image" />
        <div className="mpf__bg-overlay" />

        <div className="mpf__center">
          <div className="mpf__top-bar">
            <button className="mpf__back-btn" onClick={() => navigate("/figurinos")}>←</button>
            <h1 className="mpf__title">Os meus pedidos</h1>
          </div>

          <div className="mpf__filters">
            <select value={filters.estado} onChange={e => setFilters(f => ({ ...f, estado: e.target.value }))}>
              <option value="">Estado</option>
              {estadosFiltro.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filters.tamanho} onChange={e => setFilters(f => ({ ...f, tamanho: e.target.value }))}>
              <option value="">Tamanho</option>
              {tamanhos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.cor} onChange={e => setFilters(f => ({ ...f, cor: e.target.value }))}>
              <option value="">Cor</option>
              {cores.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="mpf__search-btn" onClick={handleSearch}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {actionMsg && (
            <p className={`mpf__action-msg mpf__action-msg--${actionMsg.type}`}>{actionMsg.text}</p>
          )}

          {loading ? (
            <p className="mpf__empty">A carregar...</p>
          ) : pedidos.length === 0 ? (
            <p className="mpf__empty">Ainda não fizeste nenhum pedido de figurino.</p>
          ) : (
            <>
              <div className="mpf__grid">
                {pagina.map((p, i) => (
                  <div key={p.id} className="mpf__card">
                    <img
                      src={p.figurino?.imagem ?? PLACEHOLDER_IMAGES[i % 4]}
                      alt={p.figurino?.titulo}
                      className="mpf__card-img"
                    />
                    <p className="mpf__card-title">{p.figurino?.titulo ?? "Figurino"}</p>
                    <div className="mpf__card-dates">
                      <span>{p.data_inicio}</span>
                      <span>→</span>
                      <span>{p.data_fim}</span>
                    </div>
                    <div className="mpf__card-meta">
                      {(p.quantidade ?? 1) > 1 && <span>{p.quantidade} un.</span>}
                      {p.valor_total != null && <span>{p.valor_total} €</span>}
                      {p.figurino?.tamanho && <span>{p.figurino.tamanho}</span>}
                      {p.figurino?.cor && <span>{p.figurino.cor}</span>}
                    </div>
                    <div className="mpf__card-estado">{renderEstado(p)}</div>
                  </div>
                ))}
              </div>

              <div className="mpf__pagination">
                {page > 0 && (
                  <button className="mpf__page-btn" onClick={() => setPage(p => p - 1)}>← Anterior</button>
                )}
                <span className="mpf__page-info">{page + 1} / {totalPages}</span>
                {page + 1 < totalPages && (
                  <button className="mpf__page-btn" onClick={() => setPage(p => p + 1)}>Próxima →</button>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
