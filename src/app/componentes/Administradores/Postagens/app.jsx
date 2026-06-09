import styles from "./postagem.module.css";
import HeaderAdms from "../HeaderAdms/app";
import BotaoPagInicial from "../BotaoPagInicial/app";
import Select from "react-select";

export default function ProgramarPostagem() {
  const faixaEtaria = [
    { value: "filhote", label: "Filhote" },
    { value: "adulto", label: "Adulto" },
    { value: "idoso", label: "Idoso" },
  ];
  const tipoAnimal = [
    { value: "cachorro", label: "Cachorro" },
    { value: "gato", label: "Gato" },
    { value: "ave", label: "Ave" },
  ];
  return (
    <div>
      <HeaderAdms />
      <BotaoPagInicial />
      <div className={styles.fundoPostagem}>
        <div className={styles.painel}>
          <h1 className={styles.tituloPainel}>
            Programar postagem no Instagram / Facebook
          </h1>
          <div className={styles.filtroPostagem}>
            <div className={styles.colunaPostagem1}>
              <div className={styles.linhaFiltro}>
                <h1 className={styles.tituloLinhaFiltro}>
                  Qual será a faixa etária dessa postagem?
                </h1>
                <Select
                  isMulti
                  options={faixaEtaria}
                  classNamePrefix="select"
                  placeholder="Selecione"
                  className={styles.filtroSelecao}
                />
              </div>
              <div className={styles.linhaFiltro}>
                <h1 className={styles.tituloLinhaFiltro}>
                  Tipos de animais que farão parte dessa postagem?
                </h1>
                <Select
                  isMulti
                  options={tipoAnimal}
                  classNamePrefix="select"
                  placeholder="Selecione"
                  className={styles.filtroSelecao}
                />
              </div>
              <div className={styles.linhaFiltro}>
                <h1 className={styles.tituloLinhaFiltro}>
                  Sexo dos animais que farão parte dessa postagem?
                </h1>
                <Select
                  isMulti
                  options={tipoAnimal}
                  classNamePrefix="select"
                  placeholder="Selecione"
                  className={styles.filtroSelecao}
                />
              </div>
              <div className={styles.linhaFiltro}>
                <h1 className={styles.tituloLinhaFiltro}>
                  Quando será feita essa postagem?
                </h1>
                <Select
                  isMulti
                  options={tipoAnimal}
                  classNamePrefix="select"
                  placeholder="Selecione"
                  className={styles.filtroSelecao}
                />
              </div>
            </div>
            <div className={styles.colunaPostagem2}>
              <p className={styles.textoSemFiltro}>
                Deseja ignorar todos os filtros e selecionar manualmente cada
                animal que fará parte dessa postagem?{" "}
                <strong>Clique aqui </strong>
                para abrir uma seleção com todos os animais cadastrados no site.
              </p>
            </div>
          </div>
          <button className={styles.botaoPostar}>Postar</button>
        </div>
      </div>
    </div>
  );
}
