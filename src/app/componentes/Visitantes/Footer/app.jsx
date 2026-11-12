import { useLocation } from "react-router-dom";
import { atribuicoes } from "../../../hooks/Atribuicoes/atribuicoes.jsx";
import { atribuicoesPorRota } from "../../../hooks/Atribuicoes/atribuicoesPorRota.jsx";
import styles from "./footer.module.css";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

export default function Footer() {
  const location = useLocation();

  const atribuicoesFixas = ["instagram", "facebook"];

  const atribuicoesEspecificas = atribuicoesPorRota[location.pathname] || [];

  const atribuicoesDaPagina = [
    ...new Set([...atribuicoesFixas, ...atribuicoesEspecificas]),
  ];

  const voluntarios = [
    { nome: "Eliane", img: "voluntarios/voluntario1.jpeg" },
    { nome: "Maria", img: "voluntarios/voluntario2.jpeg" },
    { nome: "Pedro", img: "voluntarios/voluntario3.jpeg" },
    { nome: "Clodoaldo", img: "voluntarios/voluntario4.jpeg" },
    { nome: "Keila", img: "voluntarios/voluntario5.jpeg" },
    { nome: "Marilza", img: "voluntarios/voluntario6.jpeg" },
  ];

  const diretoria = [
    { nome: "Eliane", img: "diretoria/diretor1.jpeg" },
    { nome: "Maria", img: "diretoria/diretor2.jpeg" },
    { nome: "Pedro", img: "diretoria/diretor3.jpeg" },
    { nome: "Clodoaldo", img: "diretoria/diretor4.jpeg" },
    { nome: "Keila", img: "diretoria/diretor5.jpeg" },
  ];

  return (
    <footer>
      <div className={styles.secaoFooter}>
        <Tabs
          defaultActiveKey="profile"
          id="justify-tab-example"
          className={styles.Tabs}
          justify
        >
          <Tab className={styles.Tab} eventKey="home" title="Voluntários">
            {voluntarios.map((voluntario, index) => (
              <div className={styles.cardVoluntarios} key={index}>
                <img src={voluntario.img} alt={voluntario.img} />
                <h2>{voluntario.nome}</h2>
              </div>
            ))}
          </Tab>
          <Tab className={styles.Tab} eventKey="profile" title="Diretoria">
            {diretoria.map((diretoria, index) => (
              <div className={styles.cardDiretoria} key={index}>
                <img src={diretoria.img} alt={diretoria.img} />
                <h2>{diretoria.nome}</h2>
              </div>
            ))}
          </Tab>
        </Tabs>
        <div>
          <h1>Sobre nós</h1>

          <p>
            O Instituto Esperança é uma instituição sem fins lucrativos que atua
            diretamente na causa animal, com o objetivo principal de
            conscientizar as pessoas quanto ao bem-estar animal, aos maus-tratos
            e à adoção responsável.
          </p>
        </div>
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
            Rodrigo Silva Duran -<strong> Orientador do projeto</strong>
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
