//================ Importações externas ================//
import { useState } from "react";
import { FaHandHoldingHeart, FaPaw } from "react-icons/fa";

//================ Minhas importações ================//
import styles from "./seccaoCarrossel.module.css";
import CarrosselDeAnimaisVisitantes from "../CarrosselDeAnimais/app";
import CarrosselDoadoresVisitantes from "../CarrosselDoadores/app";

export default function SeccaoCarrossel() {
  const [carrosselAtivo, setCarrosselAtivo] = useState("doadores");
  const titulosCarrossel = {
    doadores: "Doadores recentes",
    animais: "Animais Resgatados",
  };

  //================ Botões que alternam entre os carrosséis ================//
  const BotoesCarrossel = (
    <div className={styles.botoesCarrossel}>
      <button
        className={`${styles.botaoCarrossel} ${
          carrosselAtivo === "doadores" ? styles.ativo : ""
        }`}
        onClick={() => setCarrosselAtivo("doadores")}
        aria-label="Doadores"
      >
        <div className={styles.iconeWrapper}>
          <FaHandHoldingHeart className={styles.iconeCarrossel} />
        </div>
      </button>
      <button
        className={`${styles.botaoCarrossel} ${
          carrosselAtivo === "animais" ? styles.ativo : ""
        }`}
        onClick={() => setCarrosselAtivo("animais")}
        aria-label="Nossos Animais"
      >
        <div className={styles.iconeWrapper}>
          <FaPaw className={styles.iconeCarrossel} />
        </div>
      </button>
    </div>
  );

  return (
    <div className={styles.fundoSeccaoCarrossel}>
      <div className={styles.painel}>
        {BotoesCarrossel}
        <h1 className={styles.tituloCarrossel}>
            {titulosCarrossel[carrosselAtivo]}
        </h1>

        {carrosselAtivo === "doadores" && <CarrosselDoadoresVisitantes />}
        {carrosselAtivo === "animais" && <CarrosselDeAnimaisVisitantes />}
      </div>
    </div>
  );
}
