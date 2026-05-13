import { useState, useEffect } from 'react'
import { Search, MinusCircle } from 'lucide-react'
import Header from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/managestyle.css'

const API = 'http://localhost:3000/api/v1'
const PER_PAGE = 3

function ListaColuna({ titulo, placeholder, endpoint, formatItem }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showConfirm, setShowConfirm] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems(nome = '') {
    try {
      const url = nome
        ? `${API}/management/${endpoint}?nome=${encodeURIComponent(nome)}`
        : `${API}/management/${endpoint}`

      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setItems(data)
      setPage(0)
    } catch {
      console.error(`Erro ao carregar ${endpoint}`)
    }
  }

  async function handleRemover(id) {
    try {
      const res = await fetch(`${API}/management/${endpoint}/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      setShowConfirm(null)
      fetchItems(search)
    } catch {
      console.error(`Erro ao remover de ${endpoint}`)
    }
  }

  const totalPages = Math.ceil(items.length / PER_PAGE)
  const pagina = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <div className="manage-col">

      <div className="manage-search-pill">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            fetchItems(e.target.value)
            setPage(0)
          }}
        />
        <Search size={18} strokeWidth={2.2} />
      </div>

      <div className="manage-list">
        {pagina.length === 0 ? (
          <p className="manage-empty">Sem resultados</p>
        ) : (
          pagina.map(item => {
            const { nome, sub } = formatItem(item)
            return (
              <div key={item.id} className="manage-item">
                <div className="manage-item__info">
                  <span className="manage-item__nome">{nome}</span>
                  <span className="manage-item__sub">{sub}</span>
                </div>
                <button
                  className="manage-item__remove"
                  onClick={() => setShowConfirm(item.id)}
                  aria-label="remover"
                >
                  <MinusCircle size={22} strokeWidth={1.8} />
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className="manage-pagination">
        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
          <button
            key={i}
            className={`manage-page-btn ${page === i ? 'active' : ''}`}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </button>
        ))}
        {totalPages > 3 && (
          <>
            <span className="manage-page-dots">...</span>
            <button
              className="manage-page-btn"
              onClick={() => setPage(totalPages - 1)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Remover {titulo.toLowerCase()}?</h3>
            <p>Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowConfirm(null)}>
                Cancelar
              </button>
              <button className="delete" onClick={() => handleRemover(showConfirm)}>
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ManagePage() {
  return (
    <div className="page">
      <HeaderGlobal />

      <main className="manage-hero">
        <div className="manage-hero__overlay" />

        <div className="manage-layout">
          <ListaColuna
            titulo="Aluno"
            placeholder="Aluno"
            endpoint="alunos"
            formatItem={(item) => ({
              nome: item.nome,
              sub: item.data_nascimento
                ? `Nascido em ${new Date(item.data_nascimento).toLocaleDateString('pt-PT')}`
                : '',
            })}
          />
          <ListaColuna
            titulo="Professor"
            placeholder="Professor"
            endpoint="professores"
            formatItem={(item) => ({
              nome: item.utilizador?.nome || '—',
              sub: item.utilizador?.email || '',
            })}
          />
          <ListaColuna
            titulo="Evento"
            placeholder="Evento"
            endpoint="eventos"
            formatItem={(item) => ({
              nome: item.titulo,
              sub: item.data
                ? new Date(item.data).toLocaleDateString('pt-PT')
                : item.estado || '',
            })}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}