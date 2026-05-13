import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, CheckSquare } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/availablelessionsstyle.css";

const MOCK_LESSONS = [
  { id: 1, titulo: "Ballet crianças - Prof. Diana", hora_inicio: "19:00", vagas_disponiveis: 1, data: "2026-04-30" },
  { id: 2, titulo: "Ballet clássico- Prof. João",   hora_inicio: "18:30", vagas_disponiveis: 2, data: "2026-04-30" },
  { id: 3, titulo: "Ballet clássico- Prof. João",   hora_inicio: "18:30", vagas_disponiveis: 2, data: "2026-04-30" },
  { id: 4, titulo: "Ballet clássico- Prof. João",   hora_inicio: "18:30", vagas_disponiveis: 2, data: "2026-04-30" },
  { id: 5, titulo: "Contemporary - Prof. Maria",    hora_inicio: "20:00", vagas_disponiveis: 3, data: "2026-04-30" },
  { id: 6, titulo: "Jazz - Prof. Carlos",           hora_inicio: "19:30", vagas_disponiveis: 1, data: "2026-04-30" },
  { id: 7, titulo: "Hip Hop - Prof. Sofia",         hora_inicio: "18:00", vagas_disponiveis: 2, data: "2026-05-01" },
  { id: 8, titulo: "Dança Moderna - Prof. Pedro",   hora_inicio: "17:30", vagas_disponiveis: 4, data: "2026-05-01" },
];

const ITEMS_PER_PAGE = 4;

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1, 2, 3];
  if (current > 4) pages.push("...");
  if (current > 3 && current < total - 2) pages.push(current);
  if (total - 1 > 3 && !pages.includes(total - 1)) pages.push("...");
  pages.push(total - 1, total);
  return [...new Set(pages)];
}

export default function AvailableLessonsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm]   = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage]  = useState(1);
  const [message, setMessage]          = useState(null);
  const [enrolled, setEnrolled]        = useState(() => {
    const saved = localStorage.getItem("enrolledLessons");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const filtered = MOCK_LESSONS.filter(l => {
    const matchName = !searchTerm || l.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = !selectedDate || l.data === selectedDate;
    return matchName && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page       = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleEnroll = (lesson) => {
    if (enrolled.includes(lesson.id)) return;
    if (lesson.vagas_disponiveis === 0) {
      setMessage({ type: "error", text: "Sem vagas disponíveis." });
      return;
    }
    const next = [...enrolled, lesson.id];
    setEnrolled(next);
    localStorage.setItem("enrolledLessons", JSON.stringify(next));
    setMessage({ type: "success", text: `Inscrição em "${lesson.titulo}" realizada!` });
  };

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="page">
      <HeaderGlobal />

      <main className="al-main">
        <img src="/images/Entartes-5.png" alt="" className="al-bg" />
        <div className="al-overlay" />

        {message && (
          <div className={`al-alert al-alert--${message.type}`}>{message.text}</div>
        )}

        <div className="al-coaching-btn-wrap">
          <button
            type="button"
            className="al-coaching-btn"
            onClick={() => navigate("/coaching-booking")}
          >
            Pedidos de coaching
            <span className="al-coaching-plus">+</span>
          </button>
        </div>

        <div className="al-content">
          <div className="al-toolbar">
            <div className="al-search-pill">
              <input
                type="text"
                placeholder="Nome da aula"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <Search size={16} strokeWidth={2} />
            </div>
            <div className="al-date-pill">
              <input
                type="date"
                placeholder="Data"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setCurrentPage(1); }}
              />
              <Calendar size={16} strokeWidth={2} />
            </div>
          </div>

          <div className="al-grid">
            {paginated.length === 0 ? (
              <p className="al-empty">Nenhuma aula encontrada</p>
            ) : (
              paginated.map(lesson => {
                const isEnrolled = enrolled.includes(lesson.id);
                return (
                  <article key={lesson.id} className="al-card">
                    <h3 className="al-card__title">{lesson.titulo}</h3>
                    <p className="al-card__info">
                      {lesson.hora_inicio} - {lesson.vagas_disponiveis} vaga{lesson.vagas_disponiveis !== 1 ? "s" : ""}
                    </p>
                    <button
                      type="button"
                      className={`al-card__btn${isEnrolled ? " al-card__btn--enrolled" : ""}`}
                      onClick={() => handleEnroll(lesson)}
                      disabled={isEnrolled || lesson.vagas_disponiveis === 0}
                    >
                      {isEnrolled ? "Inscrito" : "Inscrever"}
                      <CheckSquare size={16} strokeWidth={2} />
                    </button>
                  </article>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="al-pagination">
              <button
                type="button"
                className="al-page-nav"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>

              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="al-page-dots">...</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`al-page-num${p === page ? " al-page-num--active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                className="al-page-nav"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
