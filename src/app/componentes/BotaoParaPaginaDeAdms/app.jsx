import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./botaoDeTrocaDePaginas.module.css";

export default function BotaoDeTrocaDePaginas({ destino = "visitantes" }) {
  const [clicked, setClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [usuarioAutorizado, setUsuarioAutorizado] = useState(false);

  const navigate = useNavigate();

  const configuracoes = {
    visitantes: {
      rota: "/",
      imagem: `${import.meta.env.BASE_URL}homeAdms/home.png`,
      alt: "Ir para página inicial",
      exigePermissao: false,
    },

    adms: {
      rota: "/administracao",
      imagem: `${import.meta.env.BASE_URL}logos/logoBranca.png`,
      alt: "Ir para administração",
      exigePermissao: true,
    },
  };

  const config = configuracoes[destino] || configuracoes.visitantes;

  useEffect(() => {
    const verificarTelaMobile = () => {
      setIsMobile(window.innerWidth < 1100);
    };

    verificarTelaMobile();

    window.addEventListener("resize", verificarTelaMobile);

    return () => {
      window.removeEventListener("resize", verificarTelaMobile);
    };
  }, []);

  useEffect(() => {
    const verificarPermissao = () => {
      try {
        if (!config.exigePermissao) {
          setUsuarioAutorizado(true);
          return;
        }

        const dadosUsuario = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (!dadosUsuario || !token) {
          setUsuarioAutorizado(false);
          return;
        }

        const usuario = JSON.parse(dadosUsuario);

        const niveisAutorizados = [
          "contribuinte",
          "subAdministrador",
          "administrador",
        ];

        const autorizado =
          usuario.nivelDeAcesso &&
          niveisAutorizados.includes(usuario.nivelDeAcesso);

        setUsuarioAutorizado(autorizado);
      } catch (error) {
        console.error("Erro ao verificar permissão do usuário:", error);
        setUsuarioAutorizado(false);
      }
    };

    verificarPermissao();

    const intervalo = setInterval(verificarPermissao, 5000);

    return () => clearInterval(intervalo);
  }, [config.exigePermissao]);

  const handleClick = () => {
    if (isMobile && !clicked) {
      setClicked(true);

      setTimeout(() => {
        setClicked(false);
      }, 2000);

      return;
    }

    navigate(config.rota);
  };

  if (!usuarioAutorizado) {
    return null;
  }

  return (
    <div className={styles.botaoSolto}>
      <button
        type="button"
        className={`${styles.botaoTrocaPagina} ${
          clicked && isMobile ? styles.active : ""
        }`}
        onClick={handleClick}
        aria-label={config.alt}
        title={config.alt}
      >
        <img src={config.imagem} alt="" />
      </button>
    </div>
  );
}