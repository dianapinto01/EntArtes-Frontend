import { useState, useEffect } from "react";

import Header from '../components/layout/HeaderGlobal'
import Footer from "../components/layout/Footer";
import StudioCard from "../components/studios/StudioCard";
import ManageStudiosFilters from "../components/studios/ManageStudiosFilters";
import StudioForm from "../components/studios/StudioForm";

import "../styles/managestudiostyle.css";

const API = "http://localhost:3000/api/v1";
const PAGE_SIZE = 6;

export default function ManageStudiosPage() {
  const [studios, setStudios] = useState([]);
  const [modalities, setModalities] = useState([]);

  const [message, setMessage] = useState(null);

  const [inputName, setInputName] = useState("");
  const [inputStatus, setInputStatus] = useState("");
  const [inputModalidade, setInputModalidade] = useState("");

  const [filters, setFilters] = useState({
    name: "", status: "", modalidade: ""
  });

  const [page, setPage] = useState(1);

  const [activeForm, setActiveForm] = useState(null); // null | "new" | "edit"
  const [selectedStudio, setSelectedStudio] = useState(null);

  // mensagem some sozinha após 3 segundos
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // carregar estúdios do backend
  function loadStudios() {
    fetch(`${API}/studios`)
      .then(res => res.json())
      .then(data => setStudios(Array.isArray(data) ? data : []))
      .catch(() =>
        setMessage({ type: "error", text: "Não foi possível carregar os estúdios" })
      );
  }

  useEffect(() => {
    loadStudios();
  }, []);

  // carregar modalidades para o filtro e para o form
  useEffect(() => {
    fetch(`${API}/modalities`)
      .then(res => res.json())
      .then(data => setModalities(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // verifica se um estúdio aceita uma modalidade especifica
  function supportsModalidade(studio, modalidadeId) {
    if (!modalidadeId) return true;
    return studio.modalidades?.some(m => m.id === Number(modalidadeId));
  }

  // aplicar filtros aos estúdios
  const filteredStudios = studios.filter(studio => {
    if (filters.name && !studio.nome.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    if (filters.status && studio.estado !== filters.status) {
      return false;
    }
    if (filters.modalidade && !supportsModalidade(studio, filters.modalidade)) {
      return false;
    }
    return true;
  });

  // paginação
  const totalPages = Math.ceil(filteredStudios.length / PAGE_SIZE);
  const paginatedStudios = filteredStudios.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function handleConsult() {
    setFilters({
      name: inputName,
      status: inputStatus,
      modalidade: inputModalidade
    });
    setPage(1);
  }

  function handleClear() {
    setInputName("");
    setInputStatus("");
    setInputModalidade("");
    setFilters({ name: "", status: "", modalidade: "" });
    setPage(1);
  }

  // gera os números de página a mostrar (com "..." quando há muitas)
  function getPageNumbers() {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page, "...", totalPages];
  }

  // clicar num card abre o form de editar
  function handleStudioClick(studio) {
    setSelectedStudio(studio);
    setActiveForm("edit");
  }

  // botão "+" abre o form de criar
  function handleNewClick() {
    setSelectedStudio(null);
    setActiveForm("new");
  }

  function closeForm() {
    setActiveForm(null);
    setSelectedStudio(null);
  }

  return (
    <div className="page">
      <Header />

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="manage-wrapper">

        <div className="manage-title">
          <h2>Gerir estúdios</h2>
          <span>Consulte e filtre os estúdios disponíveis</span>
        </div>

        <div className={`manage-layout ${activeForm ? "shift" : ""}`}>

          <ManageStudiosFilters
            modalities={modalities}
            inputName={inputName} setInputName={setInputName}
            inputStatus={inputStatus} setInputStatus={setInputStatus}
            inputModalidade={inputModalidade} setInputModalidade={setInputModalidade}
            onConsult={handleConsult}
            onClear={handleClear}
            onNew={handleNewClick}
          />

          <div className="studios-content">

            {paginatedStudios.length === 0 ? (
              <p className="empty-state">
                Nenhum estúdio encontrado com estes filtros
              </p>
            ) : (
              <>
                <div className="manage-grid">
                  {paginatedStudios.map(studio => (
                    <div
                      key={studio.id}
                      onClick={() => handleStudioClick(studio)}
                    >
                      <StudioCard studio={studio} compact />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    {getPageNumbers().map((p, i) => (
                      p === "..." ? (
                        <span key={`dots-${i}`} className="page-dots">...</span>
                      ) : (
                        <button
                          key={p}
                          className={`page-btn ${page === p ? "active" : ""}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      )
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* form lateral - usa key para forçar reset entre criar/editar */}
          {activeForm && (
            <div className="form-area">
              <button className="form-close" onClick={closeForm}>×</button>
              <StudioForm
                key={selectedStudio?.id || "new"}
                studio={selectedStudio}
                studios={studios}
                modalities={modalities}
                onClose={closeForm}
                onSaved={loadStudios}
                setMessage={setMessage}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}