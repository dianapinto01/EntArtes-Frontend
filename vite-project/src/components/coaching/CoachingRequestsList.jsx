import { useState, useEffect } from "react";
import { getCoachingRequests } from "../../api";

const PER_PAGE = 3;

const STATUS_ICON  = { recusado: "⚠", rejeitado: "⚠", aceite: "✓", aprovado: "✓", pendente: "•", cancelado: "✕" };
const STATUS_LABEL = { recusado: "Recusado", rejeitado: "Recusado", aceite: "Aceite", aprovado: "Aprovado", pendente: "Pendente", cancelado: "Cancelado" };

function formatDate(dateStr) {
  if (!dateStr) return "";
  const dateOnly = dateStr.split("T")[0];
  const [y, m, d] = dateOnly.split("-");
  return `${d}-${m}-${y}`;
}

function badgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "recusado" || s === "rejeitado" || s === "cancelado") return "cb-badge--recusado";
  if (s === "aceite"   || s === "aprovado")                        return "cb-badge--aceite";
  return "cb-badge--pendente";
}

export default function CoachingRequestsList({ refreshTrigger, setMessage, onSelectRequest }) {
  const auth = JSON.parse(localStorage.getItem("entartes_auth") || "{}");
  const responsavelId = auth.user?.responsavel_id ?? null;

  const [requests, setRequests] = useState([]);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!responsavelId) return;
    setLoading(true);
    getCoachingRequests(responsavelId)
      .then(data => {
        setRequests(Array.isArray(data) ? data : []);
        setPage(1);
      })
      .catch(() => setMessage?.({ type: "error", text: "Erro ao carregar os pedidos de coaching" }))
      .finally(() => setLoading(false));
  }, [refreshTrigger, responsavelId]);

  const total     = Math.ceil(requests.length / PER_PAGE);
  const paginated = requests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <p className="cb-card-sub" style={{ color: "#fff" }}>A carregar pedidos...</p>;
  if (!responsavelId) return null;
  if (requests.length === 0) return <p className="cb-card-sub" style={{ color: "#ccc" }}>Sem pedidos de coaching</p>;

  return (
    <div className="cb-list">
      {paginated.map(r => {
        const status    = (r.estado || r.status || "pendente").toLowerCase();
        const professor = r.professor?.utilizador?.nome || r.professor?.nome || r.professor || "—";
        const hora      = r.hora_inicio ? r.hora_inicio.slice(0, 5) : "";

        return (
          <div
            key={r.id}
            className="cb-card"
            onClick={() => onSelectRequest?.(r)}
          >
            <div className="cb-card-top">
              <span className="cb-card-title">
                Pedido de Coaching | {formatDate(r.data)}
              </span>
              <span className={`cb-badge ${badgeClass(status)}`}>
                {STATUS_ICON[status] || "•"} {STATUS_LABEL[status] || status}
              </span>
            </div>
            <p className="cb-card-sub">{professor}{hora ? ` às ${hora}` : ""}</p>
          </div>
        );
      })}

      {total > 1 && (
        <div className="cb-pagination">
          {page > 1 && (
            <button type="button" className="cb-page-btn" onClick={() => setPage(p => p - 1)}>
              ← Anterior
            </button>
          )}
          <button
            type="button"
            className="cb-page-btn"
            onClick={() => setPage(p => Math.min(total, p + 1))}
            disabled={page >= total}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
