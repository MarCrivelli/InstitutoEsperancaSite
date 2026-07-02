import styles from './quadroDeAvisos.module.css';
import { useState, useEffect } from "react";
import Card1 from '../../Administradores/Home/Card1/app';

export default function QuadroDeAvisos() {

  const [mostrarAviso, setMostrarAviso] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mostrarAviso ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mostrarAviso]);

    return(
        <>
          <button onClick={() => setMostrarAviso(!mostrarAviso)} className={styles.botaoAviso}>
            <img src={`${import.meta.env.BASE_URL}quadroDeAvisos/sino.png`} alt="Icone Aviso" />
          </button>
          <div className={`${mostrarAviso ? styles.mostrarAviso : styles.esconderAviso}`}>
            <Card1/>
          </div>
        </>
    )
}