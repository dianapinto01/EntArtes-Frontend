import { useState, useEffect } from "react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import CoachingRequestsList from "../components/coaching/CoachingRequestsList";
import CoachingDetailPage from "./CoachingDetailPage";
import "../styles/availablelessionsstyle.css";
import "../styles/coachingstyle.css";

export default function AvailableLessonsPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
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
            onClick={() => navigate("/aulas-disponiveis")}
          >
            Fazer pedido de coaching
            <span className="al-coaching-plus">+</span>
          </button>
        </div>

        <div className="al-content">
          <h2 className="al-page-title">Os meus pedidos de coaching</h2>
          <CoachingRequestsList
            refreshTrigger={0}
            setMessage={setMessage}
            onSelectRequest={setSelectedRequest}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
