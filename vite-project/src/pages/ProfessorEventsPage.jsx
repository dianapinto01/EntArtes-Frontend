import { useState, useEffect } from 'react'
import { ChevronDown, X, Plus, Trash2 } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/professoreventsstyle.css'

const API = 'http://localhost:3000/api/v1'
const PER_PAGE = 6

export default function ProfessorEventsPage() {
  const [eventos, setEventos] = useState([])
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([])
  const [descricoesPorEvento, setDescricoesPorEvento] = useState({})
  const [page, setPage] = useState(0)
  const [message, setMessage] = useState(null)
  const [modalError, setModalError] = useState(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [descricoesTurma, setDescricoesTurma] = useState([{ turma_id: '', descricao: '' }])
  const [loadingDescricoes, setLoadingDescricoes] = useState(false)

  useEffect(() => {
    fetchEventos()
    fetchTurmas()
  }, [])

  async function fetchEventos() {
    try {
      const res = await fetch(`${API}/events`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEventos(data)
      fetchTodasDescricoes(data)
    } catch {
      showMessage('error', 'Não foi possível carregar os eventos')
    }
  }

  async function fetchTodasDescricoes(eventosLista) {
    const mapa = {}
    await Promise.all(
      eventosLista.map(async (evento) => {
        try {
          const res = await fetch(`${API}/events-groups/${evento.id}`)
          if (!res.ok) return
          const data = await res.json()
          mapa[evento.id] = data
        } catch {
          mapa[evento.id] = []
        }
      })
    )
    setDescricoesPorEvento(mapa)
  }

  async function fetchTurmas() {
    try {
      const res = await fetch(`${API}/groups`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTurmasDisponiveis(Array.isArray(data) ? data : [])
    } catch {
      setTurmasDisponiveis([])
    }
  }

  function showMessage(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function abrirModal(evento) {
    setEventoSelecionado(evento)
    setModalAberto(true)
    setLoadingDescricoes(true)
    setModalError(null)

    try {
      const res = await fetch(`${API}/events-groups/${evento.id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.length > 0) {
        setDescricoesTurma(data.map(d => ({ turma_id: String(d.turma_id), descricao: d.descricao || '' })))
      } else {
        setDescricoesTurma([{ turma_id: '', descricao: '' }])
      }
    } catch {
      setDescricoesTurma([{ turma_id: '', descricao: '' }])
    } finally {
      setLoadingDescricoes(false)
    }
  }

  function fecharModal() {
    setModalAberto(false)
    setEventoSelecionado(null)
    setDescricoesTurma([{ turma_id: '', descricao: '' }])
    setModalError(null)
  }

  async function handleGuardar() {
    if (!eventoSelecionado) return

    const validas = descricoesTurma.filter(d => d.turma_id)

    if (validas.length === 0) {
      setModalError('Seleciona pelo menos uma turma')
      setTimeout(() => setModalError(null), 3000)
      return
    }

    setModalError(null)

    try {
      for (const d of validas) {
        const res = await fetch(`${API}/events-groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evento_id: eventoSelecionado.id,
            turma_id: Number(d.turma_id),
            descricao: d.descricao,
          }),
        })
        if (!res.ok) throw new Error()
      }

      showMessage('success', 'Detalhes guardados com sucesso!')
      fecharModal()
      fetchEventos()
    } catch {
      setModalError('Não foi possível guardar os detalhes')
      setTimeout(() => setModalError(null), 3000)
    }
  }

  const totalPages = Math.ceil(eventos.length / PER_PAGE)
  const eventosPagina = eventos.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <div className="page">
      <HeaderGlobal />

      <main className="profev-hero">
        <div className="profev-hero__overlay" />

        <div className="profev-center">

          {message && (
            <div className={`alert ${message.type}`}>{message.text}</div>
          )}

          <div className="profev-grid">
            {eventosPagina.length === 0 ? (
              <p className="profev-empty">Nenhum evento encontrado</p>
            ) : (
              eventosPagina.map((evento) => {
                const descricoes = descricoesPorEvento[evento.id] || []
                return (
                  <div key={evento.id} className="profev-card">
                    <div className="profev-card__body">
                      <h2>{evento.titulo}</h2>
                      {descricoes.length > 0 ? (
                        descricoes.map((d, i) => {
                          const turma = turmasDisponiveis.find(t => t.id === d.turma_id)
                          return (
                            <div key={i} className="profev-card__descricao">
                              {turma && (
                                <span className="profev-card__turma">{turma.nome_turma}</span>
                              )}
                              <p>{d.descricao || 'Sem descrição'}</p>
                            </div>
                          )
                        })
                      ) : (
                        <p>{evento.descricao || 'Sem descrição'}</p>
                      )}
                    </div>
                    <button
                      className="profev-card__btn"
                      onClick={() => abrirModal(evento)}
                    >
                      Adicionar detalhes
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div className="profev-nav">
            <button
              className="profev-nav-btn"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
            >
              ← Anterior
            </button>
            <span className="profev-nav-info">{page + 1} / {totalPages || 1}</span>
            <button
              className="profev-nav-btn"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Próxima →
            </button>
          </div>

        </div>
      </main>

      {modalAberto && (
        <div className="profev-modal-overlay" onClick={fecharModal}>
          <div className="profev-modal" onClick={(e) => e.stopPropagation()}>

            <div className="profev-modal__header">
              <h3>{eventoSelecionado?.titulo}</h3>
              <button className="profev-modal__close" onClick={fecharModal}>
                <X size={20} />
              </button>
            </div>

            <div className="profev-modal__body">
              {loadingDescricoes ? (
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>A carregar...</p>
              ) : (
                <>
                  {descricoesTurma.map((d, i) => (
                    <div key={i} className="profev-descricao-block">

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label>Turma {descricoesTurma.length > 1 ? i + 1 : ''}</label>
                        {descricoesTurma.length > 1 && (
                          <button
                            onClick={async () => {
                              if (d.turma_id && eventoSelecionado) {
                                try {
                                  await fetch(`${API}/events-groups/${eventoSelecionado.id}/${d.turma_id}`, {
                                    method: 'DELETE',
                                  })
                                } catch {}
                              }
                              setDescricoesTurma(descricoesTurma.filter((_, idx) => idx !== i))
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="profev-select-pill">
                        <select
                          value={d.turma_id}
                          onChange={(e) => {
                            const novo = [...descricoesTurma]
                            novo[i] = { ...novo[i], turma_id: e.target.value }
                            setDescricoesTurma(novo)
                          }}
                        >
                          <option value="">Seleciona uma turma</option>
                          {turmasDisponiveis.map((t) => (
                            <option key={t.id} value={String(t.id)}>
                              {t.nome_turma}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={18} />
                      </div>

                      <label>Descrição</label>
                      <textarea
                        rows={3}
                        placeholder="Descrição para esta turma..."
                        value={d.descricao}
                        onChange={(e) => {
                          const novo = [...descricoesTurma]
                          novo[i] = { ...novo[i], descricao: e.target.value }
                          setDescricoesTurma(novo)
                        }}
                      />

                      {i < descricoesTurma.length - 1 && <hr className="profev-divider" />}
                    </div>
                  ))}

                  <button
                    onClick={() => setDescricoesTurma([...descricoesTurma, { turma_id: '', descricao: '' }])}
                    className="profev-add-turma-btn"
                  >
                    <Plus size={16} /> Adicionar outra turma
                  </button>
                </>
              )}
            </div>

            {modalError && (
              <div className="alert error" style={{ margin: '0' }}>
                {modalError}
              </div>
            )}

            <div className="profev-modal__footer">
              <button className="profev-modal__cancel" onClick={fecharModal}>
                Cancelar
              </button>
              <button className="profev-modal__save" onClick={handleGuardar}>
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}