import styles from "./postagem.module.css";
import Header from "../../Header/app";
import BotaoDeTrocaDePaginas from "../../BotaoParaPaginaDeAdms/app";
import opcoesSelect from "../OpcoesDeSelecao/opcoes";
import Select from "react-select";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

export default function ProgramarPostagem() {
  const [abaAtiva, setAbaAtiva] = useState("primeiroTopico");

  // Estados para os filtros selecionados
  const [filtrosSelecionados, setFiltrosSelecionados] = useState({
    idade: [],
    tipoAnimal: null,
    sexo: null,
    statusVacinacao: null,
    statusCastracao: null,
    statusAdocao: null,
    statusMicrochipagem: null,
    statusVermifugacao: null,
    dataPostagem: "",
    opcaoPublicacao: null,
  });

  // Opções para o seletor de data/hora
  const opcoesTempoPostagem = [
    { value: "agora", label: "Publicar agora" },
    { value: "agendar", label: "Agendar para depois" },
  ];

  // Manipuladores genéricos para os selects
  const handleChangeFiltro = (campo) => (opcaoSelecionada) => {
    setFiltrosSelecionados((prev) => ({
      ...prev,
      [campo]: opcaoSelecionada,
    }));
  };

  // Manipulador específico para o tempo de publicação
  const handleChangeTempoPostagem = (opcaoSelecionada) => {
    setFiltrosSelecionados((prev) => ({
      ...prev,
      opcaoPublicacao: opcaoSelecionada,
      dataPostagem:
        opcaoSelecionada?.value === "agora" ? "" : prev.dataPostagem,
    }));
  };

  // Manipulador para a data selecionada
  const handleChangeData = (e) => {
    setFiltrosSelecionados((prev) => ({
      ...prev,
      dataPostagem: e.target.value,
    }));
  };

  const obterDataHoraLocalAtual = () => {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    return agora.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!window.KUTE) {
      console.error("KUTE.js não foi carregado.");
      return;
    }

    const morph1 = window.KUTE.fromTo(
      "#blob1",
      { path: "#blob1" },
      { path: "#blobPai" },
      {
        repeat: 1000000000000000,
        duration: 8000,
        yoyo: true,
      },
    );

    const morph2 = window.KUTE.fromTo(
      "#blob2",
      { path: "#blob2" },
      { path: "#blob3" },
      {
        repeat: 1000000000000000,
        duration: 5000,
        yoyo: true,
      },
    );

    const morph3 = window.KUTE.fromTo(
      "#blob3",
      { path: "#blob3" },
      { path: "#blob4" },
      {
        repeat: 1000000000000000,
        duration: 5000,
        yoyo: true,
      },
    );

    const morph4 = window.KUTE.fromTo(
      "#blob4",
      { path: "#blob4" },
      { path: "#blob5" },
      {
        repeat: 1000000000000000,
        duration: 5000,
        yoyo: true,
      },
    );

    const morph5 = window.KUTE.fromTo(
      "#blob5",
      { path: "#blob5" },
      { path: "#blob3" },
      {
        repeat: 1000000000000000,
        duration: 5000,
        yoyo: true,
      },
    );

    morph1.start();
    morph2.start();
    morph3.start();
    morph4.start();
    morph5.start();

    return () => {
      morph1.stop();
      morph2.stop();
      morph3.stop();
      morph4.stop();
      morph5.stop();
    };
  }, []);

  return (
    <div className={styles.fundoPagina}>
      <Header destino="adms" />
      <BotaoDeTrocaDePaginas destino="visitantes" />

      <svg
        className={styles.iconeBlob}
        id="visual"
        viewBox="0 0 900 450"
        width="900"
        height="450"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g transform="translate(453.93861595437744 211.12544562204354)">
          <path
            id="blob1"
            d="M60.7 -81.8C80 -69.5 98 -53.6 107.8 -32.8C117.6 -12.1 119.2 13.6 115.8 41.9C112.5 70.1 104.1 101 84 121.8C63.9 142.6 31.9 153.3 2.6 149.6C-26.6 146 -53.3 128 -70.1 106.1C-86.9 84.3 -93.9 58.5 -103.5 32.7C-113.2 6.9 -125.5 -19 -125.3 -47.2C-125 -75.4 -112.1 -106 -89.1 -117.1C-66.1 -128.3 -33.1 -120.2 -6.2 -111.6C20.7 -103.1 41.3 -94.2 60.7 -81.8"
            fill="#bb004bb9"
          />
        </g>
        <g
          transform="translate(893.0624036446668 -7.308214649603926)"
          className={styles.oBlob2}
        >
          <path
            id="blob2"
            d="M61.2 -89.3C79 -71.4 92.8 -53 107.1 -29.9C121.4 -6.7 136.3 21.2 132.7 46.4C129 71.6 106.8 94 81.6 114C56.4 133.9 28.2 151.3 2.1 148.5C-24.1 145.7 -48.2 122.6 -64.9 99.9C-81.6 77.2 -91 54.9 -100.6 31.3C-110.3 7.6 -120.3 -17.4 -119.3 -44.4C-118.2 -71.4 -106.1 -100.4 -84.4 -117C-62.7 -133.6 -31.3 -137.8 -4.8 -131.2C21.7 -124.6 43.5 -107.2 61.2 -89.3"
            fill="#bb004bb9"
          ></path>
        </g>
        <g
          transform="translate(10.275320692401777 454.2410829035884)"
          className={styles.oBlob3}
        >
          <path
            id="blob3"
            d="M76.5 -105.8C94.3 -92.4 100.4 -63.5 108.1 -36C115.7 -8.5 124.9 17.5 117.4 37.4C110 57.4 85.8 71.2 63.5 83.2C41.1 95.3 20.6 105.6 -1.1 107.1C-22.7 108.6 -45.5 101.2 -72.2 90.6C-99 79.9 -129.7 66 -138.2 44C-146.6 21.9 -132.8 -8.4 -116.3 -31.3C-99.9 -54.2 -81 -69.8 -61.1 -82.5C-41.3 -95.2 -20.7 -105.1 4.4 -111.1C29.4 -117.1 58.8 -119.2 76.5 -105.8"
            fill="#bb004bb9"
          ></path>
        </g>
        <g
          transform="translate(-13.139148666267246 11.683800701351444)"
          className={styles.oBlob4}
        >
          <path
            id="blob4"
            d="M91.1 -125.7C117.6 -106.2 138.2 -78.9 139 -51.1C139.8 -23.4 120.8 4.8 107.9 32.2C95.1 59.5 88.4 86 71.4 103.1C54.5 120.3 27.2 128.2 -1.9 130.7C-31 133.3 -61.9 130.5 -78.6 113.3C-95.4 96.1 -97.8 64.3 -102.6 36.4C-107.5 8.5 -114.6 -15.5 -112.3 -40.8C-110 -66 -98.2 -92.5 -77.9 -114C-57.6 -135.5 -28.8 -152.1 1.8 -154.6C32.3 -157 64.7 -145.2 91.1 -125.7"
            fill="#bb004bb9"
          ></path>
        </g>
        <g
          transform="translate(903.1980555828286 446.23631091057854)"
          className={styles.oBlob5}
        >
          <path
            id="blob5"
            d="M72.4 -102.4C89.2 -87.5 95 -60.1 106 -32.9C117 -5.7 133.1 21.4 128.1 43.1C123.1 64.7 96.8 80.9 71.9 93C47 105.1 23.5 113 -4.4 119.1C-32.3 125.2 -64.7 129.3 -81.4 114.6C-98.1 99.9 -99.2 66.2 -109.8 35.3C-120.4 4.3 -140.4 -23.9 -134.3 -43.9C-128.2 -63.9 -95.8 -75.6 -69.1 -87.3C-42.3 -98.9 -21.2 -110.5 3.3 -115C27.8 -119.6 55.6 -117.3 72.4 -102.4"
            fill="#bb004bb9"
          ></path>
        </g>
        <g
          transform="translate(440.88909043247145 237.29569375299846)"
          className={styles.oBlobPai}
        >
          <path
            id="blobPai"
            d="M43.7 -38.8C62.5 -25 87.5 -12.5 88.7 1.2C89.8 14.8 67.2 29.7 48.4 38C29.7 46.4 14.8 48.2 2.5 45.7C-9.9 43.3 -19.9 36.6 -33.7 28.2C-47.6 19.9 -65.3 9.9 -69.5 -4.2C-73.7 -18.4 -64.4 -36.8 -50.6 -50.6C-36.8 -64.4 -18.4 -73.7 -2.9 -70.8C12.5 -67.8 25 -52.7 43.7 -38.8"
            fill="#bb004bb9"
          ></path>
        </g>
      </svg>
      <div className={styles.fundoPainel}>
        <div className={styles.painel}>
          <div className={styles.introducaoPagina}>
            <h1>Programar Postagens</h1>
            <p>
              Faça postagens diretamente pelo site de maneira fácil e rápida!
              Logo abaixo estarão{" "}
              <span>&quot;Filtros pré-selecionados&quot;</span> e{" "}
              <span>&quot;Seleção Manual&quot;</span>. No bloco de filtros
              pré-selecionados, você escolherá as características que os animais
              que farão parte da postagem terão e qual a data que deseja postar.
              Já no bloco de selecão manual, você mesmo selecionará os animais
              que você deseja inserir na postagem.
            </p>
          </div>
          <Tabs
            defaultActiveKey="primeiroTopico"
            id="uncontrolled-tab-example"
            onSelect={(key) => setAbaAtiva(key)}
            activeKey={abaAtiva}
            className={styles.tabs}
          >
            <Tab
              eventKey="primeiroTopico"
              title="Pré-seleção"
              tabClassName={
                abaAtiva === "primeiroTopico"
                  ? styles.botaoTabSelecionado
                  : styles.botaoTabNaoSelecionado
              }
              className={`${styles.conteudoTab} ${styles.conteudoTab1}`}
            >
              <div className={styles.containerFiltros}>
                <div className={styles.filtro}>
                  <label>Idade</label>
                  <Select
                    isMulti
                    options={opcoesSelect.idadeAnimais}
                    value={filtrosSelecionados.idade}
                    onChange={handleChangeFiltro("idade")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Tipo de animal</label>
                  <Select
                    options={opcoesSelect.tipoAnimal}
                    value={filtrosSelecionados.tipoAnimal}
                    onChange={handleChangeFiltro("tipoAnimal")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Sexo</label>
                  <Select
                    options={opcoesSelect.sexoDoAnimal}
                    value={filtrosSelecionados.sexo}
                    onChange={handleChangeFiltro("sexo")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Status de vacinação</label>
                  <Select
                    options={opcoesSelect.StatusVacinacao}
                    value={filtrosSelecionados.statusVacinacao}
                    onChange={handleChangeFiltro("statusVacinacao")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Status de castração</label>
                  <Select
                    options={opcoesSelect.StatusCastracao}
                    value={filtrosSelecionados.statusCastracao}
                    onChange={handleChangeFiltro("statusCastracao")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Status de adoção</label>
                  <Select
                    options={opcoesSelect.StatusAdocao}
                    value={filtrosSelecionados.statusAdocao}
                    onChange={handleChangeFiltro("statusAdocao")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Status de microchipagem</label>
                  <Select
                    options={opcoesSelect.StatusMicrochipagem}
                    value={filtrosSelecionados.statusMicrochipagem}
                    onChange={handleChangeFiltro("statusMicrochipagem")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Status de vermifugação</label>
                  <Select
                    options={opcoesSelect.StatusVermifugacao}
                    value={filtrosSelecionados.statusVermifugacao}
                    onChange={handleChangeFiltro("statusVermifugacao")}
                    placeholder="Selecione"
                    className={styles.select}
                  />
                </div>

                <div className={styles.filtro}>
                  <label>Quando publicar?</label>
                  <Select
                    options={opcoesTempoPostagem}
                    value={filtrosSelecionados.opcaoPublicacao}
                    onChange={handleChangeTempoPostagem}
                    placeholder="Selecione"
                    className={styles.select}
                  />

                  {filtrosSelecionados.opcaoPublicacao?.value === "agendar" && (
                    <div className={styles.seletorDataContainer}>
                      <input
                        type="datetime-local"
                        name="dataPostagem"
                        value={filtrosSelecionados.dataPostagem}
                        onChange={handleChangeData}
                        min={obterDataHoraLocalAtual()}
                        required
                        className={styles.seletorDataInput}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.containerBotaoPostagem}>
                <button>Postar</button>
              </div>
            </Tab>
            <Tab
              eventKey="segundoTopico"
              title="Seleção Manual"
              tabClassName={
                abaAtiva === "segundoTopico"
                  ? styles.botaoTabSelecionado
                  : styles.botaoTabNaoSelecionado
              }
              className={styles.conteudoTab}
            >
              <div className={styles.conteudoTab2}>
                <h1>Seleção Manual</h1>
                <p>
                  Deseja ignorar os filtros e selecionar manualmente os animais
                  que você gostaria que fizessem parte da postagem?{" "}
                  <Link
                    to="/fichas_de_animais?modoPostagem=true"
                    className={styles.linkSelecaoAvulsa}
                  >
                    Clique aqui
                  </Link>{" "}
                  para começar a seleção.
                </p>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
