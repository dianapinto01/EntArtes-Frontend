import { useState, useEffect } from "react";

import Header from '../components/layout/HeaderGlobal'
import Footer from "../components/layout/Footer";

import "../styles/studiostyle.css";

const API = "http://localhost:3000/api/v1";

const days = [
  "Segunda", "Terça-Feira", "Quarta-Feira",
  "Quinta-Feira", "Sexta-Feira", "Sábado", "Domingo"
];

// data em formato YYYY-MM-DD
function getTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCurrentTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// ler data YYYY-MM-DD e devolver o nome do dia da semana
function getDayNameFromDate(dateStr) {
  const date = new Date(dateStr + "T12:00:00"); // meio-dia para evitar problemas de fuso horário
  const jsDay = date.getDay();
  const mapping = [6, 0, 1, 2, 3, 4, 5];
  return days[mapping[jsDay]];
}

// formatar data para apresentação (ex: "20 de Abril de 2025")
function formatDateLabel(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const dayName = getDayNameFromDate(dateStr);
  const day = date.getDate();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} de ${month} de ${year}`;
}

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isValidTime(t) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

export default function StudiosPage() {
  const [studios, setStudios] = useState([]);
  const [classes, setClasses] = useState([]);
  const [coachings, setCoachings] = useState([]);
  const [message, setMessage] = useState(null);

  const [filterDate, setFilterDate] = useState(getTodayDate());
  const [filterTime, setFilterTime] = useState(getCurrentTime());

  // auto hide mensagem
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    fetch(`${API}/studios`)
      .then(res => res.json())
      .then(data => setStudios(Array.isArray(data) ? data : []))
      .catch(() =>
        setMessage({
          type: "error",
          text: "Não foi possível carregar os estúdios"
        })
      );
  }, []);

  useEffect(() => {
    fetch(`${API}/schedules`)
      .then(res => res.json())
      .then(async (schedules) => {
        if (!schedules || schedules.length === 0) return;

        const allClasses = [];
        for (const s of schedules) {
          const res = await fetch(`${API}/schedules/${s.id}/full`);
          if (res.ok) {
            const data = await res.json();
            allClasses.push(...data.classes);
          }
        }
        setClasses(allClasses);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/coachings`)
      .then(res => res.json())
      .then(data => setCoachings(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // verificar conflito por aula (recorrente — usa o dia da semana da data escolhida)
  function getClassConflict(studioId) {
    if (!isValidTime(filterTime)) return null;

    const dayName = getDayNameFromDate(filterDate);
    const filterMin = toMin(filterTime);

    return classes.find(c => {
      if (c.estudio?.id !== studioId) return false;
      if (c.dia_semana !== dayName) return false;

      const start = toMin(c.hora_inicio.slice(0, 5));
      const end = toMin(c.hora_fim.slice(0, 5));

      return filterMin >= start && filterMin < end;
    });
  }

  // verificar conflito por coaching (data específica)
  function getCoachingConflict(studioId) {
    if (!isValidTime(filterTime)) return null;

    return coachings.find(s => {
      if (s.estudio_id !== studioId) return false;

      const start = new Date(s.data_inicio);
      const end = new Date(s.data_fim);

      // verificar se a data coincide
      const sessionDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
      if (sessionDate !== filterDate) return false;

      const startMin = start.getHours() * 60 + start.getMinutes();
      const endMin = end.getHours() * 60 + end.getMinutes();
      const filterMin = toMin(filterTime);

      return filterMin >= startMin && filterMin < endMin;
    });
  }

  function getOccupation(studioId) {
    const aula = getClassConflict(studioId);
    if (aula) {
      return {
        type: "aula",
        title: aula.titulo,
        start: aula.hora_inicio.slice(0, 5),
        end: aula.hora_fim.slice(0, 5),
        professor: aula.professor?.utilizador?.nome || ""
      };
    }

    const coaching = getCoachingConflict(studioId);
    if (coaching) {
      const start = new Date(coaching.data_inicio);
      const end = new Date(coaching.data_fim);
      const fmt = (d) =>
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

      return {
        type: "coaching",
        title: "Sessão de Coaching",
        start: fmt(start),
        end: fmt(end),
        professor: ""
      };
    }

    return null;
  }

  const formatTimeInput = (value) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + ":" + v.slice(2);
    return v;
  };

  function handleNow() {
    setFilterDate(getTodayDate());
    setFilterTime(getCurrentTime());
  }

  return (
    <div className="page">
      <Header />

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="studios-toolbar-wrapper">
        <div className="studios-toolbar">

          <div className="studios-filter">
            <label>Data</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="studios-filter">
            <label>Hora</label>
            <input
              type="text"
              placeholder="HH:mm"
              value={filterTime}
              onChange={(e) => setFilterTime(formatTimeInput(e.target.value))}
            />
          </div>

          <button className="btn-now" onClick={handleNow}>
            Agora
          </button>
        </div>
      </div>

      <div className="studios-wrapper">

        <div className="studios-title">
          <h2>Estúdios disponíveis</h2>
          <span>{formatDateLabel(filterDate)} às {filterTime}</span>
        </div>

        <div className="studios-grid">
          {studios.map(studio => {
            const occupation = getOccupation(studio.id);

            return (
              <div
                key={studio.id}
                className={`studio-card ${occupation ? "occupied" : "free"}`}
              >
                <h3>{studio.nome}</h3>

                {studio.descricao && (
                  <p className="studio-desc">{studio.descricao}</p>
                )}

                {studio.capacidade_maxima && (
                  <p className="studio-cap">
                    Capacidade: {studio.capacidade_maxima} pessoas
                  </p>
                )}

                <div className={`status-badge ${occupation ? "occupied" : "free"}`}>
                  <span className="dot"></span>
                  {occupation ? "Ocupado" : "Livre"}
                </div>

                {occupation && (
                  <div className="occupied-info">
                    <p className="info-title">
                      {occupation.title}
                      <span className={`type-tag ${occupation.type}`}>
                        {occupation.type === "aula" ? "Aula" : "Coaching"}
                      </span>
                    </p>
                    <p className="info-time">
                      {occupation.start} - {occupation.end}
                    </p>
                    {occupation.professor && (
                      <p className="info-prof">{occupation.professor}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {studios.length === 0 && (
          <p className="empty-message">
            Não foi possível carregar os estúdios
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}