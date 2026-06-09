import "./home.css";
import "bootstrap/dist/css/bootstrap.css";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Header from "../HeaderVisitantes/app";

export default function HomeVisitantes() {
  var erro = false;

  if (erro) {
    return <h1>Erro</h1>;
  }

  return (
    <div className="mainPreLogin">
      <Header />
      <div className="logoPreLogin">
        <img
          src="logos/logoBranca.png"
          width={800}
          height={400}
          className="imagemLogo"
        />
        <div className="textoLogoPreLogin">
          <h1 className="titulo">Instituto Esperança</h1>
          <p>A voz dos animais</p>
        </div>
      </div>
      <Carousel className="carrossel">
        <div className="blocoCarrossel">
          <img className="imagem" src="mainVisitantes/cachorro.png" />
          <div className="textoCarrossel">
            <h1>Aqui, os animais são a nossa família.</h1>
            <p>
              Se encontrou um animalzinho abandonado, traga para nós, que nós
              cuidaremos dele até ele achar um novo lar. Se quiser adotar,
              também podemos te dar boas dicas de como cuidar do seu pet
            </p>
          </div>
        </div>
        <div className="blocoCarrossel">
          <img className="imagem" src="mainVisitantes/gato.png" />
          <div className="textoCarrossel">
            <h1>Recebemos diversos tipos de animais de quatro patar!</h1>
            <p>
              Cuidamos não apenas de animais domésticos, como gatos ou
              cachorros, mas também cuidamos de animais silvestres, como
              cavalos, papagaios e muitos outros.
            </p>
          </div>
        </div>
        <div className="blocoCarrossel">
          <img className="imagem" src="avatar.png" />
          <div className="textoCarrossel">
            <h1>Olá</h1>
            <p></p>
          </div>
        </div>
      </Carousel>
      <div className="sobreNos">
        <h1>Quem somos?</h1>
        <p>
             O instituto Esperança é uma instituição sem fins
          lucrativos que atua diretamente na causa animal com o objetivo
          principal de conscientizar a população quanto ao bem estar animal, maus
          tratos e a posse responsável. Além disso, desenvolvemos trabalhos voltados
          para a tríade da Saúde Única (ser humano, meio ambiente e animais).
             O Instituto conta com o apoio de uma casa de passagem, que de acordo
          com a disponibilidade de vaga acolhe animais em situação de
          vulnerabilidade onde recebem atendimento médico veterinário,
          tratamento terapêutico e ressocialização, para assim posteriormente estarem
          disponíveis para adoção responsável. Contamos também com colaboradores
          que disponibilizam LT(lar temporário) até que surja uma vaga na casa
          de passagem, e o projeto Abrigo Comunitário, onde damos assistências
          para pessoas que decidiram zelar por algum animalzinho na
          comunidade em que vivem.
        </p>
      </div>
    </div>
  );
}
