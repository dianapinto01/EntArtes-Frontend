import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/professordashboardstyle.css";

const mockClasses = [
  { id: 1, date: "2026-05-05", time: "14:30", title: "João" },
  { id: 2, date: "2026-05-05", time: "16:00", title: "Ana" },
  { id: 3, date: "2026-05-06", time: "10:00", title: "Mariana" },
  { id: 4, date: "2026-05-07", time: "11:30", title: "Pedro" },
  { id: 5, date: "2026-05-08", time: "14:00", title: "Rita" },
  { id: 6, date: "2026-05-10", time: "15:30", title: "Sofia" },
];

const NAV_ITEMS = [
  { label: "Coaching",            desc: "Marque aqui sessões privadas",       path: "/coaching" },
  { label: "Inventário",          desc: "Alugue ou publique o seu figurino",  path: null },
  { label: "Horário",             desc: "Consulte o seu horário",             path: "/schedule" },
  { label: "Estúdios",            desc: "Consulte os estúdios disponíveis",   path: null },
  { label: "Estatísticas",        desc: "Confira as estatísticas pessoais",   path: null },
  { label: "Inserção de horário", desc: "Insira o horário para coachings",    path: null },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildMonthDays(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true });
  }
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false });
  }

  return days;
}

export default function ProfessorDashboardPage() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selection, setSelection] = useState({
    start: formatDate(today),
    end: formatDate(today),
  });

  const monthDays = useMemo(() => buildMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const visibleClasses = useMemo(() => {
    return mockClasses
      .filter(item => item.date >= selection.start && item.date <= selection.end)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 2);
  }, [selection]);

  const selectDay = (date) => {
    const dayStr = formatDate(date);
    if (selection.start === selection.end) {
      if (dayStr < selection.start) {
        setSelection({ start: dayStr, end: selection.start });
      } else {
        setSelection({ start: selection.start, end: dayStr });
      }
    } else {
      setSelection({ start: dayStr, end: dayStr });
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getDayClass = (date, currentMonth) => {
    if (!currentMonth) return "cal-day cal-day--other";
    const dayStr = formatDate(date);
    if (dayStr === selection.start || dayStr === selection.end) return "cal-day cal-day--selected";
    if (dayStr > selection.start && dayStr < selection.end) return "cal-day cal-day--range";
    return "cal-day";
  };

  const years = [];
  for (let y = today.getFullYear() - 2; y <= today.getFullYear() + 3; y++) years.push(y);

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      <nav className={`prof-sidebar${menuOpen ? " prof-sidebar--open" : ""}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            type="button"
            className={`prof-nav-item${!item.path ? " prof-nav-item--disabled" : ""}`}
            onClick={() => { if (item.path) { setMenuOpen(false); navigate(item.path); } }}
          >
            <Star size={20} strokeWidth={1.5} className="prof-nav-icon" />
            <span className="prof-nav-text">
              <span className="prof-nav-label">{item.label}</span>
              <span className="prof-nav-desc">{item.desc}</span>
            </span>
          </button>
        ))}
      </nav>

      {menuOpen && (
        <div
          className="prof-sidebar-overlay"
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && setMenuOpen(false)}
        />
      )}

      <main className="prof-main">
        <div className="prof-content">
          <div className="prof-calendar-card">
            <div className="cal-nav">
              <button type="button" className="cal-arrow" onClick={prevMonth}>&#8249;</button>
              <div className="cal-selects">
                <select value={viewMonth} onChange={e => setViewMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={viewYear} onChange={e => setViewYear(Number(e.target.value))}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button type="button" className="cal-arrow" onClick={nextMonth}>&#8250;</button>
            </div>

            <div className="cal-grid">
              {DAY_LABELS.map(d => (
                <div key={d} className="cal-header">{d}</div>
              ))}
              {monthDays.map(({ date, currentMonth }) => (
                <button
                  key={formatDate(date)}
                  type="button"
                  className={getDayClass(date, currentMonth)}
                  onClick={() => currentMonth && selectDay(date)}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>
          </div>

          <div className="prof-classes">
            {visibleClasses.length === 0 ? (
              <div className="prof-class-card prof-class-empty">Sem aulas neste período</div>
            ) : (
              visibleClasses.map(item => (
                <article key={item.id} className="prof-class-card">
                  Aula - {item.title} às {item.time}
                </article>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
