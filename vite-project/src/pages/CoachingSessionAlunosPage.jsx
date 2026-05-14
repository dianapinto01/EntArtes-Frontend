import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/coachingsessaoalunosstyle.css";

const API = "http://localhost:3000/api/v1";

export default function CoachingSessionAlunosPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const state        = location.state ?? {};
  const titulo       = state.titulo ?? "Aula";
  const modalidade   = state.modalidade ?? "";

  const [alunos,  setAlunos]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API}/session-students/sessao/${id}`);
        const data = res.ok ? await res.json() : [];
        setAlunos(Array.isArray(data) ? data : []);
      } catch {
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function initials(nome) {
    return (nome ?? "")
      .split(" ")
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <div className="csa-page">
      <main className="csa-main">
        <img src="/images/paginainicial.png" alt="" className="csa-bg" />
        <div className="csa-overlay" />

        <div className="csa-card">
          <div className="csa-header">
            <button
              type="button"
              className="csa-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              <ArrowLeft size={22} />
            </button>
            <h2 className="csa-title">{titulo}</h2>
          </div>

          {loading ? (
            <p className="csa-loading">A carregar alunos...</p>
          ) : alunos.length === 0 ? (
            <p className="csa-empty">Sem alunos associados a esta sessão.</p>
          ) : (
            <div className="csa-list">
              {alunos.map(entry => (
                <div key={entry.id} className="csa-aluno-row">
                  <div className="csa-avatar">
                    {initials(entry.aluno?.nome)}
                  </div>
                  <div className="csa-aluno-info">
                    <span className="csa-aluno-nome">{entry.aluno?.nome ?? "—"}</span>
                    {modalidade && (
                      <span className="csa-aluno-modalidade">{modalidade}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
