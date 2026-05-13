import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, AlignJustify, ArrowRight, ArrowLeft } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/eventsstyle.css'

const API = 'http://localhost:3000/api/v1'
const PER_PAGE = 4

export default function EventsPage() {
  const navigate = useNavigate()

  const [eventos, setEventos] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetchEventos()
  }, [])

  async function fetchEventos(nome = '') {
    try {
      const url = nome
        ? `${API}/events?nome=${encodeURIComponent(nome)}`
        : `${API}/events`

      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEventos(data)
      setPage(0)
    } catch {
      showMessage('error', 'Não foi possível carregar os eventos')
    }
  }

  const eventosFiltrados = eventos.filter(e =>
    e.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(eventosFiltrados.length / PER_PAGE)
  const eventosPagina = eventosFiltrados.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  function showMessage(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleCarregar() {
    if (!titulo.trim()) {
      showMessage('error', 'Insere o título do evento antes de carregar')
      return
    }

    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao, data: new Date().toISOString().split('T')[0] }),
      })

      if (!res.ok) throw new Error()

      showMessage('success', 'Evento carregado com sucesso!')
      setTitulo('')
      setDescricao('')
      fetchEventos()
    } catch {
      showMessage('error', 'Não foi possível criar o evento')
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
                <input
                  type="text"
                  placeholder="Evento"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(0) // volta à primeira página ao pesquisar
                  }}
                />
                <Search size={22} strokeWidth={2.2} />
              </div>
            </div>

            <div className="eventos-form-box">
              <div className="eventos-title-pill">
                <input
                  type="text"
                  placeholder="Insira o titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                <AlignJustify size={20} strokeWidth={2.2} />
              </div>

              <label className="eventos-field-label">Descrição do evento</label>

              <textarea
                rows={4}
                placeholder="Evento para adultos no..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              <button className="eventos-upload-btn" onClick={handleCarregar}>
                Carregar
              </button>
            </div>
          </section>

          <section className="eventos-list">
            {eventosPagina.length === 0 ? (
              <p className="eventos-empty">Nenhum evento encontrado</p>
            ) : (
              eventosPagina.map((evento) => (
                <article
                  key={evento.id}
                  className="evento-card"
                  onClick={() => navigate(`/evento/${evento.id}`)}
                >
                  <h2>{evento.titulo}</h2>
                  <p>{evento.descricao}</p>
                </article>
              ))
            )}

            <div className="eventos-nav">
              <button
                className="eventos-nav-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                <ArrowLeft size={18} strokeWidth={2.2} /> Anterior
              </button>

              <span className="eventos-nav-info">
                {page + 1} / {totalPages}
              </span>

              <button
                className="eventos-nav-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Próxima <ArrowRight size={18} strokeWidth={2.2} />
              </button>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}