import { useState, useEffect } from "react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Sidebar from "../components/layout/sidebar";
import Footer from "../components/layout/Footer";
import CoachingForm from "../components/coaching/CoachingForm";
import CoachingRequestsList from "../components/coaching/CoachingRequestsList";
import CoachingDetailPage from "./CoachingDetailPage";
import "../styles/coachingstyle.css";
import "../styles/professordashboardstyle.css";

export default function CoachingBookingPage() {
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

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

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
