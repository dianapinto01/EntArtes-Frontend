import { useState } from "react";

const API = "http://localhost:3000/api/v1";

export default function AcademicYearForm({ onCreated, onClose, setMessage }) {
  const [form, setForm] = useState({
    nome: "",
    ano_letivo: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // valida formato 2025/2026
  const isValidYear = (y) => /^\d{4}\/\d{4}$/.test(y);

  const validateForm = () => {
    if (!form.nome || form.nome.trim() === "") {
      return "Tens de dar um nome ao horário";
    }

    if (form.nome.length < 3) {
      return "O nome do horário tem de ter pelo menos 3 caracteres";
    }

    if (!form.ano_letivo) {
      return "Tens de indicar o ano letivo";
    }

    if (!isValidYear(form.ano_letivo)) {
      return "O ano letivo tem de estar no formato AAAA/AAAA (ex: 2025/2026)";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage?.({ type: "error", text: validationError });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          ano_letivo: form.ano_letivo
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Não foi possível criar o horário";

        setMessage?.({ type: "error", text: errorText });
        return;
      }

      setMessage?.({
        type: "success",
        text: "Horário criado com sucesso"
      });

      setForm({ nome: "", ano_letivo: "" });

      onCreated?.();
      onClose?.();

    } catch {
      setMessage?.({
        type: "error",
        text: "Não foi possível ligar ao servidor"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Inserir Horário Letivo</h2>

      <label>Nome do Horário</label>
      <input
        value={form.nome}
        onChange={(e) => handleChange("nome", e.target.value)}
        placeholder="Ex: Ballet - Turmas Gerais"
      />

      <label>Ano Letivo</label>
      <input
        value={form.ano_letivo}
        onChange={(e) => handleChange("ano_letivo", e.target.value)}
        placeholder="Ex: 2025/2026"
      />

      <button className="submit" disabled={loading}>
        {loading ? "A criar..." : "Criar"}
      </button>
    </form>
  );
}