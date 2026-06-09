import styles from "./headerVisitantes.module.css"; // Importando o CSS Module
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  // Cuida dos eventos do header responsivo com botão de hambúrguer.
  const [isActive, setIsActive] = useState(false);

  const toggleMenu = (event) => {
    if (event.type === "touchstart") {
      event.preventDefault(); // Previne o comportamento padrão
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
    <div className={styles.fundoHeaderVisitantes}>
      <header id="headerVisitantes" className={styles.headerVisitantes}>
        <div className={styles.containerLogo}>
          <Link id="logo" to="/administracao" title="Instituto Esperança">
            <img
              src="logos/logoBranca.png"
              className={styles.logoHeader}
              alt="Logo do Instituto Esperança"
            />
          </Link>
        </div>
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
            <span
              id="hamburguerVisitantes"
              className={styles.hamburguerVisitantes}
            ></span>
          </button>
          <ul id="menu" className={styles.menu} role="menu">
            <li>
              <Link to="/quero_adotar" className={styles.tagLink}>
                <div className={styles.alinharLinks}>
                  <img
                    className={styles.iconeLink}
                    src="header/adotar.png"
                    alt="Ícone Quero Adotar"
                  />
                  <h1 className={styles.textoLink}>Quero adotar!</h1>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/como_doar" className={styles.tagLink}>
                <div className={styles.alinharLinks}>
                  <img
                    className={styles.iconeLink}
                    src="header/doar.png"
                    alt="Ícone Como Doar"
                  />
                  <h1 className={styles.textoLink}>Como doar?</h1>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/denuncie" className={styles.tagLink}>
                <div className={styles.alinharLinks}>
                  <img
                    className={styles.iconeLink}
                    src="header/denuncie.png"
                    alt="Ícone Denuncie"
                  />
                  <h1 className={styles.textoLink}>Denuncie</h1>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/saude_unica" className={styles.tagLink}>
                <div className={styles.alinharLinks}>
                  <img
                    className={styles.iconeLink}
                    src="header/saude.png"
                    alt="Ícone Saúde Única"
                  />
                  <h1 className={styles.textoLink}>Saúde única</h1>
                </div>
              </Link>
            </li>
            <li>
              <Link className={styles.linkUsuario} to="/autenticar" title="usuário">
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
