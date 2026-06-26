import styles from "./header.module.css";
import useNavegarComTransicao from "../../hooks/transicaoEntrePaginas/app";
import { useState, useEffect } from "react";

export default function Header({ destino = "visitantes", tipo = "padrao" }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navegarComTransicao = useNavegarComTransicao();

  const menus = {
    visitantes: {
      rotaInicial: "/",
      logoSrc: {
        padrao: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
        linkPreto: `${import.meta.env.BASE_URL}logos/logoPreta.png`,
        modoDark: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
      },
      links: [
        { texto: "Quero adotar!", rota: "/quero_adotar" },
        { texto: "Como doar?", rota: "/como_doar" },
        { texto: "Denuncie", rota: "/denuncie" },
        { texto: "Saúde única", rota: "/saude_unica" },
      ],
    },

    adms: {
      rotaInicial: "/administracao",
      logoSrc: {
        padrao: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
        linkPreto: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
        modoDark: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
      },
      links: [
        {
          texto: "Fichas de animais",
          rota: "/fichas_de_animais",
          icone: `${import.meta.env.BASE_URL}headerAdms/pata.png`,
        },
        {
          texto: "Postagens",
          rota: "/programar_postagem",
          icone: `${import.meta.env.BASE_URL}headerAdms/post.png`,
        },
        {
          texto: "Configurações",
          rota: "/configuracoes",
          icone: `${import.meta.env.BASE_URL}headerAdms/engrenagem.png`,
        },
      ],
    },
  };

  const estilosTipo = {
    padrao: {
      headerClass: styles.headerPadrao,
      linksClass: styles.linksPadrao,
      hamburguerClass: styles.hamburguerPadrao,
      menuLateralClass: "",
    },

    linkPreto: {
      headerClass: styles.headerLinkPreto,
      linksClass: styles.linksPreto,
      hamburguerClass: styles.hamburguerPreto,
      menuLateralClass: "",
    },

    modoDark: {
      headerClass: styles.headerModoDark,
      linksClass: styles.linksModoDark,
      hamburguerClass: styles.hamburguerModoDark,
      menuLateralClass: styles.menuLateralDark,
    },
  };

  const menuAtual = menus[destino] || menus.visitantes;
  const estiloAtual = estilosTipo[tipo] || estilosTipo.padrao;

  useEffect(() => {
    const carregarUsuario = () => {
      try {
        const dadosUsuario = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (dadosUsuario && token) {
          const usuario = JSON.parse(dadosUsuario);
          setUsuarioLogado(usuario);
        } else {
          setUsuarioLogado(null);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setUsuarioLogado(null);
      }
    };

    carregarUsuario();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700) {
        setMenuAberto(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuAberto]);

  const navegar = (rota) => {
    setMenuAberto(false);
    navegarComTransicao(rota);
  };

  return (
    <>
      <header className={`${styles.header} ${estiloAtual.headerClass}`}>
        <button
          type="button"
          className={`${styles.linkLogo} ${styles.linkBotao}`}
          title="Instituto Esperança"
          onClick={() => navegar(menuAtual.rotaInicial)}
        >
          <img
            src={menuAtual.logoSrc[tipo] || menuAtual.logoSrc.padrao}
            className={styles.logo}
            alt="Logo do Instituto Esperança"
          />
        </button>

        <nav className={styles.nav}>
          <ul className={styles.menu} role="menu">
            {menuAtual.links.map((link) => (
              <li key={link.rota}>
                <button
                  type="button"
                  className={`${styles.linkSubPaginas} ${styles.linkBotao} ${estiloAtual.linksClass}`}
                  onClick={() => navegar(link.rota)}
                >
                  {link.texto}
                </button>
              </li>
            ))}

            <li>
              <button
                type="button"
                className={`${styles.linkUsuario} ${styles.linkBotao}`}
                onClick={() => navegar("/autenticar")}
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
                type="button"
                className={styles.btnMobile}
                onClick={() => setMenuAberto(!menuAberto)}
                aria-label="Menu"
              >
                <span
                  className={`${styles.hamburguer} ${estiloAtual.hamburguerClass}`}
                ></span>
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {menuAberto && (
        <div className={styles.overlay} onClick={() => setMenuAberto(false)} />
      )}

      <div
        className={`${styles.menuLateral} ${
          menuAberto ? styles.menuAberto : ""
        } ${estiloAtual.menuLateralClass}`}
      >
        <button
          type="button"
          className={styles.botaoFechar}
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu"
        >
          ×
        </button>

        <nav>
          <ul>
            {menuAtual.links.map((link) => (
              <li key={link.rota}>
                <button
                  type="button"
                  className={`${styles.linkMenuMobile} ${styles.linkBotao}`}
                  onClick={() => navegar(link.rota)}
                >
                  {link.icone && <img src={link.icone} alt="" />}
                  {link.texto}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}