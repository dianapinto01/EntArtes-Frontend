import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search, AlignJustify } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/eventsdetailsstyle.css'

const API = 'http://localhost:3000/api/v1'

export default function EventsDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [evento, setEvento] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [eliminado, setEliminado] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetch(`${API}/events/${id}`)
      .then(res => res.json())
      .then(data => setEvento(data))
      .catch(() => showMessage('error', 'Não foi possível carregar o evento'))
  }, [id])

  function showMessage(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleEliminar() {
  try {
    const res = await fetch(`${API}/events/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    setShowConfirm(false)
    showMessage('success', 'Evento eliminado com sucesso')
    setTimeout(() => navigate('/eventos'), 1500)
  } catch {
    showMessage('error', 'Não foi possível eliminar o evento')
  }
}

async function handleArquivar() {
  try {
    const res = await fetch(`${API}/events/${id}/archive`, { method: 'PATCH' })
    if (!res.ok) throw new Error()
    showMessage('success', 'Evento arquivado com sucesso')
    setTimeout(() => navigate('/eventos'), 1500)
  } catch {
    showMessage('error', 'Não foi possível arquivar o evento')
  }
}

  return (
    <div className="page">
      <HeaderGlobal />

      <main className="eventos-hero">
        <div className="eventos-hero__overlay" />

        <div className="eventos-layout">

          <section className="eventos-left">
            {message && (
              <div className={`alert ${message.type}`}>{message.text}</div>
            )}

            <div className="eventos-search-shell">
              <div className="eventos-search-pill">
                <input type="text" placeholder="Evento" />
                <Search size={22} strokeWidth={2.2} />
              </div>
            </div>

            <div className="eventos-form-box">
              <div className="eventos-title-pill">
                <input type="text" placeholder="Insira o titulo" />
                <AlignJustify size={20} strokeWidth={2.2} />
              </div>

              <label className="eventos-field-label">Descrição do evento</label>

              <textarea rows={4} placeholder="Evento para adultos no..." />

              <button className="eventos-upload-btn">
                Carregar
              </button>
            </div>
          </section>

          <section className="eventos-list">
            <div className="evento-detalhe-card">

              <button className="evento-detalhe-back" onClick={() => navigate('/eventos')}>
                <ArrowLeft size={18} strokeWidth={2.2} />
                Anterior
              </button>

              {evento ? (
                <>
                  <h2 className="evento-detalhe-titulo">{evento.titulo}</h2>
                  <p className="evento-detalhe-desc">{evento.descricao}</p>

                  <div className="evento-detalhe-actions">
                    <button className="evento-btn-eliminar" onClick={() => setShowConfirm(true)}>
                      Eliminar
                    </button>
                    <button className="evento-btn-arquivar" onClick={handleArquivar}>
                      Arquivar
                    </button>
                  </div>
                </>
              ) : (
                <p>Evento não encontrado.</p>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* MODAL confirmar eliminação */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Eliminar evento?</h3>
            <p>Esta ação não pode ser desfeita.</p>

            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button className="delete" onClick={handleEliminar}>
                Sim, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}