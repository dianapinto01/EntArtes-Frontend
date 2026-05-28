import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

// items do menu por cargo
const NAV_BY_ROLE = {
  responsavel: [
    { label: "Coaching",    desc: "Marque aqui sessões privadas",     path: "/aulas-disponiveis" },
    { label: "Inventário",        desc: "Alugue ou publique o seu figurino",     path: "/figurinos" },
    { label: "Pedidos recebidos", desc: "Gere as reservas dos seus figurinos",  path: "/pedidos-recebidos" },
    { label: "Horário",          desc: "Consulte o seu horário",                path: "/schedule" },
    { label: "Validar sessões",  desc: "Valide as sessões de coaching",         path: "/sessoes-coaching" },
    { label: "Estúdios",    desc: "Consulte os estúdios disponíveis",  path: "/studios" },
    { label: "Eventos",     desc: "Veja os próximos ou anteriores eventos", path: "/homestudents" },
  ],
  professor: [
    { label: "Coaching",            desc: "Marque aqui sessões privadas",      path: "/coaching" },
    { label: "Validar sessões",     desc: "Valide as sessões de coaching",     path: "/sessoes-coaching" },
    { label: "Gestão de presenças", desc: "Marque presenças nas sessões de grupo", path: "/gestao-presencas" },
    { label: "Inventário",          desc: "Alugue ou publique o seu figurino",    path: "/figurinos" },
    { label: "Horário",             desc: "Consulte o seu horário",              path: "/schedule" },
    { label: "Estúdios",            desc: "Consulte os estúdios disponíveis",    path: "/studios" },
    { label: "Eventos", desc: "Adicione detalhes por turma", path: "/professor-eventos" },
    { label: "Estatísticas",        desc: "Confira as estatísticas pessoais",    path: "/stats-professor" },
    { label: "Inserção de horário", desc: "Insira o horário para coachings",   path: "/inserir-horario" },
  ],
  coordenacao: [
    { label: "Histórico",              desc: "Consulte todo o histórico",            path: "/historico" },
    { label: "Inventário",             desc: "Alugue ou publique o seu figurino",    path: "/figurinos" },
    { label: "Pedidos recebidos",      desc: "Gere as reservas dos seus figurinos",  path: "/pedidos-recebidos" },
    { label: "Horário",                desc: "Consulte o seu horário",               path: "/schedule" },
    { label: "Estatísticas",           desc: "Consulte todas as estatísticas",       path: "/stats-professor" },
    { label: "Eliminar contas e eventos", desc: "Aqui pode eliminar contas e eventos", path: "/gerir" },
    { label: "Estúdios",            desc: "Consulte os estúdios disponíveis",  path: "/studios" },
    { label: "Gestão de estúdios",     desc: "Aqui pode gerir todos os estúdios",    path: "/manage-studios" },
    { label: "Gestão de eventos",      desc: "Aqui pode gerir todos os eventos",     path: "/eventos" },
    { label: "Criação de contas",      desc: "Aqui pode criar as contas de utilizadores", path: "/criar-conta" },
  ],
};

function getRole() {
  try {
    const auth = JSON.parse(localStorage.getItem("entartes_auth") || "null");
    const roles = auth?.user?.roles || [];
    if (roles.includes("coordenacao")) return "coordenacao";
    if (roles.includes("professor")) return "professor";
    if (roles.includes("responsavel")) return "responsavel";
  } catch {
    // ignora
  }
  return "responsavel"; // por defeito
}

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const role = getRole();
  const items = NAV_BY_ROLE[role] || [];

  return (
    <>
      <nav className={`prof-sidebar${open ? " prof-sidebar--open" : ""}`}>
        {items.map(item => (
          <button
            key={item.label}
            type="button"
            className={`prof-nav-item${!item.path ? " prof-nav-item--disabled" : ""}`}
            onClick={() => {
              if (item.path) {
                onClose();
                navigate(item.path);
              }
            }}
          >
            <Star size={20} strokeWidth={1.5} className="prof-nav-icon" />
            <span className="prof-nav-text">
              <span className="prof-nav-label">{item.label}</span>
              <span className="prof-nav-desc">{item.desc}</span>
            </span>
          </button>
        ))}
      </nav>

      {open && (
        <div
          className="prof-sidebar-overlay"
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onClick={onClose}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClose()}
        />
      )}
    </>
  );
}