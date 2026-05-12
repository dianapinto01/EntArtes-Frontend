import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import CoachingForm from "../components/coaching/CoachingForm";
import CoachingRequestsList from "../components/coaching/CoachingRequestsList";
import CoachingDetailPage from "./CoachingDetailPage";
import "../styles/coachingstyle.css";
import "../styles/professordashboardstyle.css";

const NAV_ITEMS = [
  { label: "Eventos",   desc: "Consulte os eventos disponíveis", path: "/eventos"          },
  { label: "Horário",   desc: "Consulte o seu horário",          path: "/schedule"         },
  { label: "Histórico", desc: "Veja o seu histórico",            path: "/historico"        },
  { label: "Coaching",  desc: "Peça uma sessão de coaching",     path: "/aulas-disponiveis"},
];

export default function CoachingBookingPage() {
  const navigate = useNavigate();
  const [menuOpen,         setMenuOpen]         = useState(false);
  const [refreshTrigger,   setRefreshTrigger]   = useState(0);
  const [message,          setMessage]          = useState(null);
  const [selectedRequest,  setSelectedRequest]  = useState(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  if (selectedRequest) {
    return (
      <CoachingDetailPage
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        setMessage={setMessage}
      />
    );
  }

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      {/* SIDEBAR */}
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

      <main className="cb-main">
        <img src="/images/Entartes-5.png" alt="" className="cb-bg" />
        <div className="cb-overlay" />

        {message && (
          <div className={`cb-alert cb-alert--${message.type}`}>{message.text}</div>
        )}

        <div className="cb-content">
          <CoachingForm
            onCreated={() => setRefreshTrigger(p => p + 1)}
            setMessage={setMessage}
          />
          <CoachingRequestsList
            refreshTrigger={refreshTrigger}
            setMessage={setMessage}
            onSelectRequest={setSelectedRequest}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
