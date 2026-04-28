import { useState, useEffect } from "react";

const API = "http://localhost:3000/api/v1";

export default function LessonForm({ event, schedule, onClose, onCreated, setMessage }) {
  const isEdit = !!event;

  const [form, setForm] = useState({
    dia_semana: "Segunda",
    hora_inicio: "",
    hora_fim: "",
    titulo: "",
    professor_id: "",
    estudio_id: "",
    modalidade_id: ""
  });

  const [teachers, setTeachers] = useState([]);
  const [studios, setStudios] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // carregar professores
  useEffect(() => {
    fetch(`${API}/teachers`)
      .then(res => res.json())
      .then(data => setTeachers(Array.isArray(data) ? data : []))
      .catch(() => setTeachers([]));
  }, []);

  // carregar estúdios
  useEffect(() => {
    fetch(`${API}/studios`)
      .then(res => res.json())
      .then(data => setStudios(Array.isArray(data) ? data : []))
      .catch(() => setStudios([]));
  }, []);

  // carregar modalidades quando muda o estúdio
  useEffect(() => {
    if (!form.estudio_id) {
      setModalities([]);
      return;
    }

    fetch(`${API}/modalities/by-studio?estudio_id=${form.estudio_id}`)
      .then(res => res.json())
      .then(data => setModalities(Array.isArray(data) ? data : []))
      .catch(() => setModalities([]));
  }, [form.estudio_id]);

  // preencher form ao editar
  useEffect(() => {
    if (!event) return;

    setForm(prev => ({
      ...prev,
      dia_semana: event.day || "Segunda",
      hora_inicio: event.start || "",
      hora_fim: event.end || "",
      titulo: event.title || "",
      estudio_id: event.estudio_id || "",
      modalidade_id: event.modalidade_id || ""
    }));
  }, [event]);

  // mapear nome → id do professor
  useEffect(() => {
    if (!event || teachers.length === 0) return;

    const teacher = teachers.find(
      t => t.utilizador?.nome === event.professor
    );

    if (teacher) {
      setForm(prev => ({
        ...prev,
        professor_id: teacher.id
      }));
    }
  }, [event, teachers]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };

      // se mudou o estúdio, limpa a modalidade (pode não ser válida no novo estúdio)
      if (field === "estudio_id" && value !== prev.estudio_id) {
        next.modalidade_id = "";
      }

      return next;
    });
  };

  const formatTimeInput = (value) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + ":" + v.slice(2);
    return v;
  };

  const isValidTime = (t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

  const validateForm = () => {
    if (!form.hora_inicio || !form.hora_fim) {
      return "Tens de preencher a hora de início e a hora de fim";
    }
    if (!isValidTime(form.hora_inicio)) {
      return "A hora de início está num formato inválido (usa HH:mm, ex: 18:30)";
    }
    if (!isValidTime(form.hora_fim)) {
      return "A hora de fim está num formato inválido (usa HH:mm, ex: 19:30)";
    }
    if (!form.titulo || form.titulo.trim() === "") {
      return "Tens de dar um título à aula";
    }
    if (!form.professor_id) {
      return "Tens de escolher um professor";
    }
    if (!form.estudio_id) {
      return "Tens de escolher um estúdio";
    }
    if (!form.modalidade_id) {
      return "Tens de escolher uma modalidade";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!schedule) {
      setMessage?.({ type: "error", text: "Não tens nenhum horário selecionado" });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setMessage?.({ type: "error", text: validationError });
      return;
    }

    try {
      const url = isEdit ? `${API}/classes/${event.id}` : `${API}/classes`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dia_semana: form.dia_semana,
          hora_inicio: form.hora_inicio,
          hora_fim: form.hora_fim,
          titulo: form.titulo,
          professor_id: Number(form.professor_id),
          estudio_id: Number(form.estudio_id),
          modalidade_id: Number(form.modalidade_id),
          horario_id: schedule.id
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

      onCreated?.();
      onClose?.();

    } catch {
      setMessage?.({
        type: "error",
        text: "Não foi possível ligar ao servidor"
      });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/classes/${event.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        setMessage?.({ type: "error", text: "Não foi possível remover a aula" });
        return;
      }

      setMessage?.({ type: "success", text: "Aula removida com sucesso" });
      onCreated?.();
      onClose?.();

    } catch {
      setMessage?.({ type: "error", text: "Não foi possível ligar ao servidor" });
    }
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <h2>{isEdit ? "Editar Aula" : "Inserir Aula"}</h2>

        <label>Dia da Semana</label>
        <select
          value={form.dia_semana}
          onChange={(e) => handleChange("dia_semana", e.target.value)}
        >
          <option>Segunda</option>
          <option>Terça-Feira</option>
          <option>Quarta-Feira</option>
          <option>Quinta-Feira</option>
          <option>Sexta-Feira</option>
          <option>Sábado</option>
          <option>Domingo</option>
        </select>

        <label>Hora do Começo</label>
        <input
          type="text"
          placeholder="HH:mm (ex: 18:30)"
          value={form.hora_inicio}
          onChange={(e) =>
            handleChange("hora_inicio", formatTimeInput(e.target.value))
          }
        />

        <label>Hora do Fim</label>
        <input
          type="text"
          placeholder="HH:mm (ex: 19:30)"
          value={form.hora_fim}
          onChange={(e) =>
            handleChange("hora_fim", formatTimeInput(e.target.value))
          }
        />

        <label>Título</label>
        <input
          placeholder="Ex: Ballet Iniciação"
          value={form.titulo}
          onChange={(e) => handleChange("titulo", e.target.value)}
        />

        <label>Professor</label>
        <select
          value={form.professor_id}
          onChange={(e) => handleChange("professor_id", e.target.value)}
        >
          <option value="">Selecionar professor</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>
              {t.utilizador?.nome}
            </option>
          ))}
        </select>

        <label>Estúdio</label>
        <select
          value={form.estudio_id}
          onChange={(e) => handleChange("estudio_id", e.target.value)}
        >
          <option value="">Selecionar estúdio</option>
          {studios.map(s => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>

        <label>Modalidade</label>
        <select
          value={form.modalidade_id}
          onChange={(e) => handleChange("modalidade_id", e.target.value)}
          disabled={!form.estudio_id}
        >
          <option value="">
            {form.estudio_id
              ? "Selecionar modalidade"
              : "Escolhe um estúdio primeiro"}
          </option>
          {modalities.map(m => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>

        <button type="submit" className="submit">
          {isEdit ? "Guardar Alterações" : "Criar Aula"}
        </button>

        {isEdit && (
          <button
            type="button"
            className="delete"
            onClick={() => setShowConfirm(true)}
          >
            Apagar Aula
          </button>
        )}
      </form>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Apagar aula?</h3>
            <p>Esta ação não pode ser desfeita. Tens a certeza?</p>

            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>

              <button
                className="delete"
                onClick={async () => {
                  setShowConfirm(false);
                  await handleDelete();
                }}
              >
                Sim, apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}