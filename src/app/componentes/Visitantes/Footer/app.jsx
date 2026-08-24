import { useLocation } from "react-router-dom";
import { atribuicoes } from "../../../hooks/Atribuicoes/atribuicoes.jsx";
import { atribuicoesPorRota } from "../../../hooks/Atribuicoes/atribuicoesPorRota.jsx";
import styles from "./footer.module.css";

export default function Footer() {
  const location = useLocation();

  const atribuicoesFixas = ["instagram", "facebook"];

  const atribuicoesEspecificas = atribuicoesPorRota[location.pathname] || [];

  const atribuicoesDaPagina = [
    ...new Set([...atribuicoesFixas, ...atribuicoesEspecificas]),
  ];

  return (
    <footer>
      <div className={styles.secaoFooter}>
        <h1>Sobre nós</h1>

        <p>
          O Instituto Esperança é uma instituição sem fins lucrativos que atua
          diretamente na causa animal, com o objetivo principal de conscientizar
          as pessoas quanto ao bem-estar animal, aos maus-tratos e à adoção
          responsável.
        </p>
      </div>

      <div className={styles.secaoFooter}>
        <h1>Siga-nos nas redes sociais!</h1>

        <div className={styles.alinharRedesSociais}>
          <a
            href="https://www.instagram.com/esperancaavozdosanimais/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${import.meta.env.BASE_URL}footer/instagram.png`}
              alt="Instagram do Instituto Esperança"
            />
          </a>

          <a
            href="https://www.facebook.com/esperanca.a.voz.dos.animais"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${import.meta.env.BASE_URL}footer/facebook.png`}
              alt="Facebook do Instituto Esperança"
            />
          </a>
        </div>
      </div>

      <div className={styles.secaoFooter}>
        <h1>Contate-nos</h1>
        <div className={styles.alinharInfoContato}>
          <strong>Telefone:</strong>
          <p>+55 67 99904-2349</p>
        </div>
        <div className={styles.alinharInfoContato}>
          <strong>Cidade em que atuamos:</strong>
          <p>Taquarussu (MS)</p>
        </div>
        <div className={styles.alinharInfoContato}>
          <strong>Localização:</strong>
          <p>Rua José Martins dos Santos, nº 150</p>
        </div>
      </div>

      {atribuicoesDaPagina.length > 0 && (
        <div className={styles.secaoFooter}>
          <h1>Atribuições</h1>

          <div className={styles.listaAtribuicoes}>
            {atribuicoesDaPagina.map((nomeAtribuicao) => (
              <span key={nomeAtribuicao}>{atribuicoes[nomeAtribuicao]}</span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.secaoFooter}>
        <h1>Desenvolvido por:</h1>
        <p>
          Marco Antonio Prates Crivelli -{" "}
          <strong> marco.crivelli@estudante.ifms.edu.br</strong>
        </p>
      </div>

      <div className={styles.secaoFooter}>
        <h1>Menções honrosas</h1>

        <div className={styles.alinharMencao}>
          <p>
            Rodrigo Silva Duran -
            <strong> Orientador do projeto</strong>
          </p>
          <div className={styles.alinharMencaoContato}>
            <strong>E-mail para contato:</strong>
            <p>rodrigo.duran@ifms.edu.br</p>
          </div>
        </div>

        <div className={styles.alinharMencao}>
          <p>
            Marcelino Vitor dos Santos Garcia -
            <strong> Co-orientador do projeto</strong>
          </p>
          <div className={styles.alinharMencaoContato}>
            <strong>E-mail para contato:</strong>
            <p>marcelino.garcia@ifms.edu.br</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
