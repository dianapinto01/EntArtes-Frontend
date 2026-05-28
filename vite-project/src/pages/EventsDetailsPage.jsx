import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlignJustify } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/eventsdetailsstyle.css'

const API = 'http://localhost:3000/api/v1'

export default function EventsDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [evento, setEvento] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetch(`${API}/events/${id}`)
      .then(res => res.json())
      .then(data => {
        setEvento(data)
        setTitulo(data.titulo || '')
        setDescricao(data.descricao || '')
        setData(data.data || '')
      })
      .catch(() => showMessage('error', 'Não foi possível carregar o evento'))
  }, [id])

  function showMessage(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleAtualizar() {
    try {
      const res = await fetch(`${API}/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao, data: data || null }),
      })
      if (!res.ok) throw new Error()
      showMessage('success', 'Evento atualizado com sucesso')
      setEvento(prev => ({ ...prev, titulo, descricao, data }))
    } catch {
      showMessage('error', 'Não foi possível atualizar o evento')
    }
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

            <div className="eventos-form-box">
              <label className="eventos-field-label">Título</label>
              <div className="eventos-title-pill">
                <input
                  type="text"
                  placeholder="Título do evento"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                <AlignJustify size={20} strokeWidth={2.2} />
              </div>

              <label className="eventos-field-label">Descrição do evento</label>
              <textarea
                rows={4}
                placeholder="Descrição do evento..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              <div className="eventos-title-pill" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: '#aaa', paddingLeft: '4px' }}>
                  Data do evento
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <button className="eventos-upload-btn" onClick={handleAtualizar}>
                Guardar alterações
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
                  {evento.data && (
                    <p style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center' }}>
                      📅 {new Date(evento.data).toLocaleDateString('pt-PT')}
                    </p>
                  )}

                  <div className="evento-detalhe-actions">
                    <button className="evento-btn-eliminar" onClick={() => setShowConfirm(true)}>
                      Eliminar
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