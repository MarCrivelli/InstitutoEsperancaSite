import styles from "./postagem.module.css";
import CabecalhoAdministrativo from "../HeaderAdms/app";
import BotaoPaginaInicial from "../BotaoPagInicialAdms/app";
import opcoesSelect from "../OpcoesDeSelecao/opcoes";
import Select from "react-select";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
    dataPostagem: null,
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
        opcaoSelecionada.value === "agora" ? null : prev.dataPostagem,
    }));
  };

  // Manipulador para a data selecionada
  const handleChangeData = (dataSelecionada) => {
    setFiltrosSelecionados((prev) => ({
      ...prev,
      dataPostagem: dataSelecionada,
    }));
  };

  return (
    <div className={styles.fundoPagina}>
      <CabecalhoAdministrativo />
      <BotaoPaginaInicial />
      <div className={styles.fundoPainel}>
        <div className={styles.painel}>
          <div className={styles.introducaoPagina}>
            <h1>Programar postagem no Instagram / Facebook</h1>
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
                        type="date"
                        name="dataInicio"
                        value={filtrosSelecionados.dataPostagem}
                        onChange={handleChangeData}
                        required
                      />
                      <DatePicker
                        selected={filtrosSelecionados.dataPostagem}
                        onChange={handleChangeData}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        minDate={new Date()}
                        placeholderText="Selecione data e hora"
                        className={styles.seletorDataInput}
                        withPortal
                        isClearable
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
          {/* <div className={styles.introducaoPagina}>
            <h1>Programar postagem no Instagram / Facebook</h1>
            <p>
              Faça postagens diretamente pelo site de maneira fácil e rápida! O
              bloco abaixo <span>&quot;Filtros pré-selecionados&quot;</span>{" "}
              contém um formulário que permite que sejam feitas postagens com os
              animais que estão cadastrados no site. Tudo que precisa ser feito
              é selecionar os filtros pré-definidos que buscaram automaticamente
              todos os animais que contém as características desejadas para a
              postagem
            </p>
          </div>

          <div className={styles.filtrosPreSelecionados}>
            <h1>Filtros pré-selecionados</h1>

            <div className={styles.containerFiltros}>
              
              <div className={styles.filtro}>
                <label>Idade dos animais para a postagem</label>
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
                <label>Sexo dos animais</label>
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
                      type="date"
                      name="dataInicio"
                      value={filtrosSelecionados.dataPostagem}
                      onChange={handleChangeData}
                      required
                    />
                    <DatePicker
                      selected={filtrosSelecionados.dataPostagem}
                      onChange={handleChangeData}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      minDate={new Date()}
                      placeholderText="Selecione data e hora"
                      className={styles.seletorDataInput}
                      withPortal
                      isClearable
                    />
                  </div>
                )}

                <div className={styles.containerBotaoPostagem}>
                  <button>Postar</button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.selecaoAvulsa}>
            <h1>Seleção Manual</h1>
            <p>
              Deseja ignorar os filtros e selecionar manualmente os animais que
              você gostaria que fizessem parte da postagem?{" "}
              <Link
                to="/fichas_de_animais?modoPostagem=true"
                className={styles.linkSelecaoAvulsa}
              >
                Clique aqui
              </Link>{" "}
              para começar a seleção.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
