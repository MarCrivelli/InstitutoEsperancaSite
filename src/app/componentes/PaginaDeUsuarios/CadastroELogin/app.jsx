"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./cadastroELogin.module.css";
import Header from "../../Header/app";

export default function CadastroELogin({ onLoginSucesso }) {
  const googleButtonCadastroRef = useRef(null);
  const googleButtonLoginRef = useRef(null);

  const [painelDireitoAtivo, setPainelDireitoAtivo] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Estado para os formulários de login/cadastro
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  // Inicializar Google Login
  useEffect(() => {
    const CLIENT_ID =
      "173898638940-la9trlrtts8ngmsj8t2mv455og5s8g86.apps.googleusercontent.com";

    const inicializarGoogle = () => {
      if (!window.google) {
        console.error("Google Identity Services não foi carregado.");
        return;
      }

      console.log("🌐 Origem atual:", window.location.origin);
      console.log("🔑 Client ID:", CLIENT_ID);

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleButtonCadastroRef.current) {
        googleButtonCadastroRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(
          googleButtonCadastroRef.current,
          {
            theme: "outline",
            size: "large",
            text: "signup_with",
            shape: "rectangular",
            width: 280,
          },
        );
      }

      if (googleButtonLoginRef.current) {
        googleButtonLoginRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(googleButtonLoginRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 280,
        });
      }

      console.log("✅ Google Identity Services inicializado.");
    };

    const scriptExistente = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (scriptExistente) {
      if (window.google) {
        inicializarGoogle();
      } else {
        scriptExistente.addEventListener("load", inicializarGoogle);
      }

      return () => {
        scriptExistente.removeEventListener("load", inicializarGoogle);
      };
    }

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = inicializarGoogle;

    script.onerror = () => {
      console.error("❌ Não foi possível carregar o Google Identity Services.");
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  // Função para lidar com a resposta do Google
  const handleGoogleResponse = async (response) => {
    try {
      if (!response?.credential) {
        throw new Error("O Google não retornou uma credencial válida.");
      }

      console.log("✅ Credencial recebida do Google.");

      await processarLoginGoogle(response.credential);
    } catch (error) {
      console.error("❌ Erro ao processar login do Google:", error);

      alert(error.message || "Erro ao fazer login com Google.");
    }
  };

  const processarLoginGoogle = async (googleToken) => {
    setCarregando(true);

    try {
      const urlApi = import.meta.env.VITE_API_URL;

      if (!urlApi) {
        throw new Error("VITE_API_URL não está configurada.");
      }

      console.log("📤 Enviando credencial Google para o backend...");

      const resposta = await fetch(`${urlApi}/login-google`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          googleToken,
        }),
      });

      const contentType = resposta.headers.get("content-type") || "";

      let dados;

      if (contentType.includes("application/json")) {
        dados = await resposta.json();
      } else {
        const texto = await resposta.text();

        console.error("❌ Resposta inesperada do servidor:", texto);

        throw new Error(
          `O servidor retornou uma resposta inesperada. Status: ${resposta.status}`,
        );
      }

      if (!resposta.ok || dados.erro) {
        throw new Error(dados.mensagem || `Erro HTTP ${resposta.status}`);
      }

      if (!dados.token) {
        throw new Error("O backend não retornou o token da sessão.");
      }

      if (!dados.usuario) {
        throw new Error("O backend não retornou os dados do usuário.");
      }

      // Este é o JWT do Instituto Esperança,
      // não o token do Google.
      onLoginSucesso(dados.usuario, dados.token);
    } catch (erro) {
      console.error("❌ Erro no login Google:", erro);

      alert(erro.message || "Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // Decodificar JWT do Google
  const parseJwt = (token) => {
    try {
      if (!token || typeof token !== "string") {
        return null;
      }

      const partes = token.split(".");

      if (partes.length !== 3) {
        console.error("JWT inválido: formato incorreto.");
        return null;
      }

      let base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");

      while (base64.length % 4) {
        base64 += "=";
      }

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((caractere) => {
            return (
              "%" + ("00" + caractere.charCodeAt(0).toString(16)).slice(-2)
            );
          })
          .join(""),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Erro ao decodificar JWT do Google:", error);
      return null;
    }
  };

  const alterarEmail = (novoEmail) => {
    setUsuario((valoresAnteriores) => ({
      ...valoresAnteriores,
      email: novoEmail,
    }));
  };

  const alterarSenha = (novaSenha) => {
    setUsuario((valoresAnteriores) => ({
      ...valoresAnteriores,
      senha: novaSenha,
    }));
  };

  const manipularCadastro = async (evento) => {
    evento.preventDefault();

    if (!usuario.nome || !usuario.email || !usuario.senha) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    if (usuario.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setCarregando(true);

    try {
      const urlApi = `${import.meta.env.VITE_API_URL}`;

      const resposta = await fetch(`${urlApi}/cadastro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: usuario.nome,
          email: usuario.email,
          senha: usuario.senha,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        if (dados.loginAutomatico && dados.token) {
          onLoginSucesso(dados.usuario, dados.token);
        } else {
          alert("Usuário cadastrado com sucesso!");
          setPainelDireitoAtivo(false);
        }
        setUsuario({ nome: "", email: "", senha: "" });
      } else {
        alert(`Erro: ${dados.mensagem || "Erro desconhecido"}`);
      }
    } catch (erro) {
      console.error("Erro ao cadastrar o usuário:", erro);
      alert("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  const manipularLogin = async (evento) => {
    evento.preventDefault();

    if (!usuario.email || !usuario.senha) {
      alert("Por favor, preencha email e senha");
      return;
    }

    setCarregando(true);

    try {
      const urlApi = `${import.meta.env.VITE_API_URL}`;

      const resposta = await fetch(`${urlApi}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuario.email,
          senha: usuario.senha,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok && !dados.erro) {
        onLoginSucesso(dados.usuario, dados.token);
        setUsuario({ nome: "", email: "", senha: "" });
      } else {
        alert(`Erro: ${dados.mensagem || "Email ou senha incorretos"}`);
      }
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      alert("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <Header destino="visitantes" tipo="modoDark" />
      <div className={styles.alinharFormulario}>
        <div
          className={`${styles.containerAutenticacao} ${
            painelDireitoAtivo ? styles.painelAtivo : ""
          }`}
        >
          {/* Formulário de Cadastro */}
          <div
            className={`${styles.painelFormulario} ${styles.painelCadastro}`}
          >
            <form className={styles.formulario} onSubmit={manipularCadastro}>
              <h1 className={styles.tituloFormulario}>Crie sua Conta</h1>

              <div
                style={{
                  margin: "20px 0",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div ref={googleButtonCadastroRef}></div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "20px 0",
                  color: "#666",
                }}
              >
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
                <span style={{ padding: "0 15px", fontSize: "14px" }}>ou</span>
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
              </div>

              <input
                className={styles.campoInput}
                type="text"
                placeholder="Digite seu nome de usuário"
                value={usuario.nome}
                onChange={(e) =>
                  setUsuario({ ...usuario, nome: e.target.value })
                }
                disabled={carregando}
                required
              />

              <input
                className={styles.campoInput}
                type="email"
                placeholder="Digite seu e-mail"
                value={usuario.email}
                onChange={(e) => alterarEmail(e.target.value)}
                disabled={carregando}
                required
              />

              <input
                className={styles.campoInput}
                type="password"
                placeholder="Digite sua senha (min. 6 caracteres)"
                value={usuario.senha}
                onChange={(e) => alterarSenha(e.target.value)}
                disabled={carregando}
                required
                minLength="6"
              />

              <button
                className={styles.botaoPrincipal}
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Cadastrando..." : "Cadastrar e Entrar"}
              </button>
            </form>
          </div>

          {/* Formulário de login */}
          <div className={`${styles.painelFormulario} ${styles.painelLogin}`}>
            <form className={styles.formulario} onSubmit={manipularLogin}>
              <h1 className={styles.tituloFormulario}>Fazer Login</h1>

              <div
                style={{
                  margin: "20px 0",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div ref={googleButtonLoginRef}></div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "20px 0",
                  color: "#666",
                }}
              >
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
                <span style={{ padding: "0 15px", fontSize: "14px" }}>ou</span>
                <hr
                  style={{
                    flex: 1,
                    border: "none",
                    borderTop: "1px solid #ccc",
                  }}
                />
              </div>

              <input
                className={styles.campoInput}
                type="email"
                placeholder="Digite seu e-mail"
                value={usuario.email}
                onChange={(e) => alterarEmail(e.target.value)}
                disabled={carregando}
                required
              />

              <input
                className={styles.campoInput}
                type="password"
                placeholder="Digite sua senha"
                value={usuario.senha}
                onChange={(e) => alterarSenha(e.target.value)}
                disabled={carregando}
                required
              />

              <button
                className={styles.botaoPrincipal}
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>

          <div className={styles.containerOverlay}>
            <div className={styles.overlay}>
              <div
                className={`${styles.painelOverlay} ${styles.painelOverlayEsquerdo}`}
              >
                <h1 className={styles.tituloFormulario}>Bem Vindo De Volta!</h1>
                <p className={styles.textoFormulario}>
                  Para se manter conectado conosco, faça login com sua conta.
                </p>
                <button
                  className={`${styles.botaoPrincipal} ${styles.botaoSecundario}`}
                  onClick={() => setPainelDireitoAtivo(false)}
                  type="button"
                  disabled={carregando}
                >
                  Logar
                </button>
              </div>

              <div
                className={`${styles.painelOverlay} ${styles.painelOverlayDireito}`}
              >
                <h1 className={styles.tituloFormulario}>
                  Ainda não tem conta?
                </h1>
                <p className={styles.textoFormulario}>
                  Cadastre-se e seja automaticamente logado! Fique por dentro de
                  todas as dicas e informações que o Instituto tem a oferecer!
                </p>
                <button
                  className={`${styles.botaoPrincipal} ${styles.botaoSecundario}`}
                  onClick={() => setPainelDireitoAtivo(true)}
                  type="button"
                  disabled={carregando}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}