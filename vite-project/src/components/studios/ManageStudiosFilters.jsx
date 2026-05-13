export default function ManageStudiosFilters({
  modalities,
  inputName, setInputName,
  inputStatus, setInputStatus,
  inputModalidade, setInputModalidade,
  onConsult,
  onClear,
  onNew
}) {
  return (
    <aside className="filters-sidebar">

      <div className="filter-field">
        <span className="filter-icon">{"\u{1F50E}\u{FE0E}"}</span>
        <input
          type="text"
          placeholder="Estúdio"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
        />
      </div>

      <div className="filter-field">
        <span className="filter-icon">{"\u{26A0}\u{FE0E}"}</span>
        <select
          value={inputStatus}
          onChange={(e) => setInputStatus(e.target.value)}
        >
          <option value="">Estado</option>
          <option value="operacional">Operacional</option>
          <option value="manutencao">Manutenção</option>
          <option value="inoperacional">Inoperacional</option>
        </select>
      </div>

      <div className="filter-field">
        <span className="filter-icon">{"\u{1F4D6}\u{FE0E}"}</span>
        <select
          value={inputModalidade}
          onChange={(e) => setInputModalidade(e.target.value)}
        >
          <option value="">Modalidade</option>
          {modalities.map(m => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="btn-consult" onClick={onConsult}>
          Consultar
        </button>
        <button className="btn-clear" onClick={onClear}>
          Limpar
        </button>
      </div>

      <div className="sidebar-divider"></div>

      <button className="btn-new" onClick={onNew}>
        + Adicionar estúdio
      </button>

    </aside>
  );
}