import "../../styles/footerstyle.css";
export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer__container">

        {/* ESQUERDA */}
        <div className="footer__col footer__brand">
          <a href="https://www.royalacademyofdance.org/" target="_blank" rel="noreferrer">
            <img src="/images/RAD.png" className="footer__logo" alt="RAD" />
          </a>

          <p>
            <strong>Ent'Artes®</strong><br />
            Escola certificada pela<br />
            Royal Academy of Dance<br />
            com o nº de registo 24116
          </p>
        </div>

        {/* MEIO */}
        <div className="footer__col">

          <h4>A Escola</h4>
          <ul>
            <li><a href="https://entartes.pt/A-escola/Aulas/Modalidades.php">Modalidades</a></li>
            <li><a href="https://entartes.pt/A-escola/Professores.php">Corpo Docente</a></li>
            <li><a href="https://entartes.pt/A-escola/A-nossa-hist%C3%B3ria.php">A nossa História</a></li>
          </ul>

          <h4>Projetos</h4>
          <ul>
            <li><a href="https://entartes.pt/Projetos/Plataforma-Entartes.php">Plataforma Ent'artes</a></li>
            <li><a href="https://entartes.pt/Projetos/Motus-Dance-Project.php">Motus Dance Project</a></li>
            <li><a href="https://entartes.pt/Projetos/somadasartes.php">Soma das Artes</a></li>
            <li><a href="https://entartes.pt/Projetos/studiotraining.php">Ent'Artes Studio Training</a></li>
          </ul>

          <h4>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScRY5Ez7yUfzH5bIby9lK8WMAAnkCOvOZbZnzPY5E0u6HG1PQ/viewform"
              target="_blank"
              rel="noreferrer"
            >
              Inscrições
            </a>
          </h4>

        </div>

        {/* DIREITA */}
        <div className="footer__col">

          <h4>Contactos</h4>

          {/* MORADA */}
          <p className="footer__contact">
            <span className="footer__contact-icon">
              <svg viewBox="0 0 54.757 54.757">
                <path d="M40.94,5.617C37.318,1.995,32.502,0,27.38,0c-5.123,0-9.938,1.995-13.56,5.617c-6.703,6.702-7.536,19.312-1.804,26.952
                L27.38,54.757L42.721,32.6C48.476,24.929,47.643,12.319,40.94,5.617z M27.557,26c-3.859,0-7-3.141-7-7s3.141-7,7-7s7,3.141,7,7
                S31.416,26,27.557,26z"></path>
              </svg>
            </span>
            Rua Dr. Manuel de Oliveira Machado,<br />
            nº21 e 23, R/ Chão<br />
            4700-054 Braga
          </p>

          {/* TELEFONE */}
          <div className="footer__contact">
            <span className="footer__contact-icon">
              <svg viewBox="0 0 405.333 405.333">
                <path d="M373.333,266.88c-25.003,0-49.493-3.904-72.704-11.563c-11.328-3.904-24.192-0.896-31.637,6.699l-46.016,34.752
                c-52.8-28.181-86.592-61.952-114.389-114.368l33.813-44.928c8.512-8.512,11.563-20.971,7.915-32.64
                C142.592,81.472,138.667,56.96,138.667,32c0-17.643-14.357-32-32-32H32C14.357,0,0,14.357,0,32
                c0,205.845,167.488,373.333,373.333,373.333c17.643,0,32-14.357,32-32V298.88
                C405.333,281.237,390.976,266.88,373.333,266.88z"/>
              </svg>
            </span>

            <div>
              (+351) 964 693 247<br />
              <small>(Chamada Rede Móvel Nacional PT)</small>
            </div>
          </div>

          {/* EMAIL */}
          <p className="footer__contact">
            <span className="footer__contact-icon">
              <svg viewBox="0 0 512 512">
                <polygon points="448,384 448,141.8 316.9,241.6 385,319 383,321 304.1,251.4 256,288 207.9,251.4 129,321 127,319 195,241.6 64,142 64,384"></polygon>
                <polygon points="439.7,128 72,128 256,267.9"></polygon>
              </svg>
            </span>{" "}
            geral@entartes.pt
          </p>

          {/* SOCIALS */}
          <div className="footer__socials">

            <a href="https://www.facebook.com/entartes.escoladedanca" target="_blank" rel="noreferrer" className="footer__icon fb">
              <svg viewBox="0 0 112 112">
                <circle fill="currentColor" cx="56" cy="56" r="55"></circle>
                <path fill="#fff" d="M73.5,31.6h-9.1c-1.4,0-3.6,0.8-3.6,3.9v8.5h12.6L72,58.3H60.8v40.8H43.9V58.3h-8V43.9h8v-9.2
                c0-6.7,3.1-17,17-17h12.5v13.9z"/>
              </svg>
            </a>

            <a href="https://www.instagram.com/entartes_escoladedanca/" target="_blank" rel="noreferrer" className="footer__icon insta">
              <svg viewBox="0 0 112 112">
                <circle fill="currentColor" cx="56" cy="56" r="55"></circle>
                <path fill="#fff" d="M55.9,38.2c-9.9,0-17.9,8-17.9,17.9C38,66,46,74,55.9,74c9.9,0,17.9-8,17.9-17.9
                C73.8,46.2,65.8,38.2,55.9,38.2z"/>
                <path fill="#fff" d="M74.3,33.5c-2.3,0-4.2,1.9-4.2,4.2s1.9,4.2,4.2,4.2s4.2-1.9,4.2-4.2S76.6,33.5,74.3,33.5z"/>
              </svg>
            </a>

            <a href="https://www.youtube.com/@entartesescoladedanca" target="_blank" rel="noreferrer" className="footer__icon yt">
              <svg viewBox="0 0 112 112">
                <circle fill="currentColor" cx="56" cy="56" r="55"></circle>
                <path fill="#fff" d="M46 40 L75 56 L46 72 Z"/>
              </svg>
            </a>

          </div>

        </div>

      </div>

      <div className="footer__divider"></div>

      <div className="footer__bottom">
        <p>
          © Copyright 2026 Ent'artes® - Marca registada Nacional 577041
        </p>

        <div className="footer__links">
          <a href="https://entartes.pt/Politica-de-Privacidade.php" target="_blank" rel="noreferrer">
            Política de Privacidade
          </a>

          <a href="https://entartes.pt/Politica-de-Cookies.php" target="_blank" rel="noreferrer">
            Cookies
          </a>

          <a href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noreferrer">
            Livro de Reclamações
          </a>
        </div>
      </div>

    </footer>
  );
}