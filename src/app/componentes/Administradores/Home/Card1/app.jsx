import { useEffect, useRef, useState } from "react";
import styles from "./card1.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Lembrete = ({
  data,
  descricao,
  corData,
  onRemover,
  isNovo = false,
  usuarioAdministrador = false,
}) => {
  return (
    <div
      className={`${styles.lembreteItem} ${
        isNovo ? styles.lembreteNovoAdicionado : styles.lembreteCarregado
      }`}
    >
      <span className={styles.lembreteData} style={{ color: corData }}>
        {data + ": "}
        <span className={styles.lembreteDescricao}>{descricao}</span>
      </span>

      {usuarioAdministrador && (
        <button
          className={styles.lembreteLixeira}
          onClick={onRemover}
          type="button"
          title="Remover aviso"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default function Card1({ onQuantidadeAvisosChange }) {
  const [lembretes, setLembretes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [ultimoLembreteId, setUltimoLembreteId] = useState(null);
  const [usuarioAdministrador, setUsuarioAdministrador] = useState(false);

  const [novoLembrete, setNovoLembrete] = useState({
    dataInicio: "",
    dataFim: "",
    descricao: "",
    corData: "#0095ff",
    ehPeriodo: false,
  });

  const containerRef = useRef(null);

  useEffect(() => {
    carregarAvisos();
  }, []);

  useEffect(() => {
    const verificarPermissao = () => {
      try {
        const dadosUsuario = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        if (!dadosUsuario || !token) {
          setUsuarioAdministrador(false);
          return;
        }

        const usuario = JSON.parse(dadosUsuario);

        const autorizado = usuario.nivelDeAcesso === "administrador";

        setUsuarioAdministrador(autorizado);
      } catch (error) {
        console.error("Erro ao verificar permissão do usuário:", error);
        setUsuarioAdministrador(false);
      }
    };

    verificarPermissao();

    const intervalo = setInterval(verificarPermissao, 5000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (onQuantidadeAvisosChange) {
      onQuantidadeAvisosChange(lembretes.length);
    }
  }, [lembretes.length, onQuantidadeAvisosChange]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("modal-aberto");
    };
  }, []);

  const carregarAvisos = async () => {
    try {
      setLoading(true);
      setErro(null);

      const response = await fetch(`${API_BASE_URL}/avisos`);

      if (!response.ok) {
        const errorData = await response.json();
        setErro(errorData.erro || "Erro ao carregar avisos");
        console.error("Erro ao carregar avisos:", errorData);
        return;
      }

      const avisos = await response.json();

      setLembretes(avisos);
      setUltimoLembreteId(null);
    } catch (error) {
      setErro("Erro de conexão com o servidor");
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirFormulario = () => {
    if (!usuarioAdministrador) {
      setErro("Apenas administradores podem adicionar avisos.");
      return;
    }

    setMostrarFormulario(true);
    setErro(null);
    document.body.classList.add("modal-aberto");
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);

    setNovoLembrete({
      dataInicio: "",
      dataFim: "",
      descricao: "",
      corData: "#0095ff",
      ehPeriodo: false,
    });

    setErro(null);
    document.body.classList.remove("modal-aberto");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNovoLembrete((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const adicionarLembrete = async () => {
    if (!usuarioAdministrador) {
      setErro("Apenas administradores podem adicionar avisos.");
      return;
    }

    if (!novoLembrete.descricao || !novoLembrete.dataInicio) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    if (novoLembrete.ehPeriodo && !novoLembrete.dataFim) {
      setErro("Para períodos, a data final é obrigatória");
      return;
    }

    if (novoLembrete.ehPeriodo && novoLembrete.dataFim) {
      const dataInicial = new Date(novoLembrete.dataInicio);
      const dataFinal = new Date(novoLembrete.dataFim);

      if (dataFinal < dataInicial) {
        setErro("A data final deve ser posterior à data inicial");
        return;
      }
    }

    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setErro("Você precisa estar logado como administrador.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/avisos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao: novoLembrete.descricao,
          dataInicio: novoLembrete.dataInicio,
          dataFim: novoLembrete.ehPeriodo ? novoLembrete.dataFim : null,
          ehPeriodo: novoLembrete.ehPeriodo,
          corData: novoLembrete.corData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErro(errorData.erro || "Erro ao adicionar aviso");
        return;
      }

      const novoAviso = await response.json();

      setLembretes((prev) => [...prev, novoAviso]);
      setUltimoLembreteId(novoAviso.id);

      setTimeout(() => {
        setUltimoLembreteId(null);
      }, 1000);

      fecharFormulario();
    } catch (error) {
      setErro("Erro de conexão com o servidor");
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  const removerLembrete = async (id) => {
    if (!usuarioAdministrador) {
      setErro("Apenas administradores podem remover avisos.");
      return;
    }

    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setErro("Você precisa estar logado como administrador.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/avisos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErro(errorData.erro || "Erro ao remover aviso");
        console.error("Erro ao remover aviso:", errorData);
        return;
      }

      setLembretes((prev) => prev.filter((lembrete) => lembrete.id !== id));
    } catch (error) {
      setErro("Erro de conexão com o servidor");
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  const exibirErro = () => {
    if (!erro) return null;

    return (
      <div
        className="alert alert-danger alert-dismissible fade show position-fixed"
        role="alert"
        style={{
          top: "20px",
          right: "20px",
          zIndex: 1050,
          maxWidth: "400px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {erro}

        <button
          type="button"
          className="btn-close"
          onClick={() => setErro(null)}
          aria-label="Close"
        ></button>
      </div>
    );
  };

  return (
    <>
      {exibirErro()}

      <div className={styles.containerWrapper}>
        <div
          className={`${styles.containerLembretes} ${
            lembretes.length === 0 ? styles.containerLembretesVazio : ""
          }`}
          ref={containerRef}
        >
          {loading && lembretes.length === 0 && (
            <p className={styles.mensagemCarregando}>Carregando avisos...</p>
          )}

          {!loading && lembretes.length === 0 && (
            <div className={styles.mensagemVazia}>
              <img
                src={`${import.meta.env.BASE_URL}card1/homemConfuso.png`}
                alt="Ícone Aviso"
              />
              <p>Sem avisos por enquanto...</p>
            </div>
          )}

          {lembretes.map((lembrete) => (
            <Lembrete
              key={lembrete.id}
              data={lembrete.data}
              descricao={lembrete.descricao}
              corData={lembrete.corData}
              onRemover={() => removerLembrete(lembrete.id)}
              isNovo={lembrete.id === ultimoLembreteId}
              usuarioAdministrador={usuarioAdministrador}
            />
          ))}
        </div>

        {usuarioAdministrador && (
          <button
            className={styles.botaoAdicionar}
            onClick={abrirFormulario}
            type="button"
            disabled={loading}
            title="Adicionar novo aviso"
          ></button>
        )}
      </div>

      {mostrarFormulario && usuarioAdministrador && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h1>Novo Lembrete</h1>

            <div className={styles.alinharLadoALado}>
              <input
                type="checkbox"
                name="ehPeriodo"
                checked={novoLembrete.ehPeriodo}
                onChange={handleChange}
                className={styles.inputPeriodo}
              />

              <label className={styles.labelNaFrente}>
                Período em vez de data única
              </label>
            </div>

            <div className={styles.alinharAcima}>
              <label className={styles.labelInserirAviso}>
                Data {novoLembrete.ehPeriodo ? "Inicial" : ""}
              </label>

              <input
                type="date"
                name="dataInicio"
                value={novoLembrete.dataInicio}
                onChange={handleChange}
                required
                className={styles.inputInserirAviso}
              />
            </div>

            {novoLembrete.ehPeriodo && (
              <div className={styles.alinharAcima}>
                <label className={styles.labelInserirAviso}>Data Final</label>

                <input
                  type="date"
                  name="dataFim"
                  value={novoLembrete.dataFim}
                  onChange={handleChange}
                  required
                  className={styles.inputInserirAviso}
                />
              </div>
            )}

            <div className={styles.alinharAcima}>
              <label className={styles.labelInserirAviso}>Descrição</label>

              <textarea
                name="descricao"
                value={novoLembrete.descricao}
                onChange={handleChange}
                required
                className={`${styles.inputInserirAviso} ${styles.textareaInserirAviso}`}
              />
            </div>

            <div className={styles.alinharLadoALado}>
              <input
                type="color"
                name="corData"
                value={novoLembrete.corData}
                onChange={handleChange}
                className={styles.inputDeCor}
              />

              <label className={styles.labelNaFrente}>Cor da Data</label>
            </div>

            <div className={styles.botoesForm}>
              <button
                type="button"
                onClick={fecharFormulario}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={adicionarLembrete}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}