import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/pedidosrecebidosstyle.css";

const API = "http://localhost:3000/api/v1";

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("entartes_auth") || "null");
  } catch {
    return null;
  }
}

export default function PedidosRecebidosPage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const auth = getAuth();
  const utilizadorId = auth?.user?.id;

  const carregar = useCallback(async () => {
    if (!utilizadorId) return;
    setLoading(true);
    try {
      // 1. Buscar figurinos do utilizador logado; se nenhum, busca todos (fallback)
      const resFig = await fetch(`${API}/figurinos`);
      const todosFigurinos = await resFig.json();
      if (!Array.isArray(todosFigurinos)) return;

      const meusFigurinos = todosFigurinos.filter(
        (f) => Number(f.utilizador_id) === Number(utilizadorId)
      );

      // Usar todos se o utilizador ainda não tiver figurinos associados
      const figurinosAlvo = meusFigurinos.length > 0 ? meusFigurinos : todosFigurinos;

      // 2. Para cada figurino, buscar as reservas
      const resultados = await Promise.all(
        figurinosAlvo.map(async (f) => {
          const res = await fetch(`${API}/figurinos/${f.id}/reservas`);
          const data = await res.json();
          const reservasFig = Array.isArray(data) ? data : [];
          return reservasFig.map((r) => ({ ...r, figurino: f }));
        })
      );

      setReservas(resultados.flat());
    } catch {
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [utilizadorId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleAceitar = async (reservaId) => {
    try {
      await fetch(`${API}/reservas/${reservaId}/confirmar`, { method: "PATCH" });
      setActionMsg({ type: "success", text: "Reserva aceite com sucesso." });
      carregar();
    } catch {
      setActionMsg({ type: "error", text: "Erro ao aceitar reserva." });
    }
  };

  const handleCancelar = async (reservaId) => {
    try {
      await fetch(`${API}/reservas/${reservaId}/cancelar`, { method: "PATCH" });
      setActionMsg({ type: "success", text: "Reserva cancelada." });
      carregar();
    } catch {
      setActionMsg({ type: "error", text: "Erro ao cancelar reserva." });
    }
  };

  const renderEstado = (reserva) => {
    if (reserva.estado === "Cancelada") {
      return <span className="pr__badge pr__badge--cancelada">Cancelada</span>;
    }
    if (reserva.estado === "Confirmada") {
      return <span className="pr__badge pr__badge--confirmada">Confirmada ✓</span>;
    }
    return (
      <div className="pr__actions">
        <button
          className="pr__btn-cancelar"
          onClick={() => handleCancelar(reserva.id)}
        >
          Cancelar
        </button>
        <button
          className="pr__btn-aceitar"
          onClick={() => handleAceitar(reserva.id)}
        >
          Aceitar
        </button>
      </div>
    );
  };

  return (
    <div className="pr-page">
      <HeaderGlobal />

      <main className="pr__background">
        <img src="/images/Entartes-5.png" alt="" className="pr__bg-image" />
        <div className="pr__bg-overlay" />

        <div className="pr__center">
          <div className="pr__top-bar">
            <button className="pr__back-btn" onClick={() => navigate("/figurinos")}>
              ←
            </button>
            <h1 className="pr__title">Pedidos recebidos</h1>
          </div>

          {actionMsg && (
            <p className={`pr__action-msg pr__action-msg--${actionMsg.type}`}>
              {actionMsg.text}
            </p>
          )}

          {loading ? (
            <p className="pr__empty">A carregar...</p>
          ) : reservas.length === 0 ? (
            <p className="pr__empty">Não há pedidos de reserva nos teus figurinos.</p>
          ) : (
            <div className="pr__list">
              {reservas.map((r) => (
                <div key={r.id} className="pr__card">
                  <div className="pr__card-left">
                    <p className="pr__card-title">
                      {r.figurino?.titulo ?? "Figurino"}
                    </p>
                    <p className="pr__card-meta">
                      {r.data_inicio} → {r.data_fim}
                      {r.valor_total != null ? ` · ${r.valor_total} €` : ""}
                      {r.utilizador?.nome ? ` · ${r.utilizador.nome}` : ""}
                    </p>
                  </div>
                  <div className="pr__card-right">
                    {renderEstado(r)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
