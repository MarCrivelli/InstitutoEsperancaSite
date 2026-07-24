import "bootstrap/dist/css/bootstrap.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import styles from "./homeAdm.module.css";
import Header from "../../../Header/app";
import BotaoDeTrocaDePaginas from "../../../BotaoParaPaginaDeAdms/app";
import RolarPCima from "../../../../hooks/BotaoScroll/app";
import Card1 from "../Card1/app";
import Card2 from "../Card2/app";
import Card3 from "../Card3/app";

export default function PaginaInicialAdministradores() {
  return (
    <div className={styles.fundoPagina}>
      <Header destino="adms" />
      <BotaoDeTrocaDePaginas destino="visitantes" />
      <RolarPCima />

      <div className={styles.fundoPainel}>
        <div className={styles.painel}>
          
          <div className={`${styles.padraoCard} ${styles.card1}`}>
            <h1>Quadro de Avisos</h1>
            <Card1 />
          </div>

          <div className={`${styles.padraoCard} ${styles.card2}`}>
            <h1>Lembrete de vacinação</h1>
            <Card2 />
          </div>

          <div className={`${styles.padraoCard} ${styles.card3}`}>
            <h1>Inserir Arquivo</h1>
            <Card3 />
          </div>
          
        </div>
      </div>
    </div>
  );
}