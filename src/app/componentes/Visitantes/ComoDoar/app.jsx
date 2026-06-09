import Header from "../HeaderVisitantes/app";
import styles from "./comoDoar.module.css";

export default function ComoDoar() {
  return (
    <div>
      <Header />
      <div className={styles.fundoDoacao}>
        <div className={styles.alinharInfoSubPagina}>
          <img
            className={styles.imagemIntrodutoria}
            src="/comoDoar/doar.png"
          ></img>
          <h1 className={styles.tituloSubPagina}>Aba de doações</h1>
        </div>
        <div className={styles.conteudoSubPagina}>
          <div className={`${styles.secao} ${styles.secaoInicial}`}>
            <h1>Nos ajude a cuidar de nossos animais</h1>
            <h2>
              O Instituto Esperança, por tratar e alimentar os animais em
              situação de vulnerabilidade, precisa de doações para continuar
              cuidando de nossos animais, garantindo que eles tenham plena saúde
              para receberem um novo lar. Caso 
            </h2>
          </div>
          {/* Divisória */}
          <div className={styles.divisoria}></div>
          {/* Fim da divisória */}
        </div>
      </div>
    </div>
  );
}
