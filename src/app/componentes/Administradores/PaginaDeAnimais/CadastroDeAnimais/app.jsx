import styles from "./cadastroDeAnimais.module.css";
import { useState } from "react";
import Select from "react-select";
import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";

export default function CadastroDeAnimais({ onAnimalCadastrado, onClose }) {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [tipo, setTipo] = useState("");
  const [statusMicrochipagem, setStatusMicrochipagem] = useState("");
  const [statusVacinacao, setStatusVacinacao] = useState("");
  const [statusCastracao, setStatusCastracao] = useState("");
  const [statusAdocao, setStatusAdocao] = useState("");
  const [statusVermifugacao, setStatusVermifugacao] = useState("");
  const [imagemEntrada, setImagemEntrada] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImagemEntrada(event.target.files[0]);
    }
  };

  const resetForm = () => {
    setNome("");
    setIdade("");
    setSexo("");
    setTipo("");
    setStatusMicrochipagem("");
    setStatusVacinacao("");
    setStatusCastracao("");
    setStatusAdocao("");
    setStatusVermifugacao("");
    setImagemEntrada(null);
  };

  const registrarAnimal = async (event) => {
    event.preventDefault();

    if (
      !nome ||
      !idade ||
      !sexo ||
      !tipo ||
      !statusMicrochipagem ||
      !statusVacinacao ||
      !statusCastracao ||
      !statusAdocao ||
      !statusVermifugacao ||
      !imagemEntrada
    ) {
      alert("Preencha todos os campos e selecione uma imagem.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();

    formData.append("nome", nome.trim());
    formData.append("idade", idade);
    formData.append("sexo", sexo);
    formData.append("tipo", tipo);
    formData.append("statusMicrochipagem", statusMicrochipagem);
    formData.append("statusVacinacao", statusVacinacao);
    formData.append("statusCastracao", statusCastracao);
    formData.append("statusAdocao", statusAdocao);
    formData.append("statusVermifugacao", statusVermifugacao);
    formData.append("imagemEntrada", imagemEntrada);

    try {
      const token = localStorage.getItem("token");
      const urlApi = import.meta.env.VITE_API_URL;

      if (!urlApi) {
        throw new Error("VITE_API_URL não foi definida.");
      }

      if (!token) {
        alert("Sua sessão não foi encontrada. Faça login novamente.");
        return;
      }

      const resposta = await fetch(`${urlApi}/animais`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const tipoConteudo = resposta.headers.get("content-type");

      let dadosResposta = null;

      if (tipoConteudo?.includes("application/json")) {
        dadosResposta = await resposta.json();
      } else {
        const textoResposta = await resposta.text();

        dadosResposta = {
          message:
            textoResposta || `O servidor retornou o status ${resposta.status}.`,
        };
      }

      if (!resposta.ok) {
        console.error("Erro ao cadastrar animal:", {
          status: resposta.status,
          statusText: resposta.statusText,
          dados: dadosResposta,
        });

        throw new Error(
          dadosResposta?.message ||
            dadosResposta?.mensagem ||
            `Erro HTTP ${resposta.status}`,
        );
      }

      if (onAnimalCadastrado) {
        await onAnimalCadastrado();
      }

      alert("Animal cadastrado com sucesso!");
      resetForm();

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);

      alert(error.message || "Ocorreu um erro na comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={registrarAnimal} className={styles.formularioCadastro}>
      <div className={styles.inserirImagem}>
        <img
          className={styles.previaImagem}
          src={imagemEntrada ? URL.createObjectURL(imagemEntrada) : ""}
          alt="Prévia da imagem"
        />
        <label htmlFor="inputDeImagem" className={styles.labelDeImagem}>
          Selecione uma imagem
        </label>
        <input
          type="file"
          id="inputDeImagem"
          onChange={onImageChange}
          className={styles.inputDeImagem}
          accept="image/*"
        />
        <span className={styles.nomeArquivo}>
          {imagemEntrada ? imagemEntrada.name : "Nenhum arquivo selecionado"}
        </span>
      </div>

      <div className={styles.itemInserir}>
        <h1 className={styles.tituloItemInserir}>Dados de identificação</h1>
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
          <label className={styles.labelDeIdentificacao}>Idade:</label>
          <input
            className={styles.inputDadosIdentificacao}
            min="1"
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
            options={opcoes.sexoDoAnimal}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) => setSexo(selectedOption.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDeIdentificacao}>Tipo:</label>
          <Select
            options={opcoes.tipoAnimal}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) => setTipo(selectedOption.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDeIdentificacao}>
            Status de microchipagem:
          </label>
          <Select
            options={opcoes.StatusMicrochipagem}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusMicrochipagem(selectedOption.value)
            }
          />
        </div>
      </div>
      <div className={styles.itemInserir}>
        <h1 className={styles.tituloItemInserir}>Dados de saúde</h1>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>Status de vacinação:</label>
          <Select
            options={opcoes.StatusVacinacao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusVacinacao(selectedOption.value)
            }
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>Status de castração:</label>
          <Select
            options={opcoes.StatusCastracao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusCastracao(selectedOption.value)
            }
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>Status de adoção:</label>
          <Select
            options={opcoes.StatusAdocao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) => setStatusAdocao(selectedOption.value)}
          />
        </div>
        <div className={styles.alinharDadosDeInsercao}>
          <label className={styles.labelDadosSaude}>
            Status de vermifugação:
          </label>
          <Select
            options={opcoes.StatusVermifugacao}
            placeholder="selecione"
            className={styles.selectInserirAnimal}
            onChange={(selectedOption) =>
              setStatusVermifugacao(selectedOption.value)
            }
          />
        </div>
      </div>

      <div className={styles.alinharBotaoInserir}>
        <button
          className={styles.botaoInserir}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Cadastrando..." : "Inserir animal"}
        </button>
      </div>
    </form>
  );
}
