import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Pencil, BookOpen, UserPlus, User } from "lucide-react";
import { getModalities, getCoachingTeachers, getAlunosByResponsavel, createCoachingRequest } from "../../api";

const TIPO_AULA_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "grupo",      label: "Grupo" },
  { value: "workshop",   label: "Workshop" },
];

export default function CoachingForm({ onCreated, setMessage }) {
  const navigate = useNavigate();

  const auth = JSON.parse(localStorage.getItem("entartes_auth") || "{}");
  const responsavelId = auth.user?.responsavel_id ?? null;

  const [form, setForm] = useState({
    data: "",
    hora_inicio: "",
    hora_fim: "",
    tipo_aula: "",
    modalidade: "",
    professor: "",
    aluno: "",
  });

  const [modalities, setModalities]   = useState([]);
  const [teachers,   setTeachers]     = useState([]);
  const [alunos,     setAlunos]       = useState([]);
  const [isLoading,  setIsLoading]    = useState(false);

  useEffect(() => {
    getModalities()
      .then(setModalities)
      .catch(() => setMessage?.({ type: "error", text: "Erro ao carregar modalidades" }));

    getCoachingTeachers()
      .then(setTeachers)
      .catch(() => setMessage?.({ type: "error", text: "Erro ao carregar professores" }));

    if (responsavelId) {
      getAlunosByResponsavel(responsavelId)
        .then(setAlunos)
        .catch(() => setMessage?.({ type: "error", text: "Erro ao carregar alunos" }));
    }
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleHoraInicio = (value) => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      const fim = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      setForm(prev => ({ ...prev, hora_inicio: value, hora_fim: fim }));
    } else {
      set("hora_inicio", value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!responsavelId)    return setMessage?.({ type: "error", text: "Utilizador sem perfil de responsável" });
    if (!form.data)        return setMessage?.({ type: "error", text: "Seleciona uma data" });
    if (!form.hora_inicio) return setMessage?.({ type: "error", text: "Seleciona a hora de início" });
    if (!form.hora_fim)    return setMessage?.({ type: "error", text: "Seleciona a hora de fim" });
    if (!form.tipo_aula)   return setMessage?.({ type: "error", text: "Escolhe um tipo de aula" });
    if (!form.modalidade)  return setMessage?.({ type: "error", text: "Escolhe uma modalidade" });
    if (!form.professor)   return setMessage?.({ type: "error", text: "Escolhe um professor" });
    if (!form.aluno)       return setMessage?.({ type: "error", text: "Escolhe um aluno" });

    setIsLoading(true);
    try {
      await createCoachingRequest({
        responsavel_id: responsavelId,
        aluno_id:       Number(form.aluno),
        professor_id:   Number(form.professor),
        data:           form.data,
        hora_inicio:    form.hora_inicio,
        hora_fim:       form.hora_fim,
        tipo_aula:      form.tipo_aula,
        modalidade_id:  Number(form.modalidade),
      });

      setMessage?.({ type: "success", text: "Pedido de coaching criado com sucesso!" });
      setForm({ data: "", hora_inicio: "", hora_fim: "", tipo_aula: "", modalidade: "", professor: "", aluno: "" });
      onCreated?.();
    } catch (err) {
      setMessage?.({ type: "error", text: err.message || "Erro ao criar o pedido de coaching" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="cb-form-card">
      <div className="cb-form-header">
        <button
          type="button"
          className="cb-back-btn"
          onClick={() => navigate("/aulas-disponiveis")}
        >
          ←
        </button>
        <h2>Pedido Coaching</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Data */}
        <div className="cb-pill">
          <Calendar size={16} className="cb-pill-icon" />
          <input
            type="date"
            value={form.data}
            onChange={e => set("data", e.target.value)}
          />
        </div>

        {/* Hora início + fim */}
        <div className="cb-pill-pair">
          <div className="cb-pill cb-pill--half">
            <Clock size={15} className="cb-pill-icon" />
            <input
              type="time"
              value={form.hora_inicio}
              onChange={e => handleHoraInicio(e.target.value)}
            />
          </div>
          <div className="cb-pill cb-pill--half">
            <Clock size={15} className="cb-pill-icon" />
            <input
              type="time"
              value={form.hora_fim}
              onChange={e => set("hora_fim", e.target.value)}
            />
          </div>
        </div>

        {/* Tipo de aula */}
        <div className="cb-pill">
          <Pencil size={16} className="cb-pill-icon" />
          <select value={form.tipo_aula} onChange={e => set("tipo_aula", e.target.value)}>
            <option value="">Tipo de aula</option>
            {TIPO_AULA_OPTIONS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Modalidade */}
        <div className="cb-pill">
          <BookOpen size={16} className="cb-pill-icon" />
          <select value={form.modalidade} onChange={e => set("modalidade", e.target.value)}>
            <option value="">Modalidade</option>
            {modalities.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        {/* Professor */}
        <div className="cb-pill">
          <UserPlus size={16} className="cb-pill-icon" />
          <select value={form.professor} onChange={e => set("professor", e.target.value)}>
            <option value="">Professor</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>

        {/* Aluno */}
        <div className="cb-pill">
          <User size={16} className="cb-pill-icon" />
          <select value={form.aluno} onChange={e => set("aluno", e.target.value)}>
            <option value="">Aluno</option>
            {alunos.map(a => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="cb-submit-btn" disabled={isLoading}>
          {isLoading ? "A enviar..." : "Realizar pedido"}
        </button>
      </form>
    </article>
  );
}
