import { useEffect, useState } from "react";
import styles from "./card3.module.css";
import axios from "axios";

export default function Card3() {
  const [documentos, setDocumentos] = useState([]);
  const [arquivo, setArquivo] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [maxDocumentosPorPag] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const buscarDocumentos = async () => {
    try {
      setCarregando(true);

      const token = localStorage.getItem("token");

      const resposta = await axios.get(
        `http://localhost:3001/documentos?page=${paginaAtual}&limit=${maxDocumentosPorPag}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocumentos(resposta.data.data);
      setTotalPaginas(resposta.data.paginacao.totalPaginas);
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      setMensagem("Erro ao buscar documentos.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDocumentos();
  }, [paginaAtual]);

  const selecionarArquivo = (event) => {
    const arquivoSelecionado = event.target.files[0];

    if (!arquivoSelecionado) return;

    const tiposPermitidos = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!tiposPermitidos.includes(arquivoSelecionado.type)) {
      setMensagem("Envie apenas arquivos Word ou Excel.");
      setArquivo(null);
      return;
    }

    setMensagem("");
    setArquivo(arquivoSelecionado);
  };

  const enviarArquivo = async () => {
    try {
      if (!arquivo) {
        setMensagem("Selecione um arquivo primeiro.");
        return;
      }

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("arquivo", arquivo);

      await axios.post("http://localhost:3001/documentos", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMensagem("Arquivo enviado com sucesso.");
      setArquivo(null);
      setPaginaAtual(1);
      buscarDocumentos();
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setMensagem(
        error.response?.data?.message || "Erro ao enviar arquivo."
      );
    }
  };

  const deletarDocumento = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3001/documentos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMensagem("Documento removido com sucesso.");
      buscarDocumentos();
    } catch (error) {
      console.error("Erro ao deletar documento:", error);
      setMensagem("Erro ao deletar documento.");
    }
  };

  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const irParaProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  return (
    <div className={styles.blocoArquivos}>
      <h3>Documentos</h3>

      <div className={styles.areaUpload}>
        <input
          type="file"
          accept=".doc,.docx,.xls,.xlsx"
          onChange={selecionarArquivo}
        />

        <button type="button" onClick={enviarArquivo}>
          Enviar arquivo
        </button>
      </div>

      {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

      {carregando ? (
        <p>Carregando documentos...</p>
      ) : (
        <div className={styles.listaDocumentos}>
          {documentos.length === 0 ? (
            <p>Nenhum documento cadastrado.</p>
          ) : (
            documentos.map((documento) => (
              <div key={documento.id} className={styles.itemDocumento}>
                <div>
                  <strong>{documento.nome}</strong>
                  <span>{documento.tipoDeArquivo}</span>
                </div>

                <button
                  type="button"
                  onClick={() => deletarDocumento(documento.id)}
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className={styles.paginacao}>
        <button
          type="button"
          onClick={irParaPaginaAnterior}
          disabled={paginaAtual === 1}
        >
          Anterior
        </button>

        <span>
          Página {paginaAtual} de {totalPaginas}
        </span>

        <button
          type="button"
          onClick={irParaProximaPagina}
          disabled={paginaAtual === totalPaginas}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}