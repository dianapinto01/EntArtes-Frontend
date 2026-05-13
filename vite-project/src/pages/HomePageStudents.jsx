import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/homestudentsstyle.css'
import '../styles/professordashboardstyle.css'

const API = 'http://localhost:3000/api/v1'

const NAV_ITEMS = [
  { label: 'Eventos',         desc: 'Consulte os eventos disponíveis', path: '/eventos'          },
  { label: 'Horário',         desc: 'Consulte o seu horário',          path: '/schedule'         },
  { label: 'Histórico',       desc: 'Veja o seu histórico',            path: '/historico'        },
  { label: 'Coaching',        desc: 'Peça uma sessão de coaching',     path: '/aulas-disponiveis'},
  { label: 'Validar sessões', desc: 'Valide as sessões de coaching',   path: '/sessoes-coaching' },
]

export default function HomePageStudents() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [eventos, setEventos] = useState([])
  const [nomeUtilizador, setNomeUtilizador] = useState('Utilizador')

  useEffect(() => {
    fetch(`${API}/events`)
      .then(res => res.json())
      .then(data => setEventos(data))
      .catch(() => console.error('Erro ao carregar eventos'))
  }, [])

  return (
    <div className="page">
      <HeaderGlobal onMenuToggle={() => setMenuOpen(o => !o)} isMenuOpen={menuOpen} />

      <nav className={`prof-sidebar${menuOpen ? ' prof-sidebar--open' : ''}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            type="button"
            className={`prof-nav-item${!item.path ? ' prof-nav-item--disabled' : ''}`}
            onClick={() => { if (item.path) { setMenuOpen(false); navigate(item.path) } }}
          >
            <Star size={20} strokeWidth={1.5} className="prof-nav-icon" />
            <span className="prof-nav-text">
              <span className="prof-nav-label">{item.label}</span>
              <span className="prof-nav-desc">{item.desc}</span>
            </span>
          </button>
        ))}
      </nav>

      {menuOpen && (
        <div
          className="prof-sidebar-overlay"
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setMenuOpen(false)}
        />
      )}

      <main className="home-hero">
        <div className="home-hero__overlay" />

        <div className="home-content">
          <h1 className="home-welcome">Bem-vindo, {nomeUtilizador}!</h1>

          <div className="home-eventos">
            {eventos.length === 0 ? (
              <p className="home-empty">Sem eventos disponíveis</p>
            ) : (
              eventos.map(evento => (
                <article key={evento.id} className="home-evento-card">
                  <h2>{evento.titulo}</h2>
                  <p>{evento.descricao}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
