import { useState } from "react";

const API = "http://localhost:3000/api/v1";

export default function CostumeFilters({ onResults }) {
  const [filters, setFilters] = useState({
    data_evento: "",
    cor: "",
    tamanho: "",
    preco_min: "",
    preco_max: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.cor) params.append("cor", filters.cor);
      if (filters.tamanho) params.append("tamanho", filters.tamanho);
      if (filters.preco_min) params.append("preco_min", filters.preco_min);
      if (filters.preco_max) params.append("preco_max", filters.preco_max);

      const res = await fetch(`${API}/figurinos?${params.toString()}`);
      const data = await res.json();
      onResults?.(data);
    } catch {
      console.error("Erro ao pesquisar figurinos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="costumes__filters">
      <h2>Figurinos</h2>

      {/* DATA DO EVENTO */}
      <div className="costumes__filter-row">
        <label>Data do evento:</label>
        <input
          className="costumes__filter-input"
          type="date"
          value={filters.data_evento}
          onChange={(e) => handleChange("data_evento", e.target.value)}
        />
      </div>

      {/* COR */}
      <div className="costumes__filter-row">
        <label>Cor:</label>
        <input
          className="costumes__filter-input"
          type="text"
          placeholder="Roxo"
          value={filters.cor}
          onChange={(e) => handleChange("cor", e.target.value)}
        />
      </div>

      {/* TAMANHO */}
      <div className="costumes__filter-row">
        <label>Tamanho:</label>
        <input
          className="costumes__filter-input"
          type="text"
          placeholder="XL"
          value={filters.tamanho}
          onChange={(e) => handleChange("tamanho", e.target.value)}
        />
      </div>

      {/* PREÇO */}
      <div className="costumes__filter-row">
        <label>Preço:</label>
        <div className="costumes__price-row">
          <input
            className="costumes__price-input"
            type="number"
            placeholder="0 €"
            min="0"
            value={filters.preco_min}
            onChange={(e) => handleChange("preco_min", e.target.value)}
          />
          <span className="costumes__price-sep">—</span>
          <input
            className="costumes__price-input"
            type="number"
            placeholder="100 €"
            min="0"
            value={filters.preco_max}
            onChange={(e) => handleChange("preco_max", e.target.value)}
          />
        </div>
      </div>

      <button
        className="costumes__search-btn"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "A pesquisar..." : "Pesquisar"}
      </button>
    </div>
  );
}