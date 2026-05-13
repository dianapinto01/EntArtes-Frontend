import { useState } from "react";

const API = "http://localhost:3000/api/v1";
const TAMANHOS = ["XS", "S", "M", "L", "XL", "XXL"];
const ESTADOS = ["Novo", "Pouco uso", "Usado", "Muito Usado"];

export default function CostumeFilters({ onResults }) {
  const [filters, setFilters] = useState({
    estado_conservacao: "",
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
      if (filters.estado_conservacao) params.append("estado_conservacao", filters.estado_conservacao);
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

      {/* ESTADO */}
      <div className="costumes__filter-row">
        <label>Estado:</label>
        <select
          className="costumes__filter-input"
          value={filters.estado_conservacao}
          onChange={(e) => handleChange("estado_conservacao", e.target.value)}
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
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
        <select
          className="costumes__filter-input"
          value={filters.tamanho}
          onChange={(e) => handleChange("tamanho", e.target.value)}
        >
          <option value="">Todos</option>
          {TAMANHOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
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