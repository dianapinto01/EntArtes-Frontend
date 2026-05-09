import { useState } from 'react'
import { UserPlus, ChevronDown, Mail, CreditCard, Phone } from 'lucide-react'
import HeaderGlobal from '../components/layout/HeaderGlobal'
import Footer from '../components/layout/Footer'
import '../styles/createaccountstyle.css'

const API = 'http://localhost:3000/api/v1'

export default function CreateAccountPage() {
  const [nome, setNome] = useState('')
  const [estatuto, setEstatuto] = useState('')
  const [modalidade, setModalidade] = useState('')
  const [iban, setIban] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [email, setEmail] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [grauParentesco, setGrauParentesco] = useState('')
  const [telemovel, setTelemovel] = useState('')
  const [message, setMessage] = useState(null)

  function showMessage(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleCriar() {
    if (!nome.trim() || !estatuto) {
      showMessage('error', 'Preenche todos os campos obrigatórios')
      return
    }

    if (estatuto === 'professor' && (!modalidade || !iban.trim() || !email.trim())) {
      showMessage('error', 'Preenche a modalidade, IBAN e email para professores')
      return
    }

    if (estatuto === 'admin' && !email.trim()) {
      showMessage('error', 'Preenche o email para administradores')
      return
    }

    console.log('Dados a enviar:', { nome, estatuto, email, responsavel, grauParentesco, modalidade, iban, telemovel })

    try {
      const res = await fetch(`${API}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, estatuto, email, responsavel, grauParentesco, modalidade, iban, telemovel, dataNascimento}),
      })

      if (!res.ok) {
        const err = await res.json()
        console.log('Erro completo:', err)
        showMessage('error', err.message || 'Erro ao criar conta')
        return
      }

      showMessage('success', 'Conta criada com sucesso!')
      setNome('')
      setEstatuto('')
      setModalidade('')
      setIban('')
      setEmail('')
      setResponsavel('')
      setGrauParentesco('')
      setTelemovel('')
    } catch (e) {
      console.log('Erro catch:', e)
      showMessage('error', 'Não foi possível criar a conta')
    }
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
                  onChange={(e) => {
                    setEstatuto(e.target.value)
                    setModalidade('')
                    setIban('')
                    setResponsavel('')
                    setDataNascimento('')
                    setGrauParentesco('')
                    setEmail('')
                    setTelemovel('')
                  }}
                >
                  <option value="" disabled hidden>Estatuto</option>
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
                <ChevronDown size={20} strokeWidth={2} />
              </div>

              {estatuto === 'aluno' && (
                <>

                  <div className="create-field-pill" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#aaa', paddingLeft: '4px' }}>
                    Data de nascimento do aluno
                    </label>
                    <input
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="create-field-pill">
                    <input
                      type="text"
                      placeholder="Responsável (opcional)"
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                    />
                    <UserPlus size={20} strokeWidth={2} />
                  </div>

                  <div className="create-field-pill create-field-pill--select">
                    <select
                      value={grauParentesco}
                      onChange={(e) => setGrauParentesco(e.target.value)}
                    >
                      <option value="" disabled hidden>Grau de parentesco</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Avó">Avó</option>
                      <option value="Avô">Avô</option>
                      <option value="Tutor">Tutor</option>
                      <option value="Outro">Outro</option>
                    </select>
                    <ChevronDown size={20} strokeWidth={2} />
                  </div>

                  <div className="create-field-pill">
                    <input
                      type="email"
                      placeholder="Email do responsável"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail size={20} strokeWidth={2} />
                  </div>
                </>
              )}

              {estatuto === 'professor' && (
                <>
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
                      type="text"
                      placeholder="IBAN"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                    />
                    <CreditCard size={20} strokeWidth={2} />
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
                </>
              )}

              {estatuto === 'admin' && (
                <div className="create-field-pill">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={20} strokeWidth={2} />
                </div>
              )}

              {estatuto && (
                <div className="create-field-pill">
                  <input
                    type="tel"
                    placeholder="Telemóvel"
                    value={telemovel}
                    onChange={(e) => setTelemovel(e.target.value)}
                  />
                  <Phone size={20} strokeWidth={2} />
                </div>
              )}

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