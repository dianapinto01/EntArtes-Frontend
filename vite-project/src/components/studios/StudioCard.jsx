const STATUS_LABELS = {
  operacional: "Operacional",
  manutencao: "Manutenção",
  inoperacional: "Inoperacional"
};

export default function StudioCard({ studio, compact = false }) {
  const status = studio.estado || "operacional";
  const statusLabel = STATUS_LABELS[status] || status;

  return (
    <div className={`studio-card status-${status}`}>
      <h3>{studio.nome}</h3>

      {!compact && studio.descricao && (
        <p className="studio-desc">{studio.descricao}</p>
      )}

      {studio.capacidade_maxima && (
        <p className="studio-cap">
          {compact
            ? `${studio.capacidade_maxima} pessoas`
            : `Capacidade: ${studio.capacidade_maxima} pessoas`
          }
        </p>
      )}

      {studio.modalidades && studio.modalidades.length > 0 && (
        <div className="studio-modalities">
          {studio.modalidades.map(m => (
            <span key={m.id} className="modality-chip">
              {m.nome}
            </span>
          ))}
        </div>
      )}

      <span className={`card-badge badge-${status}`}>
        {statusLabel}
      </span>
    </div>
  );
}