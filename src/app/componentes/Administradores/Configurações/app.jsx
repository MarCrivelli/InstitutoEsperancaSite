import styles from "./configuracoes.module.css";
import HeaderAdms from "../HeaderAdms/app";
import Select from "react-select";
import BotaoPagInicial from "../BotaoPagInicial/app";
import Accordion from "react-bootstrap/Accordion";

export default function Configuracoes() {
  const usuarios = [
    { value: "usuario1", label: "Kauã" },
    { value: "usuario2", label: "Guilherme" },
    { value: "usuario3", label: "Renan" },
  ];
  const nivelDeAcesso = [
    { value: "administrador", label: "Administrador" },
    { value: "subAdministrador", label: "Sub-administrador" },
    { value: "contribuinte", label: "Contribuínte" },
  ];
  return (
    <div>
      <HeaderAdms />
      <BotaoPagInicial />
      <div className={styles.fundoConfig}>
        <div className={styles.fundoPainel}>
          <div className={styles.painel}>
            <div className={styles.inicioPainel}>
              <div className={styles.topoInicioPainel}>
                <h1 style={{ fontSize: "1.6rem" }}>Conta atual:</h1>
                <div className={styles.alinharDeslogue}>
                  <h1 className={styles.textoDeslogue}>Deslogar</h1>
                  <img
                    className={styles.iconeSair}
                    src="/pagConfiguracoes/iconeSair.png"
                  ></img>
                </div>
              </div>
              <div className={styles.alinharInfoUsuario}>
                <img className={styles.iconeUsuario} src="/usuario.png"></img>
                <h1 className={styles.nomeUsuario}>
                  João da Silva Ferreira dos Santos de Paula Crivelli
                </h1>
                <p className={styles.funcaoUsuario}>Administrador(a)</p>
              </div>
            </div>
            <Accordion
              className={styles.acordeaoPrincipal}
              defaultActiveKey="0"
            >
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <h1 className={styles.tituloAcordeao}>
                    Configurações de administrador
                  </h1>
                </Accordion.Header>
                <Accordion.Body className={styles.corpoAcordeao}>
                  <div className={styles.blocoFuncao}>
                    <div className={styles.configAdm1}>
                      <h1 className={styles.tituloConfig}>Excluir usuário:</h1>
                      <Select
                        options={usuarios}
                        placeholder="Digite ou selecione"
                        className={styles.selectConfig}
                      />
                      <button
                        className={`${styles.botaoPadraoConfig} ${styles.botaoExcluirUsuario}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div className={styles.blocoFuncao}>
                    <div className={styles.configAdm2}>
                      <h1
                        className={`${styles.tituloConfig} ${styles.tituloConfig2}`}
                      >
                        Alterar nível de acesso de um usuário:
                      </h1>
                      <Select
                        options={usuarios}
                        placeholder="Digite ou selecione"
                        className={styles.selectConfig}
                      />
                    </div>
                    <div className={styles.configAdm1}>
                      <h1
                        className={`${styles.tituloConfig} ${styles.tituloConfig2}`}
                      >
                        Escolha o novo nível de acesso:
                      </h1>
                      <Select
                        options={nivelDeAcesso}
                        placeholder="Selecione"
                        className={styles.selectConfig}
                      />
                    </div>
                    <button
                      className={`${styles.botaoPadraoConfig} ${styles.botaoAlterarNvlAcesso}`}
                    >
                      Alterar
                    </button>
                  </div>
                  <div className={styles.blocoFuncao}>
                    <div className={styles.configAdm2}>
                      <h1
                        className={`${styles.tituloConfig} ${styles.tituloConfig2}`}
                      >
                        Convidar novo membro:
                      </h1>
                      
                        <input
                          className={styles.inputEmail}
                          type="email"
                          placeholder="Insira um e-mail"
                        ></input>
                        
                    </div>
                    <div className={styles.configAdm1}>
                      <h1
                        className={`${styles.tituloConfig} ${styles.tituloConfig2}`}
                      >
                        Escolha o nível de acesso:
                      </h1>
                      <Select
                        options={nivelDeAcesso}
                        placeholder="Selecione"
                        className={styles.selectConfig}
                      />
                    </div>
                    <button
                      className={`${styles.botaoPadraoConfig} ${styles.botaoConvidar}`}
                    >
                      Convidar
                    </button>
                  </div>
                  <div className={styles.ultimoBlocoFuncao}></div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <h1 className={styles.tituloAcordeao}>
                    Configurações de usuário
                  </h1>
                </Accordion.Header>
                <Accordion.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
