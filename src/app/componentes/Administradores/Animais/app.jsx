import styles from "./animais.module.css";
import HeaderAdms from "../HeaderAdms/app";
import BotaoPagInicial from "../BotaoPagInicial/app";
import Accordion from "react-bootstrap/Accordion";
import Select from "react-select";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function FichasDeAnimais() {
  const [animaisCompleto, setAnimaisCompleto] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");

  const [filtros, setFiltros] = useState({
    tipo: [],
    idade: [],
    sexo: [],
    statusVacinacao: [],
    statusCastracao: [],
    statusAdocao: [],
    statusMicrochipagem: [],
    statusVermifugacao: [],
  });

  const navigation = useNavigate();

  const registrarAnimal = async (event) => {
    event.preventDefault();
    try {
      const resposta = await fetch("http://localhost:3003/listar/animais", {
        method: "POST",
        headers: { "Content-type": "Application/json" },
        body: JSON.stringify({
          nome: nome,
          idade: idade,
          sexo: sexo,
        }),
      });
      if (resposta.ok) {
        navigation("/");
      }
    } catch {
      alert("Ocorreu um erro na aplicação!");
    }
  };

  useEffect(() => {
    const buscarAnimais = async () => {
      try {
        const resposta = await fetch("http://localhost:3003/listar/animais");
        const dados = await resposta.json();
        setAnimais(dados);
        setAnimaisCompleto(dados);
      } catch {
        alert("Ocorreu um erro no app!");
      }
    };
    buscarAnimais();
  }, []);

  const tipoAnimal = [
    { value: "cachorro", label: "Cachorro" },
    { value: "gato", label: "Gato" },
    { value: "ave", label: "Ave" },
  ];
  const idadeAnimais = [
    { value: "1", label: "1 ano" },
    { value: "2", label: "2 anos" },
    { value: "3", label: "3 anos" },
    { value: "4", label: "4 anos" },
    { value: "5", label: "5 anos" },
    { value: "6", label: "6 anos" },
    { value: "7", label: "7 anos" },
    { value: "8", label: "8 anos" },
    { value: "9", label: "9 anos" },
    { value: "10", label: "10 anos" },
    { value: "11", label: "11 anos" },
    { value: "12", label: "12 anos" },
    { value: "13", label: "13 anos" },
    { value: "14", label: "14 anos" },
    { value: "15", label: "15 anos" },
    { value: "16", label: "16 anos" },
    { value: "17", label: "17 anos" },
    { value: "18", label: "18 anos" },
    { value: "19", label: "19 anos" },
    { value: "20", label: "20 anos" },
  ];
  const sexoDoAnimal = [
    { value: "macho", label: "Macho" },
    { value: "femea", label: "Fêmea" },
  ];
  const StatusVacinacao = [
    { value: "vacinado", label: "Vacinado" },
    { value: "naoVacinado", label: "Não vacinado" },
  ];
  const StatusCastracao = [
    { value: "castrado", label: "Castrado" },
    { value: "naoCastrado", label: "Não castrado" },
  ];
  const StatusAdocao = [
    { value: "adotado", label: "Adotado" },
    { value: "naoAdotado", label: "Não adotado" },
    { value: "emObservacao", label: "Em observação" },
  ];
  const StatusMicrochipagem = [
    { value: "microchipado", label: "Microchipado" },
    { value: "semMicrochip", label: "Sem microchip" },
  ];
  const StatusVermifugacao = [
    { value: "estaComVerme", label: "Está com verme" },
    { value: "semVerme", label: "Sem Vermes" },
  ];

  const [image, setImage] = useState(null);

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };


  const aplicarFiltros = () => {
    let animaisFiltrados = animaisCompleto;
  
    // Normaliza os valores dos filtros e dos animais
    const filtrosNormalizados = {
      tipo: filtros.tipo.map((item) => item.toLowerCase()),
      idade: filtros.idade.map((item) => item.toLowerCase()),
      sexo: filtros.sexo.map((item) => item.toLowerCase()),
      statusVacinacao: filtros.statusVacinacao.map((item) => item.toLowerCase()),
      statusCastracao: filtros.statusCastracao.map((item) => item.toLowerCase()),
      statusAdocao: filtros.statusAdocao.map((item) => item.toLowerCase()),
      statusMicrochipagem: filtros.statusMicrochipagem.map((item) => item.toLowerCase()),
      statusVermifugacao: filtros.statusVermifugacao.map((item) => item.toLowerCase()),
    };
  
    animaisFiltrados = animaisFiltrados.filter((animal) => {
      return (
        (filtrosNormalizados.tipo.length === 0 || filtrosNormalizados.tipo.includes(animal.tipo.toLowerCase())) &&
        (filtrosNormalizados.idade.length === 0 || filtrosNormalizados.idade.includes(animal.idade.toString().toLowerCase())) &&
        (filtrosNormalizados.sexo.length === 0 || filtrosNormalizados.sexo.includes(animal.sexo.toLowerCase())) &&
        (filtrosNormalizados.statusVacinacao.length === 0 || filtrosNormalizados.statusVacinacao.includes(animal.statusVacinacao.toLowerCase())) &&
        (filtrosNormalizados.statusCastracao.length === 0 || filtrosNormalizados.statusCastracao.includes(animal.statusCastracao.toLowerCase())) &&
        (filtrosNormalizados.statusAdocao.length === 0 || filtrosNormalizados.statusAdocao.includes(animal.statusAdocao.toLowerCase())) &&
        (filtrosNormalizados.statusMicrochipagem.length === 0 || filtrosNormalizados.statusMicrochipagem.includes(animal.statusMicrochipagem.toLowerCase())) &&
        (filtrosNormalizados.statusVermifugacao.length === 0 || filtrosNormalizados.statusVermifugacao.includes(animal.statusVermifugacao.toLowerCase()))
      );
    });
  
    setAnimais(animaisFiltrados);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [filtros]);

  return (
    <div>
      <HeaderAdms />
      <BotaoPagInicial />
      <div className={styles.utilitarios}>
        <Accordion className={styles.acordeao} defaultActiveKey="0">
          {/* Acordeao de filtro */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <h1 className={styles.tituloAcordeao}>Filtros de pesquisa</h1>
            </Accordion.Header>
            <Accordion.Body className={styles.corpoAcordeao}>
              <div className={styles.containerFiltrosDeSelecao}>
                <Select
                  isMulti
                  options={tipoAnimal}
                  classNamePrefix="select"
                  placeholder="Tipo de animal"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      tipo: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />
                <Select
                  isMulti
                  options={idadeAnimais}
                  placeholder="idade"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      idade: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />
                <Select
                  isMulti
                  options={sexoDoAnimal}
                  placeholder="sexo"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      sexo: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />

                <Select
                  isMulti
                  options={StatusVacinacao}
                  placeholder="Status de vacinação"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      statusVacinacao: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />
                <Select
                  isMulti
                  options={StatusCastracao}
                  placeholder="Status de castração"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      statusCastracao: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />
                <Select
                  isMulti
                  options={StatusAdocao}
                  placeholder="Status de adoção"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      statusAdocao: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />
                <Select
                  isMulti
                  options={StatusMicrochipagem}
                  placeholder="Status de microchipagem"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      statusMicrochipagem: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />
                <Select
                  isMulti
                  options={StatusVermifugacao}
                  placeholder="Status de vermifugação"
                  className={styles.filtroSelecao}
                  onChange={(selectedOptions) =>
                    setFiltros((prev) => ({
                      ...prev,
                      statusVermifugacao: selectedOptions.map((opt) => opt.value),
                    }))
                  }
                />
              </div>

              <div className={styles.containerPesquisa}>
                <input
                  className={styles.barrinhaDePesquisa}
                  type="text"
                  name=""
                  placeholder="Pesquise pelo nome"
                ></input>
                <button className={styles.botaoPesquisar} href="#">
                  <img
                    className={styles.lupa}
                    src="/pagFichasDAnimais/lupa.png"
                  ></img>
                </button>
              </div>
            </Accordion.Body>
          </Accordion.Item>
          {/* Acordeao de filtro */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <h1 className={styles.tituloAcordeao}>Inserir ficha de animal</h1>
            </Accordion.Header>
            <Accordion.Body className={styles.corpoAcordeao2}>
              <form
                onSubmit={registrarAnimal}
                className={styles.formularioCadastro}
              >
                <div className={styles.inserirImagem}>
                  <img
                    className={styles.previaImagem}
                    src={image}
                    alt="Prévia da imagem"
                  />
                  <label
                    htmlFor="inputDeImagem"
                    className={styles.labelDeImagem}
                  >
                    Selecione uma imagem
                  </label>
                  <input
                    type="file"
                    id="inputDeImagem"
                    onChange={onImageChange}
                    className={styles.inputDeImagem}
                  />
                  <span className={styles.nomeArquivo}>
                    {image
                      ? "Arquivo selecionado"
                      : "Nenhum arquivo selecionado"}
                  </span>
                </div>
                <div className={styles.itemInserir}>
                  <h1 className={styles.tituloItemInserir}>
                    Dados de identificação
                  </h1>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDeIdentificacao}>Nome:</label>
                    <input
                      className={styles.inputDadosIdentificacao}
                      maxLength={30}
                      type="text"
                      placeholder="max. de 30 caracteres"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                    />
                  </div>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDeIdentificacao}>
                      Idade:
                    </label>
                    <input
                      className={styles.inputDadosIdentificacao}
                      min="0"
                      max="20"
                      type="number"
                      placeholder="insira uma idade"
                      value={idade}
                      onChange={(event) => setIdade(event.target.value)}
                    />
                  </div>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDeIdentificacao}>Sexo:</label>
                    <Select
                      options={sexoDoAnimal}
                      placeholder="selecione"
                      className={styles.selectInserirAnimal}
                      onChange={(event) =>
                        setSexo(
                          event.target.options[event.target.selectedIndex].text
                        )
                      }
                    />
                  </div>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDeIdentificacao}>Tipo:</label>
                    <Select
                      options={tipoAnimal}
                      classNamePrefix="select"
                      placeholder="selecione"
                      className={styles.selectInserirAnimal}
                    />
                  </div>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDeIdentificacao}>
                      Status de microchipagem:
                    </label>
                    <Select
                      options={StatusMicrochipagem}
                      classNamePrefix="select"
                      placeholder="selecione"
                      className={styles.selectInserirAnimal}
                    />
                  </div>
                </div>
                <div className={styles.itemInserir2}>
                  <h1 className={styles.tituloItemInserir}>Dados de saúde</h1>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDadosSaude}>
                      Status de vacinação:
                    </label>
                    <Select
                      options={StatusVacinacao}
                      placeholder="selecione"
                      className={styles.selectInserirAnimal}
                    />
                  </div>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDadosSaude}>
                      Status de castração:
                    </label>
                    <Select
                      options={StatusCastracao}
                      placeholder="selecione"
                      className={styles.selectInserirAnimal}
                    />
                  </div>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDadosSaude}>
                      Status de adoção:
                    </label>
                    <Select
                      options={StatusAdocao}
                      placeholder="selecione"
                      className={styles.selectInserirAnimal}
                    />
                  </div>
                  <div className={styles.alinharDadosDeInsercao}>
                    <label className={styles.labelDadosSaude}>
                      Status de vermifugação:
                    </label>
                    <Select
                      options={StatusVermifugacao}
                      placeholder="selecione"
                      className={styles.selectInserirAnimal}
                    />
                  </div>
                </div>
                <div className={styles.alinharBotaoInserir}>
                  <button className={styles.botaoInserir}>
                    Inserir animal
                  </button>
                </div>
              </form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <div className={styles.alinharPainel}>
        <div className={styles.fundoPainel}>
          {animais.map((animal) => (
            <div className={styles.cardAnimais} key={animal.id}>
              <div className={styles.divImagem}>
                <img
                  className={styles.imagemAnimais}
                  src="/pagFichasDAnimais/imagemTeste.jpg"
                  alt="Imagem inexistente ou não encontrada"
                />
              </div>
              <div className={styles.infoAnimais}>
                <h1 className={styles.nomeAnimal}>{animal.nome}</h1>
                <p className={styles.dadosAnimais}>idade: {animal.idade}</p>
                <p className={styles.dadosAnimais}>sexo: {animal.sexo}</p>
                <p className={styles.dadosAnimais}>
                  Status de castração: {animal.statusCastracao}
                </p>
                <Link
                  to={`/ver_mais/${animal.id}`}
                  className={styles.botaoVerMais}
                >
                  Ver mais
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
