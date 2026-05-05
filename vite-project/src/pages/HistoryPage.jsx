import { useState, useEffect } from 'react'
import { Search, Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/historystyle.css'

const API = 'http://localhost:3000/api/v1'
const PER_PAGE = 3

function HistoryColuna({ placeholder, endpoint, formatItem }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetchItems()
  }, [])

async function fetchItems(titulo = '', date = null) {
  try {
    const params = new URLSearchParams()
    if (titulo) params.append('titulo', titulo)
    if (date) {
      // formata como YYYY-MM-DD sem problemas de timezone
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      params.append('data', `${yyyy}-${mm}-${dd}`)
    }

    const res = await fetch(`${API}/history/${endpoint}?${params.toString()}`)
    if (!res.ok) throw new Error()
    const result = await res.json()
    setItems(result)
    setPage(0)
  } catch {
    console.error(`Erro ao carregar ${endpoint}`)
  }
}

  function handleSearch(value) {
    setSearch(value)
    fetchItems(value, data)
  }

  function handleDate(date) {
    setData(date)
    fetchItems(search, date)
  }

  const totalPages = Math.ceil(items.length / PER_PAGE)
  const pagina = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <div className="history-col">

      <div className="history-search-row">
        <div className="history-search-pill">
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search size={16} strokeWidth={2.2} />
        </div>

        <div className="history-date-pill">
          <DatePicker
            selected={data}
            onChange={handleDate}
            placeholderText="Data"
            dateFormat="dd/MM/yyyy"
            isClearable
          />
          <Calendar size={16} strokeWidth={2.2} />
        </div>
      </div>

      <div className="history-list">
        {pagina.length === 0 ? (
          <p className="history-empty">Sem resultados</p>
        ) : (
          pagina.map((item, i) => (
            <div key={i} className="history-item">
              <span className="history-item__nome">{formatItem(item).nome}</span>
              <span className="history-item__sub">{formatItem(item).sub}</span>
            </div>
          ))
        )}
      </div>

      <div className="history-pagination">
        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
          <button
            key={i}
            className={`history-page-btn ${page === i ? 'active' : ''}`}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </button>
        ))}
        {totalPages > 3 && (
          <>
            <span className="history-page-dots">...</span>
            <button
              className="history-page-btn"
              onClick={() => setPage(totalPages - 1)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <div className="page">
      <HeaderGlobal />

      <main className="history-hero">
        <div className="history-hero__overlay" />

        <div className="history-layout">
          <HistoryColuna
          placeholder="Coaching"
          endpoint="coachings"
          formatItem={(item) => ({
            nome: `${item.formato} | ${item.custo_final}€`,
            sub: item.data_inicio
              ? new Date(item.data_inicio).toLocaleDateString('pt-PT')
              : '',
          })}
        />
          <HistoryColuna
            placeholder="Evento"
            endpoint="eventos"
            formatItem={(item) => ({
              nome: item.titulo,
              sub: item.data ? new Date(item.data).toLocaleDateString('pt-PT') : item.descricao || '',
            })}
          />
          <HistoryColuna
            placeholder="Figurinos"
            endpoint="figurinos"
            formatItem={(item) => ({
              nome: item.titulo,
              sub: item.estado_conservacao || item.descricao || '',
            })}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}