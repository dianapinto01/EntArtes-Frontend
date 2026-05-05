import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, ChevronDown, Mail } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/createaccountstyle.css'

export default function CreateAccountPage() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [estatuto, setEstatuto] = useState('')
  const [modalidade, setModalidade] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  function showMessage(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleCriar() {
    if (!nome.trim() || !estatuto || !modalidade || !email.trim()) {
      showMessage('error', 'Preenche todos os campos antes de criar a conta')
      return
    }

    // TODO: fetch POST ao API
    // await fetch(`${API}/users`, { method: 'POST', body: JSON.stringify({ nome, estatuto, modalidade, email }) })

    showMessage('success', 'Conta criada com sucesso!')
    setNome('')
    setEstatuto('')
    setModalidade('')
    setEmail('')
  }

  return (
    <div className="page">
      <HeaderGlobal />

      <main className="create-hero">
        <div className="create-hero__overlay" />

        <div className="create-center">

          {message && (
            <div className={`alert ${message.type}`}>{message.text}</div>
          )}

          <div className="create-card">

            <div className="create-title-box">
              <span>Criação de contas</span>
            </div>

            <div className="create-form-box">

              <div className="create-field-pill">
                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <UserPlus size={20} strokeWidth={2} />
              </div>

              <div className="create-field-pill create-field-pill--select">
                <select
                  value={estatuto}
                  onChange={(e) => setEstatuto(e.target.value)}
                >
                  <option value="" disabled hidden>Estatuto</option>
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
                <ChevronDown size={20} strokeWidth={2} />
              </div>

              <div className="create-field-pill create-field-pill--select">
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                >
                  <option value="" disabled hidden>Modalidade</option>
                  <option value="ballet">Ballet</option>
                  <option value="contemporaneo">Contemporâneo</option>
                  <option value="jazz">Jazz</option>
                  <option value="hip-hop">Hip-Hop</option>
                </select>
                <ChevronDown size={20} strokeWidth={2} />
              </div>

              <div className="create-field-pill">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={20} strokeWidth={2} />
              </div>

              <button className="create-btn" onClick={handleCriar}>
                Criar
              </button>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}