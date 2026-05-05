
import { Menu, UserRound } from 'lucide-react'
import '../../styles/headerglobalstyle.css'

export default function HeaderGlobal() {
  return (
    <header className="header">
     <button className="header__icon-btn" aria-label="menu">
      <Menu size={44} strokeWidth={2} />
    </button>

      <div className="header__logo-wrap">
        <img src="/images/logo.png" alt="Logo EntArtes" className="header__logo" />
      </div>

     <button className="header__icon-btn" aria-label="perfil">
      <UserRound size={40} strokeWidth={2} />
    </button>
    </header>
  )
}