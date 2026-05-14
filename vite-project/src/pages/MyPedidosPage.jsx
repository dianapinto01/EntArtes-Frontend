import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../styles/mypedidospage.css";

const API = "http://localhost:3000/api/v1";
const UTILIZADOR_ID = 1;

export default function MyPedidosPage({ onNavigate }) {
  const [pedidos, setPedidos] = useState([]);
  const [filters, setFilters] = useState({
    pesquisa: "",
    data_inicio: "",
    tamanho: "",
    tipo: "",
  });

  const fetchPedidos = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.data_inicio) params.append("data_inicio", filters.data_inicio);
      if (filters.tamanho) params.append("tamanho", filters.tamanho);
      if (filters.tipo) params.append("tipo", filters.tipo);

      const res = await fetch(
        `${API}/reservas/utilizador/${UTILIZADOR_ID}?${params.toString()}`
      );
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      setPedidos([]);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleConfirmar = async (id) => {
    await fetch(`${API}/reservas/${id}/confirmar`, { method: "PATCH" });
    fetchPedidos();
  };

  const handleCancelar = async (id) => {
    await fetch(`${API}/reservas/${id}/cancelar`, { method: "PATCH" });
    fetchPedidos();
  };

  const renderEstado = (pedido) => {
    if (pedido.estado === "Cancelada") {
      return (
        <span className="mypedidos__status mypedidos__status--recusado">
          Recusado ⚠️
        </span>
      );
    }
    if (pedido.estado === "Confirmada") {
      return (
        <span className="mypedidos__status mypedidos__status--aceite">
          Aceite ✓
        </span>
      );
    }
    return (
      <div className="mypedidos__actions">
        <button
          className="mypedidos__btn-recusar"
          onClick={() => handleCancelar(pedido.id)}
        >
          Recusar
        </button>
        <button
          className="mypedidos__btn-aceitar"
          onClick={() => handleConfirmar(pedido.id)}
        >
          Aceitar
        </button>
      </div>
    );
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (!filters.pesquisa) return true;
    const titulo = p.figurino?.titulo ?? "";
    return titulo.toLowerCase().includes(filters.pesquisa.toLowerCase());
  });

  return (
    <div className="mypedidos-page">
      <Header />

      <main className="mypedidos__background">

        <img
          src="/images/Entartes-5.png"
          alt=""
          className="mypedidos__bg-image"
        />
        <div className="mypedidos__bg-overlay" />

        {/* COLUNA ESQUERDA */}
        <div className="mypedidos__left">
          <div className="mypedidos__header">
            <button
              className="mypedidos__back-btn"
              onClick={() => onNavigate?.("figurinos")}
            >
              ←
            </button>
            <h2 className="mypedidos__title">Os meus pedidos</h2>
          </div>

          <div className="mypedidos__input-row">
            <input
              type="text"
              placeholder="Pesquisa rápida"
              value={filters.pesquisa}
              onChange={(e) =>
                setFilters((p) => ({ ...p, pesquisa: e.target.value }))
              }
            />
            <svg viewBox="0 0 24 24">
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="mypedidos__input-row">
            <input
              type="date"
              value={filters.data_inicio}
              onChange={(e) =>
                setFilters((p) => ({ ...p, data_inicio: e.target.value }))
              }
            />
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#666"
                strokeWidth="2" fill="none"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="#666"
                strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="mypedidos__input-row">
            <input
              type="text"
              placeholder="Tamanho do figurino"
              value={filters.tamanho}
              onChange={(e) =>
                setFilters((p) => ({ ...p, tamanho: e.target.value }))
              }
            />
            <svg viewBox="0 0 24 24">
              <path d="M7 7h10M7 12h6" stroke="#666" strokeWidth="2"
                fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="mypedidos__input-row">
            <select
              value={filters.tipo}
              onChange={(e) =>
                setFilters((p) => ({ ...p, tipo: e.target.value }))
              }
            >
              <option value="">Aluguer ou anunciar?</option>
              <option value="aluguer">Aluguer</option>
              <option value="anunciar">Anunciar</option>
            </select>
            <svg viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="#666" strokeWidth="2"
                fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          <button className="mypedidos__search-btn" onClick={fetchPedidos}>
            Efetuar a pesquisa
          </button>
        </div>

        {/* COLUNA DIREITA */}
        <div className="mypedidos__right">

          {/* CAIXA FIXA DOS PEDIDOS */}
          <div className="mypedidos__list-box">
            {pedidosFiltrados.length === 0 ? (
              <p className="mypedidos__empty">
                Não foram encontrados pedidos.
              </p>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <div key={pedido.id} className="mypedidos__card">
                  <div className="mypedidos__card-top">
                    <p className="mypedidos__card-title">
                      Pedido Nº {pedido.id} | {pedido.figurino?.titulo ?? "Figurino"}
                    </p>
                    {renderEstado(pedido)}
                  </div>
                  <p className="mypedidos__card-info">
                    {pedido.valor_total} € | {pedido.figurino?.tamanho ?? "-"} | {pedido.data_inicio}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* BOTÃO PRÓXIMA */}
          <button
            className="mypedidos__next-btn"
            onClick={() => onNavigate?.("next")}
          >
            Próxima →
          </button>

        </div>

      </main>

      <Footer />
    </div>
  );
}