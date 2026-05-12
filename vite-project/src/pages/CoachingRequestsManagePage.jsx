import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Star } from "lucide-react";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/coachingmanagestyle.css";
import "../styles/professordashboardstyle.css";

const NAV_ITEMS = [
  { label: "Coaching",            desc: "Marque aqui sessões privadas",       path: "/coaching" },
  { label: "Inventário",          desc: "Alugue ou publique o seu figurino",  path: null },
  { label: "Horário",             desc: "Consulte o seu horário",             path: "/schedule" },
  { label: "Estúdios",            desc: "Consulte os estúdios disponíveis",   path: null },
  { label: "Estatísticas",        desc: "Confira as estatísticas pessoais",   path: null },
  { label: "Inserção de horário", desc: "Insira o horário para coachings",    path: null },
];

const API = "http://localhost:3000/api/v1";
const ITEMS_PER_PAGE = 6;

export default function CoachingRequestsManagePage() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState(null);

  const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
  const accessToken = auth?.accessToken ?? null;
  const userId = auth?.user?.id ?? null;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadRequests = useCallback(async () => {
    if (!userId) {
      showMessage("error", "Sessão não encontrada. Faz login novamente.");
      setLoading(false);
      return;
    }

    try {
      // Obter professor.id a partir do utilizador.id
      const teachersRes = await fetch(`${API}/teachers`);
      const teachers = await teachersRes.json();
      const professor = teachers.find(t => t.utilizador_id === userId);

      if (!professor) {
        showMessage("error", "Perfil de professor não encontrado.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/pedidos-coaching/professor/${professor.id}?estado=pendente`);
      if (!res.ok) throw new Error("Erro ao carregar pedidos");
      const data = await res.json();
      setRequests(data);
    } catch {
      showMessage("error", "Não foi possível carregar os pedidos.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${API}/pedidos-coaching/${id}/aceitar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao aceitar");
      }
      setRequests(prev => prev.filter(r => r.id !== id));
      showMessage("success", "Pedido aceite com sucesso!");
    } catch (err) {
      showMessage("error", err.message || "Não foi possível aceitar o pedido.");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API}/pedidos-coaching/${id}/rejeitar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao rejeitar");
      }
      setRequests(prev => prev.filter(r => r.id !== id));
      showMessage("success", "Pedido rejeitado.");
    } catch (err) {
      showMessage("error", err.message || "Não foi possível rejeitar o pedido.");
    }
  };

  const filtered = requests.filter(req => {
    const name = req.responsavel?.utilizador?.nome ?? "";
    const matchName = !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = !selectedDate || req.data === selectedDate;
    return matchName && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

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

      <main className="cm-main">
        {message && (
          <div className={`cm-alert cm-alert--${message.type}`}>{message.text}</div>
        )}

        <button
          type="button"
          className="cm-back"
          aria-label="Voltar"
          onClick={() => navigate("/professor")}
        >
          ←
        </button>

        <div className="cm-center">
          <div className="cm-search-card">
            <div className="cm-search-field">
              <input
                type="text"
                placeholder="Pesquisa rápida"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <Search size={16} strokeWidth={2} className="cm-field-icon" />
            </div>
            <div className="cm-date-field">
              <input
                type="date"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setCurrentPage(1); }}
              />
              <Calendar size={16} strokeWidth={2} className="cm-field-icon" />
            </div>
          </div>

          <div className="cm-content-card">
            {loading ? (
              <p className="cm-empty">A carregar pedidos...</p>
            ) : paginated.length === 0 ? (
              <p className="cm-empty">Nenhum pedido encontrado</p>
            ) : (
              <div className="cm-grid">
                {paginated.map(req => {
                  const nome = req.responsavel?.utilizador?.nome ?? "—";
                  const hora = req.hora_inicio?.slice(0, 5) ?? "—";
                  return (
                    <div key={req.id} className="cm-request-card">
                      <button
                        type="button"
                        className="cm-btn cm-btn--reject"
                        onClick={() => handleReject(req.id)}
                        aria-label="Recusar"
                      >
                        ✕
                      </button>
                      <span className="cm-request-name">{nome} | {hora}</span>
                      <button
                        type="button"
                        className="cm-btn cm-btn--accept"
                        onClick={() => handleAccept(req.id)}
                        aria-label="Aceitar"
                      >
                        ✓
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="cm-pagination">
              {currentPage > 1 && (
                <button type="button" onClick={() => setCurrentPage(p => p - 1)}>
                  ← Anterior
                </button>
              )}
              {currentPage < totalPages && (
                <button type="button" onClick={() => setCurrentPage(p => p + 1)}>
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
