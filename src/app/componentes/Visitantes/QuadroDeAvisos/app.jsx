import styles from "./quadroDeAvisos.module.css";
import { useState, useEffect, useCallback } from "react";
import Card1 from "../../Administradores/Home/Card1/app";

const CHAVE_AVISOS_LIDOS = "avisosLidos";

export default function QuadroDeAvisos() {
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [jaInteragiu, setJaInteragiu] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const [avisosLidos, setAvisosLidos] = useState([]);

  useEffect(() => {
    document.body.style.overflow = mostrarAviso ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mostrarAviso]);

  useEffect(() => {
    try {
      const avisosSalvos = localStorage.getItem(CHAVE_AVISOS_LIDOS);

      if (avisosSalvos) {
        setAvisosLidos(JSON.parse(avisosSalvos));
      }
    } catch (error) {
      console.error("Erro ao carregar avisos lidos:", error);
      setAvisosLidos([]);
    }
  }, []);

  const atualizarAvisos = useCallback((listaDeAvisos) => {
    setAvisos(listaDeAvisos);
  }, []);

  function salvarAvisosLidos(novosAvisosLidos) {
    setAvisosLidos(novosAvisosLidos);
    localStorage.setItem(CHAVE_AVISOS_LIDOS, JSON.stringify(novosAvisosLidos));
  }

  function marcarTodosComoLidos() {
    const idsDosAvisosAtuais = avisos.map((aviso) => aviso.id);

    const novosAvisosLidos = Array.from(
      new Set([...avisosLidos, ...idsDosAvisosAtuais])
    );

    salvarAvisosLidos(novosAvisosLidos);
  }

  function alternarAviso() {
    setJaInteragiu(true);

    setMostrarAviso((prev) => {
      const vaiAbrir = !prev;

      if (vaiAbrir) {
        marcarTodosComoLidos();
      }

      return vaiAbrir;
    });
  }

  const quantidadeAvisosNaoLidos = avisos.filter(
    (aviso) => !avisosLidos.includes(aviso.id)
  ).length;

  const deveMostrarContador = quantidadeAvisosNaoLidos > 0;

  return (
    <>
      <button
        type="button"
        onClick={alternarAviso}
        className={styles.botaoAviso}
        title="Quadro de avisos"
      >
        {mostrarAviso ? (
          <img
            src={`${import.meta.env.BASE_URL}iconeSair/sair.png`}
            alt="Fechar quadro de avisos"
          />
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}quadroDeAvisos/sino.png`}
            alt="Abrir quadro de avisos"
          />
        )}

        {deveMostrarContador && (
          <span className={styles.contadorAvisos}>
            {quantidadeAvisosNaoLidos > 9 ? "9+" : quantidadeAvisosNaoLidos}
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
        <Card1 onAvisosChange={atualizarAvisos} />
      </div>
    </>
  );
}