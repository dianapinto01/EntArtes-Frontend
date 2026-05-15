import { useState, useRef } from "react";

const API = "http://localhost:3000/api/v1";

const TAMANHOS = ["XS", "S", "M", "L", "XL", "XXL"];
const ESTADOS = ["Novo", "Pouco uso", "Usado", "Muito Usado"];

function getUtilizadorId() {
  try {
    const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
    return auth?.user?.id ?? null;
  } catch {
    return null;
  }
}

export default function CreateCostumeForm({ onSuccess, onBack }) {
  const [form, setForm] = useState({
    titulo: "",
    valor_por_dia: "",
    tamanho: "",
    cor: "",
    estado_conservacao: "",
    quantidade: 1,
    descricao: "",
    ficheiro: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuantidade = (delta) => {
    setForm((prev) => ({
      ...prev,
      quantidade: Math.max(1, prev.quantidade + delta),
    }));
  };

  const validateForm = () => {
    if (!form.titulo || form.titulo.trim() === "") {
      return "O título do figurino é obrigatório.";
    }
    if (!form.valor_por_dia || isNaN(form.valor_por_dia) || Number(form.valor_por_dia) < 0) {
      return "Insere um valor por dia válido.";
    }
    if (!form.tamanho) {
      return "Seleciona o tamanho do artigo.";
    }
    if (!form.cor || form.cor.trim() === "") {
      return "A cor do figurino é obrigatória.";
    }
    if (!form.estado_conservacao) {
      return "Seleciona o estado do figurino.";
    }
    if (!form.quantidade || form.quantidade < 1) {
      return "A quantidade tem de ser pelo menos 1.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`${API}/figurinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          valor_por_dia: Number(form.valor_por_dia),
          tamanho: form.tamanho,
          cor: form.cor.trim(),
          estado_conservacao: form.estado_conservacao,
          quantidade: form.quantidade,
          utilizador_id: getUtilizadorId(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Não foi possível criar o figurino.";
        setMessage({ type: "error", text: errorText });
        return;
      }

      setForm({
        titulo: "",
        valor_por_dia: "",
        tamanho: "",
        cor: "",
        estado_conservacao: "",
        quantidade: 1,
        descricao: "",
        ficheiro: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage(null);
      setShowSuccessModal(true);
    } catch {
      setMessage({ type: "error", text: "Não foi possível ligar ao servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {showSuccessModal && (
      <div className="create-costume__modal-overlay">
        <div className="create-costume__modal">
          <div className="create-costume__modal-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#d4edda"/>
              <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#155724" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Figurino publicado!</h2>
          <p>O teu figurino foi carregado com sucesso.</p>
          <button
            className="create-costume__modal-btn"
            onClick={() => setShowSuccessModal(false)}
          >
            OK
          </button>
        </div>
      </div>
    )}
    <div className="create-costume__form-wrapper">

      {/* BOTÃO VOLTAR */}
      <button className="create-costume__back-btn" onClick={onBack} type="button">
        ←
      </button>

      {/* PESQUISA / TÍTULO */}
      <div className="create-costume__search-wrapper">
        <input
          type="text"
          placeholder="Figurino"
          value={form.titulo}
          onChange={(e) => handleChange("titulo", e.target.value)}
        />
        <svg viewBox="0 0 24 24">
          <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      {/* CAMPOS */}
      <form onSubmit={handleSubmit}>
        <div className="create-costume__fields">

          {/* FICHEIRO */}
          <div
            className="create-costume__input-row create-costume__file-row"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="create-costume__file-label">
              {form.ficheiro ? form.ficheiro.name : "Selecione o ficheiro"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleChange("ficheiro", e.target.files[0] || null)}
            />
            <svg viewBox="0 0 24 24">
              <path d="M12 16V4m0 0L8 8m4-4l4 4M4 20h16"
                stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          {/* VALOR POR DIA */}
          <div className="create-costume__input-row">
            <input
              type="number"
              placeholder="Valor por Dia"
              value={form.valor_por_dia}
              min="0"
              step="0.01"
              onChange={(e) => handleChange("valor_por_dia", e.target.value)}
            />
            <svg viewBox="0 0 24 24">
              <text x="8" y="18" fontSize="16" fill="#666">€</text>
            </svg>
          </div>

          {/* TAMANHO */}
          <div className="create-costume__input-row">
            <select
              value={form.tamanho}
              onChange={(e) => handleChange("tamanho", e.target.value)}
            >
              <option value="">Tamanho do artigo</option>
              {TAMANHOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <line x1="7" y1="7" x2="7.01" y2="7" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* COR */}
          <div className="create-costume__input-row">
            <input
              type="text"
              placeholder="Cor"
              value={form.cor}
              onChange={(e) => handleChange("cor", e.target.value)}
            />
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" stroke="#666"
                strokeWidth="2" fill="none"/>
            </svg>
          </div>

          {/* ESTADO DE CONSERVAÇÃO */}
          <div className="create-costume__input-row">
            <select
              value={form.estado_conservacao}
              onChange={(e) => handleChange("estado_conservacao", e.target.value)}
            >
              <option value="">Estado do figurino</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v5l3 3"
                stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          {/* QUANTIDADE */}
          <div className="create-costume__input-row">
            <span style={{ fontSize: "14px", color: "#555", flex: 1 }}>
              Quantidade
            </span>
            <button
              type="button"
              onClick={() => handleQuantidade(-1)}
              style={{
                background: "#ddd",
                border: "none",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </button>
            <span style={{
              minWidth: "28px",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: "600",
            }}>
              {form.quantidade}
            </span>
            <button
              type="button"
              onClick={() => handleQuantidade(1)}
              style={{
                background: "#ddd",
                border: "none",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
          </div>

          {/* DESCRIÇÃO */}
          <p className="create-costume__desc-label">Descrição do figurino</p>
          <textarea
            className="create-costume__textarea"
            placeholder="Figurino de cor azul..."
            value={form.descricao}
            onChange={(e) => handleChange("descricao", e.target.value)}
          />

        </div>

        {/* MENSAGEM FEEDBACK */}
        {message && (
          <p className={`create-costume__message create-costume__message--${message.type}`}>
            {message.text}
          </p>
        )}

        {/* BOTÃO CARREGAR */}
        <button
          type="submit"
          className="create-costume__submit-btn"
          disabled={loading}
        >
          {loading ? "A carregar..." : "Carregar"}
        </button>

      </form>
    </div>
    </>
  );
}
