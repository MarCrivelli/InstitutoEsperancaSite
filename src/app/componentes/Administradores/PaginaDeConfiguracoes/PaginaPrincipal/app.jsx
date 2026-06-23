//================ Importações externas ================//
import styles from "./configuracoes.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

//================ Minhas importações ================//
import HeaderAdms from "../../HeaderAdms/app";
import BotaoPagInicial from "../../BotaoPagInicialAdms/app";
import FuncoesDeAdministrador from "../FuncoesAdm/app";
import CarrosselDeDoadores from "../CarrosselDeDoadores/app";
import CarrosselAnimaisAutonomo from "../CarrosselDeAnimais/app";

export default function Configuracoes() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState("primeiroTopico");

  useEffect(() => {
    const carregarUsuario = () => {
      try {
        const dadosUsuario = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (dadosUsuario && token) {
          const usuario = JSON.parse(dadosUsuario);
          setUsuarioLogado(usuario);
          console.log("👤 Usuário logado carregado:", usuario);
          console.log("🔑 Nível de acesso:", usuario.nivelDeAcesso);
        } else {
          console.log("❌ Nenhum usuário logado encontrado");
          // Opcional: redirecionar para login se não houver usuário logado
          // navigate("/autenticar");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    carregarUsuario();
  }, [navigate]);

  useEffect(() => {
    if (!usuarioLogado) return;

    if (
      abaAtiva === "terceiroTopico" &&
      usuarioLogado.nivelDeAcesso !== "administrador"
    ) {
      setAbaAtiva("primeiroTopico");
    }

    if (
      abaAtiva === "segundoTopico" &&
      !["administrador", "subAdministrador"].includes(
        usuarioLogado.nivelDeAcesso,
      )
    ) {
      setAbaAtiva("primeiroTopico");
    }
  }, [usuarioLogado, abaAtiva]);

  // Função para fazer logout
  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair da sua conta?")) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setUsuarioLogado(null);
      console.log("🚪 Usuário deslogado");
      alert("Logout realizado com sucesso!");

      // Redirecionar para página inicial após deslogar
      navigate("/");
    }
  };

  // Função para obter o nome do nível de acesso formatado
  const obterNomeNivelAcesso = (nivel) => {
    const niveis = {
      administrador: "Administrador(a)",
      subAdministrador: "Sub-administrador(a)",
      contribuinte: "Contribuinte",
      usuario: "Usuário",
    };
    return niveis[nivel] || "Usuário";
  };

  const nivelDeAcesso = usuarioLogado?.nivelDeAcesso;

  const ehAdministrador = nivelDeAcesso === "administrador";

  const ehSubAdministrador = nivelDeAcesso === "subAdministrador";

  const ehContribuinte = nivelDeAcesso === "contribuinte";

  const podeGerenciarCarrosseis = ehAdministrador || ehSubAdministrador;

  const podeGerenciarUsuarios = ehAdministrador;

  return (
    <div className={styles.fundoPagina}>
      <HeaderAdms />
      <BotaoPagInicial />
      <div className={styles.fundoPainel}>
        <div className={styles.painel}>
          <div className={styles.inicioPainel}>
            <div className={styles.topoInicioPainel}>
              <h1 className={styles.contaAtual}>Conta atual:</h1>
              <div
                className={styles.alinharDeslogue}
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
                title="Clique para sair da conta"
              >
                <h1 className={styles.textoDeslogue}>Deslogar</h1>
                <img
                  className={styles.iconeSair}
                  src={`${import.meta.env.BASE_URL}pagConfiguracoes/iconeSair.png`}
                  alt="Ícone de logout"
                />
              </div>
            </div>
            <div className={styles.alinharInfoUsuario}>
              <img
                className={styles.iconeUsuario}
                src={
                  usuarioLogado?.foto ||
                  `${import.meta.env.BASE_URL}paraErros/user.png`
                }
                alt="Avatar do usuário"
              />
              <h1 className={styles.nomeUsuario}>
                {usuarioLogado ? usuarioLogado.nome : "Carregando..."}
              </h1>
              <p className={styles.funcaoUsuario}>
                {usuarioLogado
                  ? obterNomeNivelAcesso(usuarioLogado.nivelDeAcesso)
                  : "Carregando..."}
              </p>
            </div>
          </div>

          <Tabs
            defaultActiveKey="primeiroTopico"
            onSelect={(key) => {
              if (key) {
                setAbaAtiva(key);
              }
            }}
            activeKey={abaAtiva}
            id="abas-configuracoes"
            transition={true}
            className={styles.tabs}
          >
            <Tab
              eventKey="primeiroTopico"
              title={
                <div className={styles.conteudoTab}>
                  <img
                    src={`${import.meta.env.BASE_URL}pagConfiguracoes/animal.png`}
                    alt=""
                    className={styles.iconeTab}
                  />
                  <span className={styles.textoTab}>Carrossel de animais</span>
                </div>
              }
              tabClassName={`${styles.tabPadrao} ${
                abaAtiva === "primeiroTopico" ? styles.tabAtivo : ""
              }`}
              className={styles.tab}
            >
              <div
                className={
                  ehContribuinte ? styles.conteudoSomenteLeitura : undefined
                }
              >
                <CarrosselAnimaisAutonomo />
              </div>

              {ehContribuinte && (
                <p className={styles.avisoSomenteLeitura}>
                  Seu nível de acesso não permite realizar alterações, apenas
                  visualizar.
                </p>
              )}
            </Tab>

            <Tab
              eventKey="segundoTopico"
              title={
                <div className={styles.conteudoTab}>
                  <img
                    src={`${import.meta.env.BASE_URL}pagConfiguracoes/doacoes.png`}
                    alt=""
                    className={styles.iconeTab}
                  />
                  <span className={styles.textoTab}>Carrossel de doadores</span>
                </div>
              }
              disabled={!podeGerenciarCarrosseis}
              tabClassName={`${styles.tabPadrao} ${
                abaAtiva === "segundoTopico" ? styles.tabAtivo : ""
              } ${!podeGerenciarCarrosseis ? styles.tabDesabilitado : ""}`}
              className={styles.tab}
            >
              <CarrosselDeDoadores />
            </Tab>

            <Tab
              eventKey="terceiroTopico"
              title={
                <div className={styles.conteudoTab}>
                  <img
                    src={`${import.meta.env.BASE_URL}pagConfiguracoes/configuracoes.png`}
                    alt=""
                    className={styles.iconeTab}
                  />
                  <span className={styles.textoTab}>
                    Funções de administrador
                  </span>
                </div>
              }
              disabled={!podeGerenciarUsuarios}
              tabClassName={`${styles.tabPadrao} ${
                abaAtiva === "terceiroTopico" ? styles.tabAtivo : ""
              } ${!podeGerenciarUsuarios ? styles.tabDesabilitado : ""}`}
              className={styles.tab}
            >
              <FuncoesDeAdministrador />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
