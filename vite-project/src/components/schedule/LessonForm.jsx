import { useState, useEffect } from "react";

const API = "http://localhost:3000/api/v1";

const DAYS = [
  "Segunda",
  "Terça-Feira",
  "Quarta-Feira",
  "Quinta-Feira",
  "Sexta-Feira",
  "Sábado",
  "Domingo"
];

export default function LessonForm({
  scheduleId,
  classToEdit,
  onSaved,
  onClose,
  setMessage
}) {
  const isEdit = !!classToEdit;

  const [form, setForm] = useState({
    dia_semana: "Segunda",
    hora_inicio: "10:00",
    hora_fim: "11:00",
    titulo: "",
    professor_id: "",
    estudio_id: "",
    modalidade_id: ""
  });

  const [professors, setProfessors] = useState([]);
  const [studios, setStudios] = useState([]);
  const [modalities, setModalities] = useState([]);

  // carregar listas necessárias para os dropdowns
  useEffect(() => {
    fetch(`${API}/users/professors`)
      .then(res => res.json())
      .then(data => setProfessors(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API}/studios`)
      .then(res => res.json())
      .then(data => setStudios(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API}/modalities`)
      .then(res => res.json())
      .then(data => setModalities(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // se estamos a editar uma aula, preenche o form com os dados
  useEffect(() => {
    if (!classToEdit) return;

    setForm({
      dia_semana: classToEdit.dia_semana || "Segunda",
      hora_inicio: classToEdit.hora_inicio?.slice(0, 5) || "10:00",
      hora_fim: classToEdit.hora_fim?.slice(0, 5) || "11:00",
      titulo: classToEdit.titulo || "",
      professor_id: classToEdit.professor?.id || "",
      estudio_id: classToEdit.estudio?.id || "",
      modalidade_id: classToEdit.modalidade?.id || ""
    });
  }, [classToEdit]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };

      // se mudou a modalidade, limpar o estúdio porque os disponíveis mudam
      if (field === "modalidade_id") {
        updated.estudio_id = "";
      }

      return updated;
    });
  };

  // lista de estúdios filtrada: apenas operacionais e que suportam a modalidade escolhida
  const availableStudios = studios.filter(s => {
    // só estúdios operacionais
    if (s.estado !== "operacional") return false;

    // se ainda não escolheu modalidade, mostrar todos os operacionais
    if (!form.modalidade_id) return true;

    // só estúdios que suportam a modalidade escolhida
    return s.modalidades?.some(m => m.id === Number(form.modalidade_id));
  });

  const validateForm = () => {
    if (!form.titulo || form.titulo.trim() === "") {
      return "Tens de dar um título à aula";
    }
    if (!form.professor_id) {
      return "Tens de escolher um professor";
    }
    if (!form.modalidade_id) {
      return "Tens de escolher a modalidade";
    }
    if (!form.estudio_id) {
      return "Tens de escolher um estúdio";
    }
    if (form.hora_inicio >= form.hora_fim) {
      return "A hora de fim tem de ser depois da hora de início";
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
      // url e método dependem se estamos a criar ou editar
      const url = isEdit
        ? `${API}/classes/${classToEdit.id}`
        : `${API}/classes`;

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horario_id: scheduleId,
          dia_semana: form.dia_semana,
          hora_inicio: form.hora_inicio,
          hora_fim: form.hora_fim,
          titulo: form.titulo.trim(),
          professor_id: Number(form.professor_id),
          estudio_id: Number(form.estudio_id),
          modalidade_id: Number(form.modalidade_id)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Não foi possível guardar a aula";
        setMessage?.({ type: "error", text: errorText });
        return;
      }

      setMessage?.({
        type: "success",
        text: isEdit ? "Aula atualizada com sucesso" : "Aula criada com sucesso"
      });

      onSaved?.();
      onClose?.();

    } catch {
      setMessage?.({ type: "error", text: "Não foi possível ligar ao servidor" });
    }
  };

  const handleDelete = async () => {
    if (!classToEdit) return;

    try {
      const res = await fetch(`${API}/classes/${classToEdit.id}`, { method: "DELETE" });

      if (!res.ok) {
        setMessage?.({ type: "error", text: "Não foi possível remover a aula" });
        return;
      }

      setMessage?.({ type: "success", text: "Aula removida com sucesso" });
      onSaved?.();
      onClose?.();

    } catch {
      setMessage?.({ type: "error", text: "Não foi possível ligar ao servidor" });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{isEdit ? "Editar Aula" : "Inserir Aula"}</h2>

      <label>Dia da Semana</label>
      <select
        value={form.dia_semana}
        onChange={(e) => handleChange("dia_semana", e.target.value)}
      >
        {DAYS.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <label>Hora do Começo</label>
      <input
        type="time"
        value={form.hora_inicio}
        onChange={(e) => handleChange("hora_inicio", e.target.value)}
      />

      <label>Hora do Fim</label>
      <input
        type="time"
        value={form.hora_fim}
        onChange={(e) => handleChange("hora_fim", e.target.value)}
      />

      <label>Título</label>
      <input
        value={form.titulo}
        onChange={(e) => handleChange("titulo", e.target.value)}
        placeholder="Ex: Ballet Iniciação"
      />

      <label>Professor</label>
      <select
        value={form.professor_id}
        onChange={(e) => handleChange("professor_id", e.target.value)}
      >
        <option value="">Escolhe um professor</option>
        {professors.map(p => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>

      {/* Modalidade primeiro - serve para filtrar os estúdios disponíveis */}
      <label>Modalidade</label>
      <select
        value={form.modalidade_id}
        onChange={(e) => handleChange("modalidade_id", e.target.value)}
      >
        <option value="">Escolhe a modalidade</option>
        {modalities.map(m => (
          <option key={m.id} value={m.id}>{m.nome}</option>
        ))}
      </select>

      {/* Estúdio - só mostra operacionais e compatíveis com a modalidade */}
      <label>Estúdio</label>
      <select
        value={form.estudio_id}
        onChange={(e) => handleChange("estudio_id", e.target.value)}
        disabled={!form.modalidade_id}
      >
        <option value="">
          {!form.modalidade_id
            ? "Escolhe primeiro a modalidade"
            : availableStudios.length === 0
              ? "Sem estúdios disponíveis para esta modalidade"
              : "Escolhe um estúdio"
          }
        </option>
        {availableStudios.map(s => (
          <option key={s.id} value={s.id}>
            {s.nome} ({s.capacidade_maxima} pessoas)
          </option>
        ))}
      </select>

      <button type="submit" className="submit">
        {isEdit ? "Guardar Alterações" : "Criar Aula"}
      </button>

      {isEdit && (
        <button type="button" className="delete" onClick={handleDelete}>
          Apagar Aula
        </button>
      )}
    </form>
  );
}