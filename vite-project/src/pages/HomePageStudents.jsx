import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Sidebar from '../components/layout/sidebar'
import Footer from '../components/layout/Footer'
import '../styles/homestudentsstyle.css'
import '../styles/professordashboardstyle.css'

const API = 'http://localhost:3000/api/v1'
const PER_PAGE = 5

export default function HomePageStudents() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [eventos, setEventos] = useState([])
  const [nomeUtilizador, setNomeUtilizador] = useState('Utilizador')
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetch(`${API}/events`)
      .then(res => res.json())
      .then(data => setEventos(data))
      .catch(() => console.error('Erro ao carregar eventos'))
  }, [])

  const totalPages = Math.ceil(eventos.length / PER_PAGE)
  const pagina = eventos.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="home-hero">
        <div className="home-hero__overlay" />

        <div className="home-content">
          <h1 className="home-welcome">Bem-vindo, {nomeUtilizador}!</h1>

          <div className="home-eventos">
            {eventos.length === 0 ? (
              <p className="home-empty">Sem eventos disponíveis</p>
            ) : (
              pagina.map(evento => (
                <article key={evento.id} className="home-evento-card">
                  <h2>{evento.titulo}</h2>
                  <p>{evento.descricao}</p>
                </article>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="home-pagination">
              <button
                className="home-page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="home-page-info">{page + 1} / {totalPages}</span>

              <button
                className="home-page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages - 1}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
