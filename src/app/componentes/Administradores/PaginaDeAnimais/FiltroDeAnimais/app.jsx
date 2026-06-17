import styles from "./filtroDeAnimais.module.css";
import Select from "react-select";
import { useState, useRef } from "react";
import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";
import { criarFiltrosAnimaisPadrao } from "../../../GerenciarDadosAnimais/FiltrarAnimais/filtrarAnimais";

export default function FiltroDeAnimais({ filtros, setFiltros }) {
  const [termoPesquisa, setTermoPesquisa] = useState(filtros.nome || "");

  // Refs para os componentes Select
  const tipoSelectRef = useRef(null);
  const idadeSelectRef = useRef(null);
  const sexoSelectRef = useRef(null);
  const vacinacaoSelectRef = useRef(null);
  const dataVacinacaoSelectRef = useRef(null);
  const castracaoSelectRef = useRef(null);
  const adocaoSelectRef = useRef(null);
  const microchipSelectRef = useRef(null);
  const vermifugacaoSelectRef = useRef(null);

  const handlePesquisaNome = (event) => {
    const termo = event.target.value;
    setTermoPesquisa(termo);
    setFiltros((prev) => ({
      ...prev,
      nome: termo,
    }));
  };

  const limparTodosFiltros = () => {
    setTermoPesquisa("");
    setFiltros(criarFiltrosAnimaisPadrao());

    // Resetar os componentes Select visualmente
    tipoSelectRef.current?.clearValue();
    idadeSelectRef.current?.clearValue();
    sexoSelectRef.current?.clearValue();
    vacinacaoSelectRef.current?.clearValue();
    dataVacinacaoSelectRef.current?.clearValue();
    castracaoSelectRef.current?.clearValue();
    adocaoSelectRef.current?.clearValue();
    microchipSelectRef.current?.clearValue();
    vermifugacaoSelectRef.current?.clearValue();
  };

  return (
    <div className={styles.containerFiltrosDeSelecao}>
      <div className={styles.containerFiltro}>
        <h1 className={styles.tituloItemFiltrar}>Dados de identificação</h1>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDeIdentificacao}>Nome:</label>
          <input
            className={styles.barrinhaDePesquisa}
            type="text"
            placeholder="Pesquise pelo nome"
            value={termoPesquisa}
            onChange={handlePesquisaNome}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDeIdentificacao}>Idade:</label>
          <Select
            ref={idadeSelectRef}
            isMulti
            options={opcoes.idadeAnimais}
            placeholder="Idade"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                idade: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.idade.map((opt) =>
              opcoes.idadeAnimais.find((o) => o.value === opt)
            )}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDeIdentificacao}>Sexo:</label>
          <Select
            ref={sexoSelectRef}
            isMulti
            options={opcoes.sexoDoAnimal}
            placeholder="Sexo"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                sexo: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.sexo.map((opt) =>
              opcoes.sexoDoAnimal.find((o) => o.value === opt)
            )}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDeIdentificacao}>Tipo:</label>
          <Select
            ref={tipoSelectRef}
            isMulti
            options={opcoes.tipoAnimal}
            placeholder="Tipo de animal"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                tipo: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.tipo.map((opt) =>
              opcoes.tipoAnimal.find((o) => o.value === opt)
            )}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDeIdentificacao}>
            Status de microchipagem:
          </label>
          <Select
            ref={microchipSelectRef}
            isMulti
            options={opcoes.StatusMicrochipagem}
            placeholder="Status de microchipagem"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                statusMicrochipagem: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.statusMicrochipagem.map((opt) =>
              opcoes.StatusMicrochipagem.find((o) => o.value === opt)
            )}
          />
        </div>
      </div>

      <div className={styles.containerFiltro}>
        <h1 className={styles.tituloItemFiltrar}>Dados de saúde</h1>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDadosSaude}>Status de vacinação:</label>
          <Select
            ref={vacinacaoSelectRef}
            isMulti
            options={opcoes.StatusVacinacao}
            placeholder="Status de vacinação"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                statusVacinacao: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.statusVacinacao.map((opt) =>
              opcoes.StatusVacinacao.find((o) => o.value === opt)
            )}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDadosSaude}>Data de vacinação:</label>
          <Select
            ref={dataVacinacaoSelectRef}
            isMulti
            options={opcoes.DataVacinacao}
            placeholder="Possui ou não data de vacinação"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                dataVacinacao: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.dataVacinacao.map((opt) =>
              opcoes.DataVacinacao.find((o) => o.value === opt)
            )}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDadosSaude}>Status de castração:</label>
          <Select
            ref={castracaoSelectRef}
            isMulti
            options={opcoes.StatusCastracao}
            placeholder="Status de castração"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                statusCastracao: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.statusCastracao.map((opt) =>
              opcoes.StatusCastracao.find((o) => o.value === opt)
            )}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDadosSaude}>Status de adoção:</label>
          <Select
            ref={adocaoSelectRef}
            isMulti
            options={opcoes.StatusAdocao}
            placeholder="Status de adoção"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                statusAdocao: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.statusAdocao.map((opt) =>
              opcoes.StatusAdocao.find((o) => o.value === opt)
            )}
          />
        </div>
        <div className={styles.alinharDadosDeFiltragem}>
          <label className={styles.labelDadosSaude}>
            Status de vermifugação:
          </label>
          <Select
            ref={vermifugacaoSelectRef}
            isMulti
            options={opcoes.StatusVermifugacao}
            placeholder="Status de vermifugação"
            onChange={(selectedOptions) =>
              setFiltros((prev) => ({
                ...prev,
                statusVermifugacao: (selectedOptions || []).map((opt) => opt.value),
              }))
            }
            className={styles.selectFiltrarAnimal}
            value={filtros.statusVermifugacao.map((opt) =>
              opcoes.StatusVermifugacao.find((o) => o.value === opt)
            )}
          />
        </div>
      </div>

      <div className={styles.alinharBotaoInserir}>
        <button
          onClick={limparTodosFiltros}
          className={styles.botaoLimparFiltros}
        >
          Limpar todos os filtros
        </button>
      </div>
    </div>
  );
}