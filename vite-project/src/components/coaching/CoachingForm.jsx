import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CalendarRange, Clock, BookOpen, UserPlus, User, Repeat } from "lucide-react";
import { getModalities, getCoachingTeachers, getAlunosByResponsavel, createCoachingRequest } from "../../api";

function calcPeriodoFim(dataInicio, meses) {
  if (!dataInicio || !meses) return null;
  const d = new Date(dataInicio + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + parseInt(meses, 10));
  return d.toISOString().slice(0, 10);
}


export default function CoachingForm({ onCreated, setMessage }) {
  const navigate = useNavigate();

  const auth = JSON.parse(localStorage.getItem("entartes_auth") || "{}");
  const responsavelId = auth.user?.responsavel_id ?? null;

  const [form, setForm] = useState({
    data: "",
    hora_inicio: "",
    hora_fim: "",
    modalidade: "",
    professor: "",
    aluno: "",
    recorrencia: "",
    periodo: "",
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
    if (!form.modalidade)  return setMessage?.({ type: "error", text: "Escolhe uma modalidade" });
    if (!form.professor)   return setMessage?.({ type: "error", text: "Escolhe um professor" });
    if (!form.aluno)       return setMessage?.({ type: "error", text: "Escolhe um aluno" });
    if (form.recorrencia && !form.periodo) return setMessage?.({ type: "error", text: "Seleciona o período da recorrência" });

    setIsLoading(true);
    try {
      await createCoachingRequest({
        responsavel_id: responsavelId,
        aluno_id:       Number(form.aluno),
        professor_id:   Number(form.professor),
        data:           form.data,
        hora_inicio:    form.hora_inicio,
        hora_fim:       form.hora_fim,
        tipo_aula:      "individual",
        modalidade_id:  Number(form.modalidade),
        ...(form.recorrencia ? {
          recorrencia: form.recorrencia,
          periodo_fim: calcPeriodoFim(form.data, form.periodo),
        } : {}),
      });

      setMessage?.({ type: "success", text: "Pedido de coaching criado com sucesso!" });
      setForm({ data: "", hora_inicio: "", hora_fim: "", modalidade: "", professor: "", aluno: "", recorrencia: "", periodo: "" });
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
          onClick={() => navigate("/meus-pedidos")}
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

        {/* Recorrência */}
        <div className="cb-pill">
          <Repeat size={16} className="cb-pill-icon" />
          <select value={form.recorrencia} onChange={e => set("recorrencia", e.target.value)}>
            <option value="">Sem recorrência</option>
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
        </div>

        {/* Período — visível apenas com recorrência activa */}
        {form.recorrencia && (
          <div className="cb-pill">
            <CalendarRange size={16} className="cb-pill-icon" />
            <select value={form.periodo} onChange={e => set("periodo", e.target.value)}>
              <option value="">Seleciona o período</option>
              <option value="1">1 mês</option>
              <option value="2">2 meses</option>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">1 ano</option>
            </select>
          </div>
        )}

        {/* Modalidade */}
        <div className="cb-pill">
          <BookOpen size={16} className="cb-pill-icon" />
          <select
            value={form.modalidade}
            onChange={e => setForm(prev => ({ ...prev, modalidade: e.target.value, professor: "" }))}
          >
            <option value="">Modalidade</option>
            {modalities.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        {/* Professor — filtrado pela modalidade selecionada */}
        <div className="cb-pill">
          <UserPlus size={16} className="cb-pill-icon" />
          <select value={form.professor} onChange={e => set("professor", e.target.value)}>
            <option value="">Professor</option>
            {teachers
              .filter(t => {
                if (!form.modalidade) return true;
                const nome = modalities.find(m => String(m.id) === String(form.modalidade))?.nome;
                if (!nome) return true;
                const norm = s => (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
                return norm(t.modalidade) === norm(nome);
              })
              .map(t => (
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
