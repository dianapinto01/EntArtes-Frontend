import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Header from '../components/layout/HeaderGlobal'
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import "../styles/reportstyle.css";

const API = "http://localhost:3000/api/v1";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const shortMonths = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// gerar anos de 2022 até ao ano atual, mais recente primeiro
const currentYear = new Date().getFullYear();
const years = [];
for (let y = currentYear; y >= 2022; y--) {
  years.push(String(y));
}

// gerar lista dos últimos 12 meses (a partir do atual)
const today = new Date();
const reportsList = [];
for (let i = 0; i < 12; i++) {
  const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
  reportsList.push({
    label: `Mês de ${months[d.getMonth()]} ${d.getFullYear()}`,
    mes: d.getMonth() + 1,
    ano: d.getFullYear(),
  });
}

// converter dados detalhados em linhas para o excel
function prepararLinhas(dados) {
  const linhas = [];

  dados.forEach(s => {
    const professor = s.vaga?.professor?.utilizador?.nome || "—";
    const responsavel = s.responsavel_nome || "—";
    const modalidade = s.modalidade?.nome || "—";
    const estudio = s.estudio?.nome || "—";

    if (s.sessao_aluno && s.sessao_aluno.length > 0) {
      s.sessao_aluno.forEach(sa => {
        linhas.push({
          "ID Sessão": s.id,
          "Data": new Date(s.data_inicio).toLocaleDateString("pt-PT"),
          "Hora Início": new Date(s.data_inicio).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          "Hora Fim": new Date(s.data_fim).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          "Aluno": sa.aluno?.nome || "—",
          "Presença": sa.estado_participacao,
          "Responsável": responsavel,
          "Professor": professor,
          "Modalidade": modalidade,
          "Estúdio": estudio,
          "Formato": s.formato,
          "Custo (€)": s.custo_final,
          "Estado": s.estado,
        });
      });
    } else {
      linhas.push({
        "ID Sessão": s.id,
        "Data": new Date(s.data_inicio).toLocaleDateString("pt-PT"),
        "Hora Início": new Date(s.data_inicio).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        "Hora Fim": new Date(s.data_fim).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        "Aluno": "—",
        "Presença": "—",
        "Responsável": responsavel,
        "Professor": professor,
        "Modalidade": modalidade,
        "Estúdio": estudio,
        "Formato": s.formato,
        "Custo (€)": s.custo_final,
        "Estado": s.estado,
      });
    }
  });

  return linhas;
}

// gerar e descarregar excel
function downloadExcel(linhas, filename, sheetName) {
  const ws = XLSX.utils.json_to_sheet(linhas);

  ws["!cols"] = [
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
    { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export default function ReportsPage() {
  // começar no mês e ano atual
  const [chartMonth, setChartMonth] = useState(new Date().getMonth());
  const [chartYear, setChartYear] = useState(String(new Date().getFullYear()));

  const [exportMonth, setExportMonth] = useState(months[new Date().getMonth()]);
  const [exportYear, setExportYear] = useState(String(new Date().getFullYear()));

  const [search, setSearch] = useState("");
  const [activeReport, setActiveReport] = useState(0);

  const [stats, setStats] = useState({
    total_presencas: 0,
    total_inscricoes: 0,
    total_eventos: 0,
  });

  const [balance, setBalance] = useState([]);
  const [message, setMessage] = useState(null);

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  // Carregar estatísticas quando muda mês/ano
  useEffect(() => {
    const mes = chartMonth + 1;
    fetch(`${API}/reports/stats?mes=${mes}&ano=${chartYear}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => showMessage("error", "Erro ao carregar estatísticas"));
  }, [chartMonth, chartYear]);

  // Carregar balanço do ano
  useEffect(() => {
    fetch(`${API}/reports/balance?ano=${chartYear}`)
      .then(res => res.json())
      .then(data => setBalance(data))
      .catch(() => showMessage("error", "Erro ao carregar balanço"));
  }, [chartYear]);

  // Exportar Excel
  async function handleExport() {
    try {
      const mes = months.indexOf(exportMonth) + 1;
      const res = await fetch(`${API}/reports/export?mes=${mes}&ano=${exportYear}`);

      if (!res.ok) throw new Error();

      const dados = await res.json();

      if (dados.length === 0) {
        showMessage("error", `Sem coachings validados para ${exportMonth} de ${exportYear}`);
        return;
      }

      const linhas = prepararLinhas(dados);
      downloadExcel(linhas, `coachings_${exportMonth}_${exportYear}.xlsx`, `${exportMonth} ${exportYear}`);
      showMessage("success", `Exportado: ${linhas.length} linhas de ${exportMonth} ${exportYear}`);

    } catch {
      showMessage("error", "Erro ao exportar coachings");
    }
  }

  // Download rápido
  async function handleQuickDownload(e, report) {
    e.stopPropagation();
    try {
      const res = await fetch(`${API}/reports/export?mes=${report.mes}&ano=${report.ano}`);

      if (!res.ok) throw new Error();

      const dados = await res.json();

      if (dados.length === 0) {
        showMessage("error", `Sem coachings para o ${report.label}`);
        return;
      }

      const linhas = prepararLinhas(dados);
      downloadExcel(linhas, `relatorio_${report.label.replace(/ /g, "_")}.xlsx`, report.label);
      showMessage("success", `${report.label} descarregado`);

    } catch {
      showMessage("error", "Erro ao descarregar relatório");
    }
  }

  // Calcular pontos do gráfico
  const slice = balance.slice(0, chartMonth + 1).map(b => b.total);
  const sliceMonths = shortMonths.slice(0, chartMonth + 1);
  const n = slice.length;
  const minV = slice.length > 0 ? Math.min(...slice) : 0;
  const maxV = slice.length > 0 ? Math.max(...slice) : 1;
  const range = maxV - minV || 1;

  const W = 460, H = 130, pL = 30, pR = 20, pT = 10, pB = 25;
  const xs = slice.map((_, i) => pL + (i * (W - pL - pR)) / Math.max(n - 1, 1));
  const ys = slice.map(v => pT + H - pB - ((v - minV) / range) * (H - pT - pB));
  const linePts = xs.map((x, i) => `${x},${ys[i]}`).join(" L ");
  const areaPath = n > 0 ? `M ${xs[0]},${H - pB} L ${linePts} L ${xs[n - 1]},${H - pB} Z` : "";

  const CIRC = 2 * Math.PI * 28;

  // Percentagem dos donuts
  const pctPresencas = stats.total_inscricoes > 0
    ? ((stats.total_presencas / stats.total_inscricoes) * 100).toFixed(2)
    : 0;
  const pctInscricoes = stats.total_inscricoes > 0 ? 100 : 0;
  const pctEventos = stats.total_eventos > 0 ? 100 : 0;

  const filteredReports = reportsList.filter(r =>
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <Header />

      <div className="reports-wrapper">

        <div className="reports-page-header">
          <h1>Relatórios & Balanços de Contas</h1>
          <p>Página para administradores do sistema consultarem as estatísticas e relatórios</p>
        </div>

        {message && (
          <div className={`alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="reports-layout">

          {/* Painel esquerdo */}
          <div className="reports-panel">
            <p className="panel-label">Relatórios</p>

            <div className="search-field">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filteredReports.map((report, i) => (
              <div
                key={i}
                className={`report-row ${activeReport === i ? "active" : ""}`}
                onClick={() => setActiveReport(i)}
              >
                <span>{report.label}</span>
                <button
                  className="dl-icon"
                  onClick={e => handleQuickDownload(e, report)}
                >
                  ⬇
                </button>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <p className="no-results">Nenhum resultado encontrado.</p>
            )}
          </div>

          {/* Painel direito */}
          <div className="reports-right">

            {/* Gráfico */}
            <div className="reports-card">
              <div className="card-header">
                <h2>Balanços de contas</h2>
                <div className="selectors">
                  <select
                    value={shortMonths[chartMonth]}
                    onChange={e => setChartMonth(shortMonths.indexOf(e.target.value))}
                  >
                    {shortMonths.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <select
                    value={chartYear}
                    onChange={e => setChartYear(e.target.value)}
                  >
                    {years.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {n > 0 ? (
                <svg viewBox={`0 0 ${W} ${H}`} className="reports-chart">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2c8f8b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2c8f8b" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {[0.25, 0.5, 0.75, 1].map((r, i) => (
                    <line
                      key={i}
                      x1={pL} y1={pT + (H - pT - pB) * r}
                      x2={W - pR} y2={pT + (H - pT - pB) * r}
                      stroke="#e5e7eb" strokeWidth="1"
                    />
                  ))}

                  <path d={areaPath} fill="url(#grad)" />
                  <path d={`M ${linePts}`} fill="none" stroke="#2c8f8b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {xs.map((x, i) => (
                    <circle
                      key={i}
                      cx={x} cy={ys[i]}
                      r={i === n - 1 ? 5 : 4}
                      fill={i === n - 1 ? "#2c8f8b" : "#7dd3cb"}
                      stroke="white" strokeWidth="2"
                    />
                  ))}

                  {sliceMonths.map((m, i) => (
                    <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="#aaa">
                      {m}
                    </text>
                  ))}
                </svg>
              ) : (
                <p style={{ textAlign: "center", color: "#aaa", padding: "30px 0" }}>
                  A carregar dados...
                </p>
              )}
            </div>

            {/* Estatísticas */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-info">
                  <p className="stat-label">Número de presenças</p>
                  <p className="stat-value">{stats.total_presencas}</p>
                </div>
                <div className="donut-wrap">
                  <svg width="70" height="70" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="35" cy="35" r="28" fill="none" stroke="#2c8f8b" strokeWidth="8"
                      strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pctPresencas / 100)}
                      strokeLinecap="round" transform="rotate(-90 35 35)" />
                  </svg>
                  <span className="donut-label" style={{ color: "#2c8f8b" }}>{pctPresencas}%</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <p className="stat-label">Número de inscrições</p>
                  <p className="stat-value">{stats.total_inscricoes}</p>
                </div>
                <div className="donut-wrap">
                  <svg width="70" height="70" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="35" cy="35" r="28" fill="none" stroke="#c0399a" strokeWidth="8"
                      strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pctInscricoes / 100)}
                      strokeLinecap="round" transform="rotate(-90 35 35)" />
                  </svg>
                  <span className="donut-label" style={{ color: "#c0399a" }}>{pctInscricoes}%</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <p className="stat-label">Número de eventos</p>
                  <p className="stat-value">{stats.total_eventos}</p>
                </div>
                <div className="donut-wrap">
                  <svg width="70" height="70" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="35" cy="35" r="28" fill="none" stroke="#f5a623" strokeWidth="8"
                      strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pctEventos / 100)}
                      strokeLinecap="round" transform="rotate(-90 35 35)" />
                  </svg>
                  <span className="donut-label" style={{ color: "#f5a623" }}>{pctEventos}%</span>
                </div>
              </div>
            </div>

            {/* Exportar */}
            <div className="reports-card">
              <div className="card-header">
                <h2>Exportar Coachings Validados</h2>
              </div>
              <p className="export-desc">
                Transfere todos os coachings validados de um mês específico para faturação.
              </p>
              <div className="export-row">
                <select value={exportMonth} onChange={e => setExportMonth(e.target.value)}>
                  {months.map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={exportYear} onChange={e => setExportYear(e.target.value)}>
                  {years.map(y => <option key={y}>{y}</option>)}
                </select>
                <button className="btn-export" onClick={handleExport}>
                  Exportar Excel
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}