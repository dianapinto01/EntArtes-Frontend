import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/figurinosliststyle.css";

const API = "http://localhost:3000/api/v1";


const PER_PAGE = 6;

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
const coresUnicas = lista => [...new Set(lista.map(f => capitalize(f.cor)).filter(Boolean))].sort();

const PLACEHOLDER_IMAGES = [
  "/images/figurino1.png",
  "/images/figurino2.png",
  "/images/figurino3.png",
  "/images/figurino4.png",
];

function getUtilizadorId() {
  try {
    const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
    return auth?.user?.id ?? null;
  } catch {
    return null;
  }
}

export default function FigurinosListPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [figurinos, setFigurinos] = useState([]);
  const [cores, setCores] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [estadosConservacao, setEstadosConservacao] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [filters, setFilters] = useState({
    cor: "",
    estado_conservacao: "",
    tamanho: "",
    tag: "",
    fonte: "",
  });

  useEffect(() => {
    const userId = getUtilizadorId();
    fetch(`${API}/figurinos`)
      .then(res => res.json())
      .then(async data => {
        const candidatos = Array.isArray(data)
          ? data.filter(f =>
              (f.estado_aluger === "Disponivel" || f.estado_aluger == null) &&
              f.utilizador_id !== userId
            )
          : [];

        const comDisponivel = await Promise.all(
          candidatos.map(async f => {
            try {
              const res = await fetch(`${API}/figurinos/${f.id}/reservas`);
              const reservas = await res.json();
              const reservadas = Array.isArray(reservas)
                ? reservas
                    .filter(r => r.estado !== "Cancelada" && r.estado !== "Devolvida")
                    .reduce((acc, r) => acc + (r.quantidade ?? 1), 0)
                : 0;
              return { ...f, quantidadeDisponivel: (f.quantidade ?? 1) - reservadas };
            } catch {
              return { ...f, quantidadeDisponivel: f.quantidade ?? 1 };
            }
          })
        );

        const disponiveis = comDisponivel.filter(f => f.quantidadeDisponivel > 0);
        setTodos(disponiveis);
        setFigurinos(disponiveis);
        setCores(coresUnicas(disponiveis));
        setTamanhos([...new Set(disponiveis.map(f => f.tamanho).filter(Boolean))].sort());
        setEstadosConservacao([...new Set(disponiveis.map(f => f.estado_conservacao).filter(Boolean))].sort());
        setTags([...new Set(disponiveis.map(f => f.tag).filter(Boolean))].sort());
      })
      .catch(() => { setTodos([]); setFigurinos([]); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    setPage(0);
    const resultado = todos.filter(f => {
      if (filters.cor && capitalize(f.cor) !== filters.cor) return false;
      if (filters.estado_conservacao && f.estado_conservacao !== filters.estado_conservacao) return false;
      if (filters.tamanho && f.tamanho !== filters.tamanho) return false;
      if (filters.tag && f.tag !== filters.tag) return false;
      if (filters.fonte === "entartes" && !f.is_entartes) return false;
      if (filters.fonte === "outros" && f.is_entartes) return false;
      return true;
    });
    setFigurinos(resultado);
  };

  const totalPages = Math.ceil(figurinos.length / PER_PAGE);
  const pagina = figurinos.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="figlist-page">
      <HeaderGlobal />

      <main className="figlist__background">
        <img src="/images/Entartes-6.png" alt="" className="figlist__bg-image" />
        <div className="figlist__bg-overlay" />

        <div className="figlist__center">

          {/* CABEÇALHO */}
          <div className="figlist__top-bar">
            <h1 className="figlist__title">Figurinos disponíveis</h1>
            <div className="figlist__top-actions">
              <button
                className="figlist__pedidos-btn"
                onClick={() => navigate("/meus-figurinos")}
              >
                Os meus figurinos
              </button>
              <button
                className="figlist__pedidos-btn"
                onClick={() => navigate("/meus-pedidos-figurinos")}
              >
                Pedidos de Aluguer
              </button>
              <button
                className="figlist__publish-btn"
                onClick={() => navigate("/criar-figurino")}
              >
                + Publicar figurino
              </button>
            </div>
          </div>

          {/* FILTROS */}
          <div className="figlist__filters">
            <select
              value={filters.fonte}
              onChange={e => setFilters(p => ({ ...p, fonte: e.target.value }))}
            >
              <option value="">Fonte</option>
              <option value="entartes">EntArtes</option>
              <option value="outros">Outros utilizadores</option>
            </select>

            <select
              value={filters.cor}
              onChange={e => setFilters(p => ({ ...p, cor: e.target.value }))}
            >
              <option value="">Cor</option>
              {cores.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filters.estado_conservacao}
              onChange={e => setFilters(p => ({ ...p, estado_conservacao: e.target.value }))}
            >
              <option value="">Estado</option>
              {estadosConservacao.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            <select
              value={filters.tamanho}
              onChange={e => setFilters(p => ({ ...p, tamanho: e.target.value }))}
            >
              <option value="">Tamanho</option>
              {tamanhos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={filters.tag}
              onChange={e => setFilters(p => ({ ...p, tag: e.target.value }))}
            >
              <option value="">Tag</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <button className="figlist__search-btn" onClick={handleSearch}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* CONTEÚDO */}
          {loading ? (
            <p className="figlist__empty">A carregar...</p>
          ) : figurinos.length === 0 ? (
            <p className="figlist__empty">Nenhum figurino disponível.</p>
          ) : (
            <>
              <div className="figlist__grid">
                {pagina.map((f, i) => (
                  <div key={f.id} className="figlist__card">
                    <img
                      src={f.imagem ?? PLACEHOLDER_IMAGES[(page * PER_PAGE + i) % 4]}
                      alt={f.titulo}
                      className="figlist__card-img"
                    />
                    <p className="figlist__card-title">{f.titulo}</p>
                    <div className="figlist__card-tags">
                      {f.cor && <span>{f.cor}</span>}
                      {f.tamanho && <span>{f.tamanho}</span>}
                      {f.valor_por_dia != null && <span>{f.valor_por_dia} € / dia</span>}
                      {(f.quantidadeDisponivel ?? 1) > 1 && <span>{f.quantidadeDisponivel} disponíveis</span>}
                    </div>
                    <button
                      className="figlist__card-btn"
                      onClick={() => navigate(`/figurinos/${f.id}`, {
                        state: { imagem: f.imagem ?? PLACEHOLDER_IMAGES[(page * PER_PAGE + i) % 4] }
                      })}
                    >
                      Ver figurino
                    </button>
                  </div>
                ))}
              </div>

              {/* PAGINAÇÃO */}
              <div className="figlist__pagination">
                {page > 0 && (
                  <button className="figlist__page-btn" onClick={() => setPage(p => p - 1)}>
                    ← Anterior
                  </button>
                )}
                <span className="figlist__page-info">
                  {page + 1} / {totalPages}
                </span>
                {page + 1 < totalPages && (
                  <button className="figlist__page-btn" onClick={() => setPage(p => p + 1)}>
                    Próxima →
                  </button>
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
