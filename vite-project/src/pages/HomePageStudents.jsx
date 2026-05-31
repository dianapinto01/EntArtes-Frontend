import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
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
  const [eventosTurma, setEventosTurma] = useState([])
  const [inscricoes, setInscricoes] = useState([])
  const [nomeUtilizador, setNomeUtilizador] = useState('Utilizador')
  const [alunoId, setAlunoId] = useState(null)
  const [alunos, setAlunos] = useState([])
  const [page, setPage] = useState(0)
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('entartes_auth') || '{}')
    if (auth?.user?.nome) setNomeUtilizador(auth.user.nome)

    const alunoIds = auth?.user?.aluno_ids || []

    if (alunoIds.length === 1) {
      setAlunos(alunoIds)
      setAlunoId(alunoIds[0].id)
    } else if (alunoIds.length > 1) {
      setAlunos(alunoIds)
    }

    fetch(`${API}/events`)
      .then(res => res.json())
      .then(data => setEventos(Array.isArray(data) ? data : []))
      .catch(() => console.error('Erro ao carregar eventos'))
  }, [])

  useEffect(() => {
    if (!alunoId) return

    fetch(`${API}/events-groups/aluno/${alunoId}`)
      .then(res => res.json())
      .then(data => setEventosTurma(Array.isArray(data) ? data : []))
      .catch(() => setEventosTurma([]))

    fetch(`${API}/event-registrations/aluno/${alunoId}`)
      .then(res => res.json())
      .then(data => setInscricoes(Array.isArray(data) ? data : []))
      .catch(() => setInscricoes([]))
  }, [alunoId])

  function showMessage(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  function abrirModal(evento) {
    const descricoesTurma = eventosTurma.filter(et => et.evento_id === evento.id)
    setEventoSelecionado({ ...evento, descricoesTurma })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEventoSelecionado(null)
  }

  async function handleInscrever() {
    if (!eventoSelecionado || !alunoId) return

    try {
      const res = await fetch(`${API}/event-registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aluno_id: alunoId, evento_id: eventoSelecionado.id }),
      })

      if (!res.ok) throw new Error()

      setInscricoes(prev => [...prev, { evento_id: eventoSelecionado.id }])
      showMessage('success', 'Inscrição realizada com sucesso!')
      fecharModal()
    } catch {
      showMessage('error', 'Não foi possível realizar a inscrição')
    }
  }

  async function handleCancelar(eventoId) {
    if (!alunoId) return

    try {
      const res = await fetch(`${API}/event-registrations/${alunoId}/${eventoId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error()

      setInscricoes(prev => prev.filter(i => i.evento_id !== eventoId))
      showMessage('success', 'Inscrição cancelada com sucesso!')
      fecharModal()
    } catch {
      showMessage('error', 'Não foi possível cancelar a inscrição')
    }
  }

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

          {message && (
            <div className={`alert ${message.type}`}>{message.text}</div>
          )}

          {alunos.length > 1 && (
            <div className="home-selector">
              <label className="home-selector__label">A ver como:</label>
              <select
                className="home-selector__select"
                value={alunoId || ''}
                onChange={e => setAlunoId(Number(e.target.value))}
              >
                <option value="">Seleciona um aluno</option>
                {alunos.map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          )}

          {alunos.length > 1 && !alunoId ? (
            <p className="home-empty">Seleciona um aluno para ver os eventos</p>
          ) : (
            <>
              <div className="home-eventos">
                {eventos.length === 0 ? (
                  <p className="home-empty">Sem eventos disponíveis</p>
                ) : (
                  pagina.map(evento => {
                    const temDescricaoTurma = eventosTurma.some(et => et.evento_id === evento.id)
                    const inscrito = inscricoes.some(i => i.evento_id === evento.id)
                    return (
                      <article key={evento.id} className="home-evento-card">
                        <h2>{evento.titulo}</h2>
                        <p>{evento.descricao}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <button
                            className="home-detalhes-btn"
                            onClick={() => abrirModal(evento)}
                          >
                            Ver detalhes
                          </button>
                          {temDescricaoTurma && (
                            <button
                              className={`home-inscricao-btn ${inscrito ? 'home-inscricao-btn--inscrito' : ''}`}
                              onClick={() => abrirModal(evento)}
                            >
                              {inscrito ? 'Inscrito ✓' : 'Inscrever-se'}
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  })
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
            </>
          )}
        </div>
      </main>

      {modalAberto && eventoSelecionado && (
        <div className="home-modal-overlay" onClick={fecharModal}>
          <div className="home-modal" onClick={e => e.stopPropagation()}>

            <div className="home-modal__header">
              <h3>{eventoSelecionado.titulo}</h3>
              <button className="home-modal__close" onClick={fecharModal}>
                <X size={20} />
              </button>
            </div>

            <div className="home-modal__body">
              <p className="home-modal__descricao-geral">{eventoSelecionado.descricao}</p>
              {eventoSelecionado.descricoesTurma && eventoSelecionado.descricoesTurma.length > 0 && (
                <>
                  <hr className="home-modal__divider" />
                  <p className="home-modal__label">Informação da tua turma</p>
                  {eventoSelecionado.descricoesTurma.map((d, i) => (
                    <div key={i} style={{ marginBottom: i < eventoSelecionado.descricoesTurma.length - 1 ? '12px' : '0' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2c8f8b', margin: '0 0 4px' }}>
                        {d.turmas?.nome_turma || `Turma ${d.turma_id}`}
                      </p>
                      <p className="home-modal__descricao-turma">{d.descricao}</p>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="home-modal__footer">
              {inscricoes.some(i => i.evento_id === eventoSelecionado.id) ? (
                <>
                  <span className="home-modal__inscrito">Já estás inscrito ✓</span>
                  <button
                    className="home-modal__cancelar"
                    onClick={() => handleCancelar(eventoSelecionado.id)}
                  >
                    Cancelar inscrição
                  </button>
                </>
              ) : (
                <>
                  <button className="home-modal__fechar" onClick={fecharModal}>
                    Fechar
                  </button>
                  {eventoSelecionado.descricoesTurma && eventoSelecionado.descricoesTurma.length > 0 && (
                    <button className="home-modal__confirmar" onClick={handleInscrever}>
                      Confirmar inscrição
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}