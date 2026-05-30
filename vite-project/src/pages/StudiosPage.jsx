import { useState, useEffect } from "react";

import Header from '../components/layout/HeaderGlobal'
import Footer from "../components/layout/Footer";

import "../styles/studiostyle.css";

const API = "http://localhost:3000/api/v1";

const days = [
  "Segunda", "Terça-Feira", "Quarta-Feira",
  "Quinta-Feira", "Sexta-Feira", "Sábado", "Domingo"
];

function getTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDayNameFromDate(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const jsDay = date.getDay();
  const mapping = [6, 0, 1, 2, 3, 4, 5];
  return days[mapping[jsDay]];
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const dayName = getDayNameFromDate(dateStr);
  const day = date.getDate();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return `${dayName}, ${day} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
}

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fromMin(min) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

const TIMELINE_START = 8 * 60;
const TIMELINE_END = 22 * 60;
const TIMELINE_DURATION = TIMELINE_END - TIMELINE_START;

export default function StudiosPage() {
  const [studios, setStudios] = useState([]);
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState(null);
  const [expandedStudio, setExpandedStudio] = useState(null);

  const [filterDate, setFilterDate] = useState(getTodayDate());

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
        setMessage({ type: "error", text: "Não foi possível carregar os estúdios" })
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

  const dayOfWeek = getDayNameFromDate(filterDate);

  function getStudioClasses(studioId) {
    return classes
      .filter(c => c.estudio?.id === studioId && c.dia_semana === dayOfWeek)
      .map(c => ({
        id: c.id,
        titulo: c.titulo,
        start: c.hora_inicio.slice(0, 5),
        end: c.hora_fim.slice(0, 5),
        startMin: toMin(c.hora_inicio.slice(0, 5)),
        endMin: toMin(c.hora_fim.slice(0, 5)),
        professor: c.professor?.utilizador?.nome || ""
      }))
      .sort((a, b) => a.startMin - b.startMin);
  }

  function getFreeSlots(studioClasses) {
    const slots = [];
    let cursor = TIMELINE_START;

    for (const c of studioClasses) {
      if (c.startMin > cursor) {
        slots.push({ startMin: cursor, endMin: c.startMin });
      }
      cursor = Math.max(cursor, c.endMin);
    }

    if (cursor < TIMELINE_END) {
      slots.push({ startMin: cursor, endMin: TIMELINE_END });
    }
    return slots;
  }

  function pctFromMin(min) {
    return ((min - TIMELINE_START) / TIMELINE_DURATION) * 100;
  }

  function widthPct(startMin, endMin) {
    return ((endMin - startMin) / TIMELINE_DURATION) * 100;
  }

  // calcular percentagem de ocupação do dia
  function getOccupationPct(studioClasses) {
    if (studioClasses.length === 0) return 0;
    const occupiedMin = studioClasses.reduce(
      (sum, c) => sum + (c.endMin - c.startMin), 0
    );
    return Math.round((occupiedMin / TIMELINE_DURATION) * 100);
  }

  return (
    <div className="page">
      <Header />

      {message && (
        <div className={`alert ${message.type}`}>{message.text}</div>
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

          <button className="btn-now" onClick={() => setFilterDate(getTodayDate())}>
            Hoje
          </button>
        </div>
      </div>

      <div className="studios-wrapper">

        <div className="studios-header">
          <div>
            <h2>Estúdios disponíveis</h2>
            <p className="studios-subtitle">{formatDateLabel(filterDate)}</p>
          </div>

          <div className="studios-legend">
            <span><i className="legend-dot free"></i> Livre</span>
            <span><i className="legend-dot occupied"></i> Ocupado</span>
          </div>
        </div>

        <div className="studios-grid">
          {studios.map(studio => {
            const studioClasses = getStudioClasses(studio.id);
            const freeSlots = getFreeSlots(studioClasses);
            const occupationPct = getOccupationPct(studioClasses);
            const isFullDayFree = studioClasses.length === 0;
            const isExpanded = expandedStudio === studio.id;

            let statusClass = "free";
            let statusText = "Livre";

            if (occupationPct >= 80) {
              statusClass = "busy";
              statusText = "Muito ocupado";
            } else if (occupationPct > 0) {
              statusClass = "partial";
              statusText = `${occupationPct}% ocupado`;
            }

            return (
              <div
                key={studio.id}
                className={`studio-card ${isExpanded ? "expanded" : ""}`}
              >
                {/* HEADER do cartão */}
                <div className="card-header">
                  <div>
                    <h3>{studio.nome}</h3>
                    {studio.capacidade_maxima && (
                      <p className="card-cap">
                        {studio.capacidade_maxima} pessoas
                      </p>
                    )}
                  </div>

                  <div className={`status-pill ${statusClass}`}>
                    {statusText}
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="card-timeline">
                  <div className="timeline-bar">
                    {freeSlots.map((slot, i) => (
                      <div
                        key={`free-${i}`}
                        className="timeline-block free"
                        style={{
                          left: `${pctFromMin(slot.startMin)}%`,
                          width: `${widthPct(slot.startMin, slot.endMin)}%`
                        }}
                        title={`Livre ${fromMin(slot.startMin)} - ${fromMin(slot.endMin)}`}
                      />
                    ))}

                    {studioClasses.map(c => (
                      <div
                        key={c.id}
                        className="timeline-block occupied"
                        style={{
                          left: `${pctFromMin(c.startMin)}%`,
                          width: `${widthPct(c.startMin, c.endMin)}%`
                        }}
                        title={`${c.titulo} (${c.start} - ${c.end})${c.professor ? " — " + c.professor : ""}`}
                      />
                    ))}
                  </div>

                  <div className="timeline-labels">
                    <span>08h</span>
                    <span>12h</span>
                    <span>16h</span>
                    <span>20h</span>
                    <span>22h</span>
                  </div>
                </div>

                {/* BOTÃO ver detalhes (só aparece se houver aulas) */}
                {!isFullDayFree && (
                  <button
                    className="card-toggle"
                    onClick={() => setExpandedStudio(isExpanded ? null : studio.id)}
                  >
                    {isExpanded ? "Esconder detalhes" : `Ver ${studioClasses.length} ${studioClasses.length === 1 ? "ocupação" : "ocupações"}`}
                  </button>
                )}

                {isFullDayFree && (
                  <div className="card-empty">
                    Sem ocupações neste dia
                  </div>
                )}

                {/* DETALHES — só visível quando expandido */}
                {isExpanded && (
                  <div className="card-details">
                    {studioClasses.map(c => (
                      <div key={c.id} className="detail-item">
                        <div className="detail-time">{c.start} – {c.end}</div>
                        <div className="detail-info">
                          <strong>{c.titulo}</strong>
                          {c.professor && (
                            <span className="detail-prof">{c.professor}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {studios.length === 0 && (
          <p className="empty-message">Não foi possível carregar os estúdios</p>
        )}
      </div>

      <Footer />
    </div>
  );
}