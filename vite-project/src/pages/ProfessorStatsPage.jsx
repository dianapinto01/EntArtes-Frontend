import { useState, useEffect } from "react";

import Header from '../components/layout/HeaderGlobal'
import Footer from "../components/layout/Footer";

import "../styles/professorstatsstyle.css";

const API = "http://localhost:3000/api/v1";

// nomes dos meses em portugues
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// anos disponiveis para escolher
const ANOS = [2024, 2025, 2026];

export default function ProfessorStatsPage({ professorId = 6 }) {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState(null);

  // por defeito mostrar o mes e ano atuais
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  // mensagem desaparece sozinha apos 3 segundos
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // buscar as estatisticas sempre que mudar professor mes ou ano
  useEffect(() => {
    fetch(`${API}/reports/professor/${professorId}?mes=${mes}&ano=${ano}`)
      .then(res => res.json())
      .then(data => {
        // se vier erro do backend mostrar mensagem
        if (data.statusCode) {
          setMessage({ type: "error", text: data.message });
          return;
        }
        setStats(data);
      })
      .catch(() =>
        setMessage({ type: "error", text: "Não foi possível carregar as estatísticas" })
      );
  }, [professorId, mes, ano]);

  // funcao para mostrar valores em euros
  const formatEuro = (valor) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR"
    }).format(valor);
  };

  // enquanto nao temos dados mostrar loading
  if (!stats) {
    return (
      <div className="page">
        <Header />
        <div className="prof-stats-wrapper">
          {message && (
            <div className={`alert ${message.type}`}>
              {message.text}
            </div>
          )}
          <p className="loading">A carregar...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // calcular o maior valor para fazer as barras proporcionais
  // o "1" é para evitar dividir por zero se nao houver dados
  const maxModalidade = Math.max(...stats.porModalidade.map(m => m.total), 1);

  // primeira letra do nome para o avatar
  const inicial = stats.professor.nome.charAt(0).toUpperCase();

  return (
    <div className="page">
      <Header />

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="prof-stats-wrapper">

        <div className="prof-stats-title">
          <h2>O Meu Painel</h2>
          <span>Atividade e estatísticas mensais</span>
        </div>

        {/* seletor de mes e ano */}
        <div className="period-selector">
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>

          <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
            {ANOS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* card com a info do professor */}
        <div className="prof-card">
          <div className="prof-avatar">{inicial}</div>
          <h3>Prof. {stats.professor.nome}</h3>

          {/* mostrar as modalidades que o professor da */}
          {stats.professor.modalidades.length > 0 && (
            <div className="prof-modalities">
              {stats.professor.modalidades.map(m => (
                <span key={m} className="modality-chip">{m}</span>
              ))}
            </div>
          )}
        </div>

        {/* 4 cards com os totais */}
        <div className="totals-grid">

          <div className="total-card">
            <div className="total-number">{stats.totais.aulas}</div>
            <div className="total-label">Aulas no horário</div>
          </div>

          <div className="total-card">
            <div className="total-number">{stats.totais.coachingsValidados}</div>
            <div className="total-label">Coachings este mês</div>
          </div>

          <div className="total-card">
            <div className="total-number">{stats.totais.alunosAtendidos}</div>
            <div className="total-label">Alunos atendidos</div>
          </div>

          <div className="total-card">
            <div className="total-number">{formatEuro(stats.totais.totalGanho)}</div>
            <div className="total-label">Ganho em coachings</div>
          </div>

        </div>

        {/* grafico de barras das aulas por modalidade */}
        <div className="chart-card">
          <h4>Aulas por Modalidade</h4>

          {stats.porModalidade.length === 0 ? (
            <p className="empty-text">Sem aulas atribuídas</p>
          ) : (
            <div className="bars-list">
              {stats.porModalidade.map(m => (
                <div key={m.nome} className="bar-row">
                  <div className="bar-label">{m.nome}</div>
                  <div className="bar-container">
                    {/* a largura da barra é proporcional ao maximo */}
                    <div
                      className="bar-fill"
                      style={{ width: `${(m.total / maxModalidade) * 100}%` }}
                    ></div>
                    <span className="bar-value">{m.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}