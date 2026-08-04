import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select, { components } from "react-select";

import opcoes from "/src/app/componentes/Administradores/OpcoesDeSelecao/opcoes";
import styles from "./card3.module.css";

const LIMITE_POR_PAGINA = 14;

export default function Card3() {
  const inputArquivoRef = useRef(null);

  const [documentos, setDocumentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [modoExclusao, setModoExclusao] = useState(false);
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState(null);
  const [nomeConfirmacao, setNomeConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  const urlApi = import.meta.env.VITE_API_URL;
  const urlPublica = import.meta.env.BASE_URL;

  const imagemExcel = `${urlPublica}tipoDeArquivo/excel.png`;

  const imagemWord = `${urlPublica}tipoDeArquivo/word.png`;

  const imagemFiltro = `${urlPublica}card3/filtro.png`;

  const imagemAdicionar = `${urlPublica}adicionarOuRemover/adicionar_azulEsverdeado.png`;

  const imagemRemover = `${urlPublica}card3/lixeira.png`;

  const IndicadorFiltro = (props) => (
    <components.DropdownIndicator {...props}>
      <img src={imagemFiltro} alt="" className={styles.imagemFiltro} />
    </components.DropdownIndicator>
  );

  const requisicaoAutenticada = useCallback(
    async (endereco, configuracoes = {}) => {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Sua sessão não foi encontrada. Faça login novamente.");
      }

      const resposta = await fetch(endereco, {
        ...configuracoes,

        headers: {
          Authorization: `Bearer ${token}`,
          ...configuracoes.headers,
        },
      });

      const tipoConteudo = resposta.headers.get("content-type");

      let dados;

      if (tipoConteudo?.includes("application/json")) {
        dados = await resposta.json();
      } else {
        const texto = await resposta.text();

        dados = {
          message: texto || `Erro HTTP ${resposta.status}`,
        };
      }

      if (resposta.status === 401 || resposta.status === 403) {
        const erro = new Error(
          dados?.mensagem ||
            dados?.message ||
            "Você não tem permissão para acessar os documentos.",
        );

        erro.status = resposta.status;
        throw erro;
      }

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.mensagem ||
            "Não foi possível completar a operação.",
        );
      }

      return dados;
    },
    [],
  );

  /*
   * Busca os documentos cadastrados no servidor.
   */
  const carregarDocumentos = useCallback(
    async (pagina = 1) => {
      if (!urlApi) {
        setMensagem("A variável VITE_API_URL não foi configurada.");

        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setMensagem("");
        setAcessoNegado(false);

        const dados = await requisicaoAutenticada(
          `${urlApi}/documentos?page=${pagina}&limit=${LIMITE_POR_PAGINA}`,
        );

        const documentosRecebidos = Array.isArray(dados?.data)
          ? dados.data
          : [];

        const paginasRecebidas = Number(dados?.paginacao?.totalPaginas) || 1;

        const paginaRecebida = Number(dados?.paginacao?.paginaAtual) || pagina;

        setDocumentos(documentosRecebidos);
        setPaginaAtual(paginaRecebida);
        setTotalPaginas(Math.max(paginasRecebidas, 1));
      } catch (error) {
        console.error("Erro ao carregar documentos:", error);

        setDocumentos([]);

        if (error.status === 401 || error.status === 403) {
          setAcessoNegado(true);
          setMensagem(error.message);
        } else {
          setAcessoNegado(false);
          setMensagem(error.message);
        }
      } finally {
        setCarregando(false);
      }
    },
    [requisicaoAutenticada, urlApi],
  );

  useEffect(() => {
    carregarDocumentos(1);
  }, [carregarDocumentos]);

  /*
   * Converte as extensões cadastradas no banco para
   * os valores utilizados pelo filtro.
   */
  const obterTipoDocumento = (documento) => {
    const tipo = documento.tipoDeArquivo?.toLowerCase() || "";

    if (tipo === ".xls" || tipo === ".xlsx") {
      return "excel";
    }

    if (tipo === ".doc" || tipo === ".docx") {
      return "word";
    }

    return "desconhecido";
  };

  /*
   * Filtra os documentos da página atual pelo nome
   * e pelo tipo selecionado.
   */
  const documentosFiltrados = useMemo(() => {
    const textoPesquisado = pesquisa.trim().toLowerCase();

    return documentos.filter((documento) => {
      const nomeDocumento = documento.nome?.toLowerCase() || "";

      const correspondeAoNome = nomeDocumento.includes(textoPesquisado);

      const tipoDocumento = obterTipoDocumento(documento);

      const correspondeAoFiltro =
        filtro === "todos" || tipoDocumento === filtro;

      return correspondeAoNome && correspondeAoFiltro;
    });
  }, [documentos, filtro, pesquisa]);

  /*
   * Abre o seletor nativo de arquivos.
   */
  const selecionarArquivo = () => {
    if (!enviando) {
      inputArquivoRef.current?.click();
    }
  };

  /*
   * Envia o documento selecionado para o backend.
   */
  const enviarArquivo = async (event) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    const posicaoPonto = arquivo.name.lastIndexOf(".");

    const extensao =
      posicaoPonto >= 0 ? arquivo.name.slice(posicaoPonto).toLowerCase() : "";

    const extensoesPermitidas = [".doc", ".docx", ".xls", ".xlsx"];

    if (!extensoesPermitidas.includes(extensao)) {
      setMensagem(
        "Selecione um arquivo Word (.doc ou .docx) ou Excel (.xls ou .xlsx).",
      );

      event.target.value = "";
      return;
    }

    if (!urlApi) {
      setMensagem("A variável VITE_API_URL não foi configurada.");

      event.target.value = "";
      return;
    }

    try {
      setEnviando(true);
      setMensagem("");

      const formulario = new FormData();

      formulario.append("arquivo", arquivo);

      await requisicaoAutenticada(`${urlApi}/documentos`, {
        method: "POST",
        body: formulario,
      });

      setPesquisa("");
      setFiltro("todos");

      await carregarDocumentos(1);

      setMensagem("Arquivo enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar documento:", error);

      setMensagem(error.message);
    } finally {
      setEnviando(false);
      event.target.value = "";
    }
  };

  /*
   * Abre o arquivo armazenado na pasta uploads
   * do servidor.
   */
  const abrirDocumento = (documento) => {
    const caminho = documento.caminhoArquivo;

    if (!caminho) {
      setMensagem("O caminho deste arquivo não foi encontrado.");

      return;
    }

    const enderecoArquivo = `${urlApi}/uploads/${encodeURIComponent(caminho)}`;

    window.open(enderecoArquivo, "_blank", "noopener,noreferrer");
  };

  const alternarModoExclusao = () => {
    if (excluindo) return;

    setModoExclusao((modoAtual) => !modoAtual);
    setDocumentoParaExcluir(null);
    setNomeConfirmacao("");
    setMensagem("");
  };

  const selecionarDocumento = (documento) => {
    if (modoExclusao) {
      setDocumentoParaExcluir(documento);
      setNomeConfirmacao("");
      return;
    }

    abrirDocumento(documento);
  };

  const fecharConfirmacaoExclusao = () => {
    if (excluindo) return;

    setDocumentoParaExcluir(null);
    setNomeConfirmacao("");
  };

  const excluirDocumento = async (event) => {
    event.preventDefault();

    if (!documentoParaExcluir || nomeConfirmacao !== documentoParaExcluir.nome) {
      return;
    }

    const idDocumento = documentoParaExcluir.id || documentoParaExcluir._id;

    if (!idDocumento) {
      setMensagem("Não foi possível identificar o documento selecionado.");
      return;
    }

    try {
      setExcluindo(true);
      setMensagem("");

      await requisicaoAutenticada(`${urlApi}/documentos/${idDocumento}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeDocumento: nomeConfirmacao,
        }),
      });

      const paginaARecarregar =
        documentos.length === 1 && paginaAtual > 1
          ? paginaAtual - 1
          : paginaAtual;

      setDocumentoParaExcluir(null);
      setNomeConfirmacao("");
      setModoExclusao(false);

      await carregarDocumentos(paginaARecarregar);
      setMensagem("Documento excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      setMensagem(error.message);
    } finally {
      setExcluindo(false);
    }
  };

  const voltarPagina = () => {
    if (paginaAtual > 1 && !carregando) {
      setPesquisa("");
      carregarDocumentos(paginaAtual - 1);
    }
  };

  const avancarPagina = () => {
    if (paginaAtual < totalPaginas && !carregando) {
      setPesquisa("");
      carregarDocumentos(paginaAtual + 1);
    }
  };

  const opcaoFiltroSelecionada =
    opcoes.tipoArquivo.find((opcao) => opcao.value === filtro) ||
    opcoes.tipoArquivo[0];

  return (
    <div className={styles.blocoArquivos}>
      <div className={styles.areaPesquisa}>
        <input
          type="search"
          className={styles.inputPesquisa}
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
          placeholder="Pesquisar arquivo..."
          aria-label="Pesquisar arquivo pelo nome"
        />

        <Select
          options={opcoes.tipoArquivo}
          value={opcaoFiltroSelecionada}
          onChange={(opcaoSelecionada) =>
            setFiltro(opcaoSelecionada?.value || "todos")
          }
          components={{
            DropdownIndicator: IndicadorFiltro,
            IndicatorSeparator: null,
          }}
          className={styles.selectTipoArquivo}
          classNamePrefix="filtroArquivo"
          placeholder="Filtrar"
          aria-label="Filtrar documentos por tipo"
          isSearchable={false}
          isClearable={false}
          menuPosition="fixed"
          styles={{
            menu: (estiloBase) => ({
              ...estiloBase,
              zIndex: 9999,
            }),
          }}
        />

        <button
          type="button"
          className={`${styles.botaoAdicionar} ${
            enviando ? styles.itemDesativado : ""
          }`}
          onClick={selecionarArquivo}
          disabled={enviando}
          title="Adicionar arquivo Word ou Excel"
          aria-label="Adicionar arquivo Word ou Excel"
        >
          <img src={imagemAdicionar} alt="" />
        </button>

        <input
          ref={inputArquivoRef}
          type="file"
          className={styles.inputArquivo}
          accept=".doc,.docx,.xls,.xlsx"
          onChange={enviarArquivo}
        />

        <button
          type="button"
          className={`${styles.botaoRemover} ${
            modoExclusao ? styles.botaoRemoverAtivo : ""
          }`}
          onClick={alternarModoExclusao}
          disabled={excluindo}
          title={modoExclusao ? "Cancelar exclusão" : "Excluir documento"}
          aria-label={
            modoExclusao ? "Cancelar modo de exclusão" : "Excluir documento"
          }
          aria-pressed={modoExclusao}
        >
          <img src={imagemRemover} alt="" />
        </button>
      </div>

      {mensagem && !acessoNegado && (
        <p className={styles.mensagemOperacao} role="status">
          {mensagem}
        </p>
      )}

      {carregando ? (
        <div className={styles.estadoLista}>
          <p>Carregando arquivos...</p>
        </div>
      ) : acessoNegado ? (
        <div className={styles.acessoNegado}>
          <h3>Acesso negado</h3>

          <p>
            {(mensagem && !acessoNegado) ||
              "Você não tem permissão para visualizar os documentos."}
          </p>
        </div>
      ) : documentosFiltrados.length > 0 ? (
        <div className={styles.listaDocumentos}>
          {documentosFiltrados.map((documento) => {
            const tipo = obterTipoDocumento(documento);

            return (
              <button
                type="button"
                key={documento.id || documento._id || documento.caminhoArquivo}
                className={`${styles.itemDocumento} ${
                  modoExclusao
                    ? styles.documentoParaExclusao
                    : tipo === "excel"
                    ? styles.documentoExcel
                    : styles.documentoWord
                }`}
                onClick={() => selecionarDocumento(documento)}
                title={
                  modoExclusao
                    ? `Excluir ${documento.nome}`
                    : `Abrir ${documento.nome}`
                }
              >
                <img
                  src={
                    modoExclusao
                      ? imagemRemover
                      : tipo === "excel"
                        ? imagemExcel
                        : imagemWord
                  }
                  alt={
                    modoExclusao
                      ? "Excluir documento"
                      : tipo === "excel"
                        ? "Arquivo do Excel"
                        : "Arquivo do Word"
                  }
                />

                <span>{documento.nome}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.estadoLista}>
          <p>Nenhum arquivo encontrado.</p>
        </div>
      )}
      {!acessoNegado && (
        <div className={styles.paginacao}>
          <button
            type="button"
            onClick={voltarPagina}
            disabled={paginaAtual <= 1 || carregando}
          >
            anterior
          </button>

          <span>
            {paginaAtual} de {totalPaginas}
          </span>

          <button
            type="button"
            onClick={avancarPagina}
            disabled={paginaAtual >= totalPaginas || carregando}
          >
            próximo
          </button>
        </div>
      )}

      {documentoParaExcluir && (
        <div
          className={styles.overlayExclusao}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloExclusaoDocumento"
        >
          <form className={styles.cardExclusao} onSubmit={excluirDocumento}>
            <img src={imagemRemover} alt="" />
            <h2 id="tituloExclusaoDocumento">
              Você deseja excluir este documento?
            </h2>
            <strong>{documentoParaExcluir.nome}</strong>
            <p>
              Para confirmar, digite abaixo o nome completo do documento,
              incluindo sua extensão.
            </p>
            <input
              type="text"
              value={nomeConfirmacao}
              onChange={(event) => setNomeConfirmacao(event.target.value)}
              placeholder={documentoParaExcluir.nome}
              aria-label="Nome completo do documento"
              autoComplete="off"
              disabled={excluindo}
              autoFocus
              required
            />
            <div className={styles.acoesExclusao}>
              <button
                type="button"
                className={styles.botaoCancelarExclusao}
                onClick={fecharConfirmacaoExclusao}
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.botaoConfirmarExclusao}
                disabled={
                  excluindo || nomeConfirmacao !== documentoParaExcluir.nome
                }
              >
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}