import styles from "./quadroDeAvisos.module.css";
import { useState, useEffect } from "react";
import Card1 from "../../Administradores/Home/Card1/app";

export default function QuadroDeAvisos() {
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [jaInteragiu, setJaInteragiu] = useState(false);
  const [quantidadeAvisos, setQuantidadeAvisos] = useState(0);
  const [avisosVisualizados, setAvisosVisualizados] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mostrarAviso ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mostrarAviso]);

  function alternarAviso() {
    setJaInteragiu(true);

    setMostrarAviso((prev) => {
      const vaiAbrir = !prev;

      if (vaiAbrir) {
        setAvisosVisualizados(true);
      }

      return vaiAbrir;
    });
  }

  function atualizarQuantidadeAvisos(quantidade) {
    setQuantidadeAvisos(quantidade);

    if (quantidade === 0) {
      setAvisosVisualizados(false);
    }
  }

  const deveMostrarContador = quantidadeAvisos > 0 && !avisosVisualizados;

  return (
    <>
      <button
        type="button"
        onClick={alternarAviso}
        className={styles.botaoAviso}
        title="Quadro de avisos"
      >
        <img
          src={`${import.meta.env.BASE_URL}quadroDeAvisos/sino.png`}
          alt="Ícone Aviso"
        />

        {deveMostrarContador && (
          <span className={styles.contadorAvisos}>
            {quantidadeAvisos > 9 ? "9+" : quantidadeAvisos}
          </span>
        )}
      </button>

      <div
        className={`
          ${styles.fundoPadrao}
          ${
            jaInteragiu
              ? mostrarAviso
                ? styles.mostrarAviso
                : styles.esconderAviso
              : styles.avisoInicial
          }
        `}
      >
        <Card1 onQuantidadeAvisosChange={atualizarQuantidadeAvisos} />
      </div>
    </>
  );
}