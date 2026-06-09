import styles from "./headerAdm.module.css"; 
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function HeaderAdms() {
  const [isActive, setIsActive] = useState(false);

  const toggleMenu = (event) => {
    if (event.type === "touchstart") {
      event.preventDefault();
    }
    setIsActive(!isActive);
  };

  useEffect(() => {
    const button = document.getElementById("btnMobile");
    button.addEventListener("touchstart", toggleMenu, { passive: false });

    return () => {
      button.removeEventListener("touchstart", toggleMenu);
    };
  }, [isActive]);

  return (
    <div className={styles.fundoHeader}>
      <header id="headerAdm" className={styles.headerAdm}>
          <Link className={styles.containerLogo} to="/administracao" title="Instituto Esperança">
              <img
                src="/logos/logoPreta.png"
                className={styles.logoHeader}
                alt="Logo do Instituto Esperança"
              />
              <div className={styles.textoLogo}>
                <h1 className={styles.tituloLogo}>Instituto Esperança</h1>
                <p className={styles.subtituloLogo}>A voz dos animais</p>
              </div>
          </Link>
        <nav
          id="nav"
          className={`${styles.nav} ${isActive ? styles.active : ""}`}
        >
          <button
            id="btnMobile"
            className={styles.btnMobile}
            aria-expanded={isActive}
            aria-label={isActive ? "Fechar Menu" : "Abrir Menu"}
            onClick={toggleMenu}
          >
            <span id="hamburguer" className={styles.hamburguer}></span>
          </button>
          <ul id="menu" className={styles.menu} role="menu">
            <li>
              <Link to="/programar_postagem" className={styles.tagLinkAdms}>
                <div className={styles.alinharLinks}>
                  <img
                    className={styles.iconeLink}
                    src="/headerAdms/postagem.png"
                    alt="Ícone de programar postagem"
                  />
                  <h1 className={styles.textoLink}>Programar postagens</h1>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/fichas_de_animais" className={styles.tagLinkAdms}>
                <div className={styles.alinharLinks}>
                  <img
                    className={styles.iconeLink}
                    src="/headerAdms/pata.png"
                    alt="Ícone de fichas de animais"
                  />
                  <h1 className={styles.textoLink}>Fichas de animais</h1>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/configuracoes" className={styles.tagLinkAdms}>
                <div className={styles.alinharLinks}>
                  <img
                    className={styles.iconeLink}
                    src="/headerAdms/configuracoes.png"
                    alt="Ícone de configurações"
                  />
                  <h1 className={styles.textoLink}>Configurações</h1>
                </div>
              </Link>
            </li>
            <li>
              <Link
                className={styles.linkUsuario}
                to="/autenticar"
                title="usuário"
              >
                <img
                  src="/usuario.png"
                  alt="Botão que leva à página de autenticação"
                  className={styles.iconeAvatar}
                />
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}
