import styles from "./headerVisitantes.module.css";
import useNavegarComTransicao from "../../../hooks/transicaoEntrePaginas/app";
import { useState, useEffect } from "react";

export default function HeaderVisitantes({ tipo = "padrao" }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navegarComTransicao = useNavegarComTransicao();

  // Configurações para cada tipo de header
  const tiposConfig = {
    padrao: {
      logoSrc: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
      headerClass: styles.headerPadrao,
      linksClass: styles.linksPadrao,
      hamburguerClass: styles.hamburguerPadrao,
    },
    linkPreto: {
      logoSrc: `${import.meta.env.BASE_URL}logos/logoPreta.png`,
      headerClass: styles.headerLinkPreto,
      linksClass: styles.linksPreto,
      hamburguerClass: styles.hamburguerPreto,
    },
    modoDark: {
      logoSrc: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
      headerClass: styles.headerModoDark,
      linksClass: styles.linksModoDark,
      hamburguerClass: styles.hamburguerModoDark,
    },
  };

  const config = tiposConfig[tipo] || tiposConfig.padrao;

  useEffect(() => {
    const carregarUsuario = () => {
      try {
        const dadosUsuario = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (dadosUsuario && token) {
          const usuario = JSON.parse(dadosUsuario);
          setUsuarioLogado(usuario);
          console.log("👤 Usuário logado carregado:", usuario);
        } else {
          console.log("❌ Nenhum usuário logado encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    carregarUsuario();
  }, []);

  // Fecha o menu quando a tela for redimensionada para mais de 700px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700) {
        setMenuAberto(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Impede rolagem quando o menu está aberto
  useEffect(() => {
    if (menuAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuAberto]);

  return (
    <>
      <header className={`${styles.headerVisitantes} ${config.headerClass}`}>
        <button
          type="button"
          className={`${styles.linkLogo}  ${styles.linkBotao}`}
          title="Instituto Esperança"
          onClick={() => navegarComTransicao("/")}
        >
          <img
            src={config.logoSrc}
            className={styles.logo}
            alt="Logo do Instituto Esperança"
          />
        </button>

        <nav className={styles.nav}>
          <ul className={styles.menu} role="menu">
            <li>
              <button
                type="button"
                className={`${styles.linkSubPaginas} ${styles.linkBotao} ${config.linksClass}`}
                onClick={() => navegarComTransicao("/quero_adotar")}
              >
                Quero adotar!
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.linkSubPaginas} ${styles.linkBotao} ${config.linksClass}`}
                onClick={() => navegarComTransicao("/como_doar")}
              >
                Como doar?
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.linkSubPaginas} ${styles.linkBotao} ${config.linksClass}`}
                onClick={() => navegarComTransicao("/denuncie")}
              >
                Denuncie
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.linkSubPaginas} ${styles.linkBotao} ${config.linksClass}`}
                onClick={() => navegarComTransicao("/saude_unica")}
              >
                Saúde única
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.linkUsuario}  ${styles.linkBotao}`}
                onClick={() => navegarComTransicao("/autenticar")}
                title={
                  usuarioLogado
                    ? `Logado como: ${usuarioLogado.nome}`
                    : "Fazer login"
                }
              >
                <img
                  src={
                    usuarioLogado?.foto ||
                    `${import.meta.env.BASE_URL}paraErros/user.png`
                  }
                  alt="perfil"
                  className={styles.iconeUsuario}
                />
              </button>
            </li>
            <li>
              <button
                className={styles.btnMobile}
                onClick={() => setMenuAberto(!menuAberto)}
                aria-label="Menu"
              >
                <span
                  className={`${styles.hamburguerVisitantes} ${config.hamburguerClass}`}
                ></span>
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Overlay escuro */}
      {menuAberto && (
        <div className={styles.overlay} onClick={() => setMenuAberto(false)} />
      )}

      {/* Menu lateral */}
      <div
        className={`${styles.menuLateral} ${
          menuAberto ? styles.menuAberto : ""
        } ${tipo === "modoDark" ? styles.menuLateralDark : ""}`}
      >
        {/* Botão de fechar */}
        <button
          className={styles.botaoFechar}
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu"
        >
          ×
        </button>

        <nav>
          <ul>
            <li>
              <button
                type="button"
                className={`${styles.linkMenuMobile}  ${styles.linkBotao}`}
                onClick={() => {
                  setMenuAberto(false);
                  navegarComTransicao("/quero_adotar");
                }}
              >
                Quero adotar!
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.linkMenuMobile}  ${styles.linkBotao}`}
                onClick={() => {
                  setMenuAberto(false);
                  navegarComTransicao("/como_doar");
                }}
              >
                Como doar?
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.linkMenuMobile}  ${styles.linkBotao}`}
                onClick={() => {
                  setMenuAberto(false);
                  navegarComTransicao("/denuncie");
                }}
              >
                Denuncie
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${styles.linkMenuMobile}`}
                onClick={() => {
                  setMenuAberto(false);
                  navegarComTransicao("/denuncie");
                }}
              >
                Denuncie
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
