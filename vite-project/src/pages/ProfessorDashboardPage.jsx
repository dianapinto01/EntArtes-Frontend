import { useMemo, useState, useEffect, useCallback } from "react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Sidebar from "../components/layout/sidebar";
import Footer from "../components/layout/Footer";
import "../styles/professordashboardstyle.css";

const API = "http://localhost:3000/api/v1";


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
  const today = useMemo(() => new Date(), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selection, setSelection] = useState({
    start: formatDate(today),
    end: formatDate(today),
  });
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const monthDays = useMemo(() => buildMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const loadApprovedRequests = useCallback(async () => {
    const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
    const userId = auth?.user?.id ?? null;
    if (!userId) { setLoadingClasses(false); return; }

    try {
      const teachersRes = await fetch(`${API}/teachers`);
      const teachers = await teachersRes.json();
      const professor = teachers.find(t => t.utilizador_id === userId);
      if (!professor) { setLoadingClasses(false); return; }

      const res = await fetch(`${API}/pedidos-coaching/professor/${professor.id}?estado=aprovado`);
      const data = await res.json();
      setClasses(
        (data || []).map(req => ({
          id: req.id,
          date: (req.data ?? "").slice(0, 10),
          time: req.hora_inicio?.slice(0, 5) ?? "—",
          title: req.aluno?.nome ?? "—",
        }))
      );
    } catch {
      // mantém lista vazia em caso de erro
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => { loadApprovedRequests(); }, [loadApprovedRequests]);

  const visibleClasses = useMemo(() => {
    return classes
      .filter(item => item.date >= selection.start && item.date <= selection.end)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 2);
  }, [classes, selection]);

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

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

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
            {loadingClasses ? (
              <div className="prof-class-card prof-class-empty">A carregar...</div>
            ) : visibleClasses.length === 0 ? (
              <div className="prof-class-card prof-class-empty">Sem aulas neste período</div>
            ) : (
              visibleClasses.map(item => (
                <article key={item.id} className="prof-class-card">
                  <span>Coaching - {item.title} às {item.time}</span>
                  <small style={{ fontSize: "0.72rem", color: "#888", marginTop: "4px", display: "block" }}>
                    {item.date.slice(0, 10).split("-").reverse().join("/")}
                  </small>
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
