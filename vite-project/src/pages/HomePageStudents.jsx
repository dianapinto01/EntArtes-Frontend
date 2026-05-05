import { useState, useEffect } from 'react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/homestudentsstyle.css'

const API = 'http://localhost:3000/api/v1'

export default function HomePageStudents() {
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
      <HeaderGlobal />

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