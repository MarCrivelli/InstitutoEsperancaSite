"use client";
import { useRef } from "react";
import Header from "../HeaderVisitantes/app";
import styles from "./denuncie.module.css";

export default function Denuncie() {
  const secaoNumeroPolicia = useRef(null);

  const rolarParaSecaoNPolicia = () => {
    secaoNumeroPolicia.current?.scrollIntoView({ behavior: "smooth" });
  };

  const secaoSiteDelegacia = useRef(null);

  const rolarParaSecaoSiteDelegacia = () => {
    secaoSiteDelegacia.current?.scrollIntoView({ behavior: "smooth" });
  };

  //função para que o número de telefone das delegacias sejam copiados automáticamente
  const inputReferencia = useRef(null);

  const copiarParaAreaDeTransferencia = () => {
    if (inputReferencia.current) {
      navigator.clipboard.writeText(inputReferencia.current.value);
      alert("Texto copiado!");
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.fundoDenuncia}>
        <div className={styles.alinharInfoSubPagina}>
          <img
            className={styles.imagemIntrodutoria}
            src="/paginaDeDenuncia/denuncie.png"
          ></img>
          <h1 className={styles.tituloSubPagina}>Aba de denúncias</h1>
        </div>
        <div className={styles.conteudoSubPagina}>
          <div className={styles.alinharCards}>
            <div className={styles.card}>
              <div className={styles.alinharImagemCard}>
                <img
                  className={styles.imagemCard}
                  src="/paginaDeDenuncia/telefone.png"
                ></img>
              </div>
              <h2 className={styles.textoCard}>
                Ligue para as autoridades locais de Nova Andradina ou para a
                Polícia Ambiental.
              </h2>
              <button
                onClick={rolarParaSecaoNPolicia}
                className={styles.botaoRedirecional}
              >
                Clique aqui!
              </button>
            </div>
            <div className={styles.card}>
              <div className={styles.alinharImagemCard}>
                <img
                  className={styles.imagemCard}
                  src="/paginaDeDenuncia/policia.png"
                ></img>
              </div>
              <h2 className={styles.textoCard}>
                Faça um relato através do site da Delegacia Online de Mato Grosso do
                Sul.
              </h2>
              <button
                onClick={rolarParaSecaoSiteDelegacia}
                className={styles.botaoRedirecional}
              >
                Clique aqui!
              </button>
            </div>
          </div>
          {/* Divisória */}
          <div className={styles.divisoria}></div>
          {/* Fim da divisória */}
          <div className={styles.secao}>
            <h1 ref={secaoNumeroPolicia}>Telefone da polícia local</h1>
            <h3>
              Caso a situação exija uma ação imediata das autoridades, prefira
              ligar para os números abaixo para relatar a situação que está
              acontecendo.
            </h3>
            <div className={styles.alinharNumero}>
              <h2>Número da Polícia Militar Ambiental:</h2>
              <input
                ref={inputReferencia}
                type="text"
                value="67 3443-1095"
                readOnly
                onClick={copiarParaAreaDeTransferencia}
                className={styles.inputCopiar}
                title="Copiar para área de transferência"
              />
            </div>
            <div className={styles.alinharNumero}>
              <h2>Número da Polícia Civil de Nova Andradina:</h2>
              <input
                ref={inputReferencia}
                type="text"
                value="67 99223-0178"
                readOnly
                onClick={copiarParaAreaDeTransferencia}
                className={styles.inputCopiar}
                title="Copiar para área de transferência"
              />
            </div>
          </div>
          {/* Divisória */}
          <div className={styles.divisoria}></div>
          {/* Fim da divisória */}
          <div className={styles.secao}>
            <h1 ref={secaoSiteDelegacia}>Site da Delegacia Online de Mato Grosso do Sul</h1>
            <h3>
              Caso seja uma situação que não exija uma ação imediata das
              autoridades, o site da Delegacia Online de Mato Grosso do Sul pode
              ser uma melhor opção.
            </h3>
            <div className={styles.alinharNumero}>
              <h2>Link do site da Delegacia Online de Mato Grosso do Sul:</h2>
              <input
                ref={inputReferencia}
                type="text"
                value="http://devir.pc.ms.gov.br/#/"
                readOnly
                onClick={copiarParaAreaDeTransferencia}
                className={styles.inputCopiar}
                title="Copiar para área de transferência"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
