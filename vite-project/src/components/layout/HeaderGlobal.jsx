import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, UserRound } from 'lucide-react'
import Sidebar from './Sidebar'
import '../../styles/headerglobalstyle.css'

export default function HeaderGlobal() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // só mostra o menu se houver utilizador autenticado
  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("entartes_auth") || "null")
    } catch {
      return null
    }
  })()
  const autenticado = !!auth?.user

  function handleLogout() {
    localStorage.removeItem("entartes_auth")
    setShowLogoutConfirm(false)
    navigate("/")
  }

  return (
    <>
      <header className="header">
        {autenticado ? (
          <button
            type="button"
            className={`header__icon-btn${menuOpen ? ' header__icon-btn--active' : ''}`}
            aria-label="menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <Menu size={44} strokeWidth={2} />
          </button>
        ) : (
          <span className="header__icon-btn header__icon-btn--placeholder" aria-hidden="true" />
        )}

        <div className="header__logo-wrap">
          <img src="/images/logo.png" alt="Logo EntArtes" className="header__logo" />
        </div>

        <button
          className="header__icon-btn"
          aria-label="perfil"
          onClick={() => {
            if (autenticado) setShowLogoutConfirm(true)
          }}
        >
          <UserRound size={40} strokeWidth={2} />
        </button>
      </header>

      {autenticado && (
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      )}

      {/* MODAL terminar sessao */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Deseja mesmo sair?</h3>
            <p>A sua sessao sera terminada e voltara para a pagina de login.</p>

            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>

              <button
                className="delete"
                onClick={handleLogout}
              >
                Sim, sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}