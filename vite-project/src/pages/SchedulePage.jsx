import { useState, useEffect } from "react";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ScheduleGrid from "../components/schedule/ScheduleGrid";

import AcademicYearForm from "../components/schedule/AcademicYearForm";
import LessonForm from "../components/schedule/LessonForm";

import "../styles/toolbarstyle.css";
import "../styles/schedulestyle.css";

const API = "http://localhost:3000/api/v1";

export default function SchedulePage() {
  const [activeForm, setActiveForm] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [events, setEvents] = useState([]);
  const [schedule, setSchedule] = useState(null);

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");

  const [allSchedules, setAllSchedules] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [message, setMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // auto hide mensagem
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // carregar horários e abrir o primeiro automaticamente
  useEffect(() => {
    fetch(`${API}/schedules`)
      .then(res => res.json())
      .then(data => {
        setAllSchedules(data);

        if (data && data.length > 0) {
          loadScheduleById(data[0].id);
          setSearch(data[0].nome);
          setYear(data[0].ano_letivo);
        }
      })
      .catch(() =>
        setMessage({
          type: "error",
          text: "Não foi possível carregar os horários. Verifica se o servidor está a correr."
        })
      );
  }, []);

  // recarregar lista de horários (sem mexer no horário aberto)
  function loadSchedules() {
    fetch(`${API}/schedules`)
      .then(res => res.json())
      .then(data => setAllSchedules(data))
      .catch(() =>
        setMessage({
          type: "error",
          text: "Não foi possível carregar os horários"
        })
      );
  }

  // carregar um horário pelo id
  async function loadScheduleById(id) {
    try {
      const res = await fetch(`${API}/schedules/${id}/full`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      setSchedule(data.schedule);

      const mapped = data.classes.map(c => ({
        id: c.id,
        day: c.dia_semana,
        start: c.hora_inicio.slice(0, 5),
        end: c.hora_fim.slice(0, 5),
        title: c.titulo,
        professor: c.professor?.utilizador?.nome || "",
        estudio: c.estudio?.nome || "",
        estudio_id: c.estudio?.id || "",
        modalidade: c.modalidade?.nome || "",
        modalidade_id: c.modalidade?.id || ""
      }));

      setEvents(mapped);
    } catch {
      // se falhar, fica em branco
    }
  }

  // autocomplete
  const handleInputChange = (value) => {
    setSearch(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = allSchedules.filter(s =>
      s.nome.toLowerCase().includes(value.toLowerCase()) &&
      (!year || s.ano_letivo === year)
    );

    setSuggestions(filtered);
  };

  // procurar horário
  async function handleSearch() {
    try {
      if (!search || !year) {
        setMessage({
          type: "error",
          text: "Escreve o nome do horário e escolhe o ano letivo antes de procurar"
        });
        return;
      }

      const res = await fetch(
        `${API}/schedules/search?nome=${encodeURIComponent(search)}&ano_letivo=${year}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      setSchedule(data.schedule);

      const mapped = data.classes.map(c => ({
        id: c.id,
        day: c.dia_semana,
        start: c.hora_inicio.slice(0, 5),
        end: c.hora_fim.slice(0, 5),
        title: c.titulo,
        professor: c.professor?.utilizador?.nome || "",
        estudio: c.estudio?.nome || "",
        estudio_id: c.estudio?.id || "",
        modalidade: c.modalidade?.nome || "",
        modalidade_id: c.modalidade?.id || ""
      }));

      setEvents(mapped);
      setSuggestions([]);

    } catch {
      setMessage({
        type: "error",
        text: `Não existe nenhum horário "${search}" para o ano ${year}`
      });
      setEvents([]);
      setSchedule(null);
    }
  }

  // reload calendário (depois de criar/editar/apagar aula)
  async function reloadSchedule() {
    if (!schedule) return;

    try {
      const res = await fetch(`${API}/schedules/${schedule.id}/full`);
      const data = await res.json();

      const mapped = data.classes.map(c => ({
        id: c.id,
        day: c.dia_semana,
        start: c.hora_inicio.slice(0, 5),
        end: c.hora_fim.slice(0, 5),
        title: c.titulo,
        professor: c.professor?.utilizador?.nome || "",
        estudio: c.estudio?.nome || "",
        estudio_id: c.estudio?.id || "",
        modalidade: c.modalidade?.nome || "",
        modalidade_id: c.modalidade?.id || ""
      }));

      setEvents(mapped);
    } catch {
      setMessage({
        type: "error",
        text: "Não foi possível atualizar o horário"
      });
    }
  }

  // apagar horário
  async function handleDeleteSchedule() {
    if (!schedule) return;

    try {
      const res = await fetch(
        `${API}/schedules/${schedule.id}/inactivate`,
        { method: "PATCH" }
      );

      if (!res.ok) {
        setMessage({
          type: "error",
          text: "Não foi possível apagar o horário"
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Horário apagado com sucesso"
      });

      setSchedule(null);
      setEvents([]);
      setSearch("");
      setYear("");
      loadSchedules();

    } catch {
      setMessage({
        type: "error",
        text: "Não foi possível apagar o horário"
      });
    }
  }

  return (
    <div className="page">
      <Header />

      {/* TOOLBAR */}
      <div className="toolbar-wrapper">
        <div className="toolbar">

          <div className="toolbar__search" style={{ position: "relative" }}>
            <input
              placeholder="Nome do horário..."
              value={search}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />

            <span onClick={handleSearch} style={{ cursor: "pointer" }}>
              &#x1F50E;&#xFE0E;
            </span>

            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map(s => (
                  <div
                    key={s.id}
                    className="suggestion-item"
                    onClick={() => {
                      setSearch(s.nome);
                      setYear(s.ano_letivo);
                      setSuggestions([]);
                    }}
                  >
                    {s.nome} ({s.ano_letivo})
                  </div>
                ))}
              </div>
            )}
          </div>

          <select
            className="toolbar__year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Ano letivo</option>
            <option value="2025/2026">2025/2026</option>
          </select>

          <div className="toolbar__actions">
            <button onClick={() => setActiveForm("year")}>
              Inserir Horário Letivo
            </button>

            <button onClick={() => {
              if (!schedule) {
                setMessage({
                  type: "error",
                  text: "Procura um horário primeiro antes de adicionar uma aula"
                });
                return;
              }

              setSelectedEvent(null);
              setActiveForm("lesson");
            }}>
              Inserir Aula
            </button>

            {activeForm && (
              <button onClick={() => {
                setActiveForm(null);
                setSelectedEvent(null);
              }}>
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className={`schedule-wrapper ${activeForm ? "shift" : ""}`}>

        {schedule && (
          <div className="schedule-title">
            <div>
              <h2>{schedule.nome}</h2>
              <span>{schedule.ano_letivo}</span>
            </div>

            <button
              className="delete"
              onClick={() => setShowConfirm(true)}
            >
              Apagar Horário
            </button>
          </div>
        )}

        <div className="schedule-area">

          {message && (
            <div className={`alert ${message.type}`}>
              {message.text}
            </div>
          )}

          {schedule && (
            <ScheduleGrid
              events={events}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setActiveForm("editLesson");
              }}
            />
          )}

          {schedule && events.length === 0 && (
            <p className="empty-message">
              Este horário ainda não tem aulas
            </p>
          )}
        </div>

        {activeForm && (
          <div className="form-area">

            {activeForm === "year" && (
              <AcademicYearForm
                onClose={() => setActiveForm(null)}
                onCreated={loadSchedules}
                setMessage={setMessage}
              />
            )}

            {activeForm === "lesson" && (
              <LessonForm
                schedule={schedule}
                onClose={() => setActiveForm(null)}
                onCreated={reloadSchedule}
                setMessage={setMessage}
              />
            )}

            {activeForm === "editLesson" && (
              <LessonForm
                event={selectedEvent}
                schedule={schedule}
                onClose={() => setActiveForm(null)}
                onCreated={reloadSchedule}
                setMessage={setMessage}
              />
            )}

          </div>
        )}

      </div>

      {/* MODAL apagar horário */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Apagar horário?</h3>
            <p>Todas as aulas associadas também serão apagadas. Esta ação não pode ser desfeita.</p>

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
                  await handleDeleteSchedule();
                }}
              >
                Sim, apagar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}