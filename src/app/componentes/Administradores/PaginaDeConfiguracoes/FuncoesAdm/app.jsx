import { useState, useEffect } from "react";
import Select from "react-select";
import styles from "./funcoesAdm.module.css";

export default function FuncoesDeAdministrador() {
  // ==========================================================================
  // ESTADOS GERAIS
  // ==========================================================================

  const [usuarios, setUsuarios] = useState([]);

  const [carregando, setCarregando] =
    useState(false);

  // ==========================================================================
  // ESTADOS DOS FORMULÁRIOS
  // ==========================================================================

  const [
    usuarioSelecionadoExcluir,
    setUsuarioSelecionadoExcluir,
  ] = useState(null);

  const [
    usuarioSelecionadoAlterar,
    setUsuarioSelecionadoAlterar,
  ] = useState(null);

  const [
    novoNivelAcesso,
    setNovoNivelAcesso,
  ] = useState(null);

  const [
    emailConvite,
    setEmailConvite,
  ] = useState("");

  const [
    nivelAcessoConvite,
    setNivelAcessoConvite,
  ] = useState(null);

  // ==========================================================================
  // REDES SOCIAIS
  // ==========================================================================

  const [
    credenciaisInstagram,
    setCredenciaisInstagram,
  ] = useState({
    usuario: "",
    senha: "",
  });

  const [
    credenciaisFacebook,
    setCredenciaisFacebook,
  ] = useState({
    email: "",
    senha: "",
  });

  // ==========================================================================
  // OPÇÕES DE NÍVEL DE ACESSO
  // ==========================================================================

  const nivelDeAcesso = [
    {
      value: "administrador",
      label: "Administrador",
    },

    {
      value: "subAdministrador",
      label: "Sub-administrador",
    },

    {
      value: "contribuinte",
      label: "Contribuinte",
    },
  ];

  // ==========================================================================
  // OBTER TOKEN
  // ==========================================================================

  const obterToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  // ==========================================================================
  // CARREGAR USUÁRIOS
  // ==========================================================================

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);

      const token = obterToken();

      if (!token) {
        alert(
          "Sua sessão expirou. Faça login novamente.",
        );

        return;
      }

      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios`,

        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok || dados.erro) {
        alert(
          `Erro ao carregar usuários: ${
            dados.mensagem ||
            "Erro desconhecido"
          }`,
        );

        return;
      }

      const usuarioLogadoSalvo =
        localStorage.getItem("usuario");

      let usuarioLogado = null;

      try {
        usuarioLogado =
          usuarioLogadoSalvo
            ? JSON.parse(usuarioLogadoSalvo)
            : null;
      } catch (error) {
        console.error(
          "Erro ao ler usuário logado:",
          error,
        );
      }

      const usuariosFormatados =
        dados.usuarios
          .filter((usuario) => {
            /*
              Não mostramos usuários comuns nesta tela,
              mantendo o comportamento original.
            */

            const ehUsuarioComum =
              usuario.nivelDeAcesso ===
              "usuario";

            /*
              Não mostramos o próprio usuário logado
              nos selects de exclusão e alteração.
            */

            const ehProprioUsuario =
              usuarioLogado &&
              (
                Number(usuario.id) ===
                  Number(usuarioLogado.id) ||

                usuario.email
                  ?.toLowerCase()
                  .trim() ===
                  usuarioLogado.email
                    ?.toLowerCase()
                    .trim()
              );

            /*
              O frontend não conhece o e-mail
              do administrador principal.

              O backend apenas informa:
              protegido: true
            */

            const ehProtegido =
              usuario.protegido === true;

            return (
              !ehUsuarioComum &&
              !ehProprioUsuario &&
              !ehProtegido
            );
          })

          .map((usuario) => ({
            value: usuario.id,

            label:
              `${usuario.nome} (${usuario.email})`,

            nivelDeAcesso:
              usuario.nivelDeAcesso,

            ativo: usuario.ativo,
          }));

      setUsuarios(usuariosFormatados);
    } catch (error) {
      console.error(
        "Erro ao carregar usuários:",
        error,
      );

      alert(
        "Erro de conexão ao carregar usuários.",
      );
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================================================
  // CARREGAR AO MONTAR O COMPONENTE
  // ==========================================================================

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // ==========================================================================
  // EXCLUIR USUÁRIO
  // ==========================================================================

  const handleExcluirUsuario = async () => {
    if (!usuarioSelecionadoExcluir) {
      alert(
        "Por favor, selecione um usuário para excluir.",
      );

      return;
    }

    const usuarioParaExcluir =
      usuarios.find(
        (usuario) =>
          usuario.value ===
          usuarioSelecionadoExcluir.value,
      );

    if (!usuarioParaExcluir) {
      alert(
        "Não foi possível encontrar o usuário selecionado.",
      );

      return;
    }

    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o usuário "${usuarioParaExcluir.label}"?\n\nEsta ação é irreversível!`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setCarregando(true);

      const token = obterToken();

      if (!token) {
        alert(
          "Sua sessão expirou. Faça login novamente.",
        );

        return;
      }

      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/${usuarioSelecionadoExcluir.value}`,

        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        alert(
          dados.mensagem ||
            "Usuário excluído com sucesso!",
        );

        setUsuarioSelecionadoExcluir(null);

        await carregarUsuarios();

        return;
      }

      alert(
        `Erro ao excluir usuário: ${
          dados.mensagem ||
          "Erro desconhecido"
        }`,
      );
    } catch (error) {
      console.error(
        "Erro ao excluir usuário:",
        error,
      );

      alert(
        "Erro de conexão ao excluir usuário.",
      );
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================================================
  // ALTERAR NÍVEL DE ACESSO
  // ==========================================================================

  const handleAlterarNivelAcesso =
    async () => {
      if (
        !usuarioSelecionadoAlterar ||
        !novoNivelAcesso
      ) {
        alert(
          "Por favor, selecione um usuário e o novo nível de acesso.",
        );

        return;
      }

      const usuarioParaAlterar =
        usuarios.find(
          (usuario) =>
            usuario.value ===
            usuarioSelecionadoAlterar.value,
        );

      if (!usuarioParaAlterar) {
        alert(
          "Não foi possível encontrar o usuário selecionado.",
        );

        return;
      }

      if (
        usuarioParaAlterar.nivelDeAcesso ===
        novoNivelAcesso.value
      ) {
        alert(
          "O usuário já possui este nível de acesso.",
        );

        return;
      }

      const confirmou = window.confirm(
        `Alterar o nível de acesso de "${usuarioParaAlterar.label}" para "${novoNivelAcesso.label}"?`,
      );

      if (!confirmou) {
        return;
      }

      try {
        setCarregando(true);

        const token = obterToken();

        if (!token) {
          alert(
            "Sua sessão expirou. Faça login novamente.",
          );

          return;
        }

        const resposta = await fetch(
          `${import.meta.env.VITE_API_URL}/usuarios/${usuarioSelecionadoAlterar.value}`,

          {
            method: "PUT",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              nivelDeAcesso:
                novoNivelAcesso.value,
            }),
          },
        );

        const dados = await resposta.json();

        if (resposta.ok && !dados.erro) {
          alert(
            "Nível de acesso alterado com sucesso!",
          );

          setUsuarioSelecionadoAlterar(null);
          setNovoNivelAcesso(null);

          await carregarUsuarios();

          return;
        }

        alert(
          `Erro ao alterar nível de acesso: ${
            dados.mensagem ||
            "Erro desconhecido"
          }`,
        );
      } catch (error) {
        console.error(
          "Erro ao alterar nível de acesso:",
          error,
        );

        alert(
          "Erro de conexão ao alterar nível de acesso.",
        );
      } finally {
        setCarregando(false);
      }
    };

  // ==========================================================================
  // CONVIDAR NOVO MEMBRO
  // ==========================================================================

  const handleConvidarMembro = async () => {
    if (
      !emailConvite ||
      !nivelAcessoConvite
    ) {
      alert(
        "Por favor, preencha o e-mail e selecione o nível de acesso.",
      );

      return;
    }

    const emailNormalizado =
      emailConvite
        .toLowerCase()
        .trim();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(emailNormalizado)
    ) {
      alert(
        "Por favor, insira um e-mail válido.",
      );

      return;
    }

    const confirmou = window.confirm(
      `Enviar um convite para "${emailNormalizado}" com o nível de acesso "${nivelAcessoConvite.label}"?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setCarregando(true);

      const token = obterToken();

      if (!token) {
        alert(
          "Sua sessão expirou. Faça login novamente.",
        );

        return;
      }

      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/convidar`,

        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: emailNormalizado,

            nivelDeAcesso:
              nivelAcessoConvite.value,
          }),
        },
      );

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        alert(
          dados.mensagem ||
            "Convite enviado com sucesso!",
        );

        setEmailConvite("");
        setNivelAcessoConvite(null);

        return;
      }

      alert(
        `Erro ao enviar convite: ${
          dados.mensagem ||
          "Erro desconhecido"
        }`,
      );
    } catch (error) {
      console.error(
        "Erro ao enviar convite:",
        error,
      );

      alert(
        "Erro de conexão ao enviar convite.",
      );
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================================================
  // REDES SOCIAIS
  // ==========================================================================

  const handleInserirInstagram = () => {
    alert(
      "Funcionalidade de integração com Instagram ainda não implementada.",
    );
  };

  const handleInserirFacebook = () => {
    alert(
      "Funcionalidade de integração com Facebook ainda não implementada.",
    );
  };

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================

  return (
    <div className={styles.conteudoFuncoesAdm}>

      {/* ================================================================
          EXCLUIR USUÁRIO
      ================================================================= */}

      <div className={styles.blocoFuncao}>

        <div className={styles.funcao}>

          <h1 className={styles.tituloConfig}>
            Excluir usuário:
          </h1>

          <Select
            options={usuarios}
            value={usuarioSelecionadoExcluir}

            onChange={
              setUsuarioSelecionadoExcluir
            }

            placeholder={
              carregando
                ? "Carregando usuários..."
                : "Digite ou selecione"
            }

            className={styles.selectConfig}

            isDisabled={carregando}

            isClearable
          />

        </div>

        <div className={styles.divBotaoFuncao}>

          <button
            className={
              `${styles.botaoPadraoConfig} ` +
              `${styles.botaoExcluirUsuario}`
            }

            onClick={handleExcluirUsuario}

            disabled={
              carregando ||
              !usuarioSelecionadoExcluir
            }
          >
            {carregando
              ? "Excluindo..."
              : "Excluir"}
          </button>

        </div>

      </div>

      {/* ================================================================
          ALTERAR NÍVEL DE ACESSO
      ================================================================= */}

      <div className={styles.blocoFuncao}>

        <div className={styles.funcao}>

          <h1 className={styles.tituloConfig}>
            Alterar nível de acesso de um usuário:
          </h1>

          <Select
            options={usuarios}

            value={usuarioSelecionadoAlterar}

            onChange={
              setUsuarioSelecionadoAlterar
            }

            placeholder={
              carregando
                ? "Carregando usuários..."
                : "Digite ou selecione"
            }

            className={styles.selectConfig}

            isDisabled={carregando}

            isClearable
          />

        </div>

        <div className={styles.funcao}>

          <h1 className={styles.tituloConfig}>
            Escolha o novo nível de acesso:
          </h1>

          <Select
            options={nivelDeAcesso}

            value={novoNivelAcesso}

            onChange={setNovoNivelAcesso}

            placeholder="Selecione"

            className={styles.selectConfig}

            isDisabled={carregando}

            isClearable
          />

        </div>

        <div className={styles.divBotaoFuncao}>

          <button
            className={
              `${styles.botaoPadraoConfig} ` +
              `${styles.botaoAlterarNvlAcesso}`
            }

            onClick={handleAlterarNivelAcesso}

            disabled={
              carregando ||
              !usuarioSelecionadoAlterar ||
              !novoNivelAcesso
            }
          >
            {carregando
              ? "Alterando..."
              : "Alterar"}
          </button>

        </div>

      </div>

      {/* ================================================================
          CONVIDAR NOVO MEMBRO
      ================================================================= */}

      <div className={styles.blocoFuncao}>

        <div className={styles.funcao}>

          <h1 className={styles.tituloConfig}>
            Convidar novo membro:
          </h1>

          <input
            className={styles.input}

            type="email"

            placeholder="Insira um e-mail"

            value={emailConvite}

            onChange={(evento) =>
              setEmailConvite(
                evento.target.value,
              )
            }

            disabled={carregando}
          />

        </div>

        <div className={styles.funcao}>

          <h1 className={styles.tituloConfig}>
            Escolha o nível de acesso:
          </h1>

          <Select
            options={nivelDeAcesso}

            value={nivelAcessoConvite}

            onChange={
              setNivelAcessoConvite
            }

            placeholder="Selecione"

            className={styles.selectConfig}

            isDisabled={carregando}

            isClearable
          />

        </div>

        <div className={styles.divBotaoFuncao}>

          <button
            className={
              `${styles.botaoPadraoConfig} ` +
              `${styles.botaoConvidar}`
            }

            onClick={handleConvidarMembro}

            disabled={
              carregando ||
              !emailConvite ||
              !nivelAcessoConvite
            }
          >
            {carregando
              ? "Enviando..."
              : "Convidar"}
          </button>

        </div>

      </div>

      {/* ================================================================
          INSTAGRAM
      ================================================================= */}

      <div
        className={
          `${styles.blocoFuncao} ` +
          `${styles.blocoRedesSociais}`
        }
      >

        <div className={styles.funcao}>

          <h1 className={styles.tituloConfig}>
            Instagram do Instituto:
          </h1>

          <input
            className={styles.input}

            type="text"

            placeholder={
              "Telefone, nome de usuário ou e-mail"
            }

            value={
              credenciaisInstagram.usuario
            }

            onChange={(evento) =>
              setCredenciaisInstagram({
                ...credenciaisInstagram,

                usuario:
                  evento.target.value,
              })
            }

            disabled={carregando}
          />

          <input
            className={styles.input}

            type="password"

            placeholder="Senha"

            value={
              credenciaisInstagram.senha
            }

            onChange={(evento) =>
              setCredenciaisInstagram({
                ...credenciaisInstagram,

                senha:
                  evento.target.value,
              })
            }

            disabled={carregando}
          />

          <div
            className={styles.divBotaoFuncao}
          >

            <button
              className={
                `${styles.botaoPadraoConfig} ` +
                `${styles.botaoInserirInstagram}`
              }

              onClick={
                handleInserirInstagram
              }

              disabled={carregando}
            >
              Inserir
            </button>

          </div>

        </div>

      </div>

      {/* ================================================================
          FACEBOOK
      ================================================================= */}

      <div
        className={
          `${styles.blocoFuncao} ` +
          `${styles.blocoRedesSociais}`
        }
      >

        <div className={styles.funcao}>

          <h1 className={styles.tituloConfig}>
            Facebook do Instituto:
          </h1>

          <input
            className={styles.input}

            type="text"

            placeholder="E-mail ou telefone"

            value={
              credenciaisFacebook.email
            }

            onChange={(evento) =>
              setCredenciaisFacebook({
                ...credenciaisFacebook,

                email:
                  evento.target.value,
              })
            }

            disabled={carregando}
          />

          <input
            className={styles.input}

            type="password"

            placeholder="Senha"

            value={
              credenciaisFacebook.senha
            }

            onChange={(evento) =>
              setCredenciaisFacebook({
                ...credenciaisFacebook,

                senha:
                  evento.target.value,
              })
            }

            disabled={carregando}
          />

          <div
            className={styles.divBotaoFuncao}
          >

            <button
              className={
                `${styles.botaoPadraoConfig} ` +
                `${styles.botaoInserirFacebook}`
              }

              onClick={
                handleInserirFacebook
              }

              disabled={carregando}
            >
              Inserir
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}