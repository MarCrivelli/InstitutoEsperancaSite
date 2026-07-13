import { useEffect, useRef, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

export default function ConviteLogin({ onUsuarioAtualizado }) {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const processamentoIniciado = useRef(false);

  const [mensagem, setMensagem] = useState("Validando seu convite...");

  const [erro, setErro] = useState(false);

  useEffect(() => {
    /*
      Evita que o React StrictMode processe
      o mesmo convite duas vezes em desenvolvimento.
    */

    if (processamentoIniciado.current) {
      return;
    }

    processamentoIniciado.current = true;

    const aceitarConvite = async () => {
      try {
        console.log("URL completa:", window.location.href);

        console.log("Hash:", window.location.hash);

        console.log("Search:", window.location.search);

        const obterTokenConvite = () => {
          const parametrosNormais = new URLSearchParams(window.location.search);

          const tokenNormal = parametrosNormais.get("token");

          if (tokenNormal) {
            return tokenNormal;
          }

          const hash = window.location.hash;

          const indiceInterrogacao = hash.indexOf("?");

          if (indiceInterrogacao === -1) {
            return null;
          }

          const queryDoHash = hash.substring(indiceInterrogacao + 1);

          const parametrosHash = new URLSearchParams(queryDoHash);

          return parametrosHash.get("token");
        };

        const tokenConvite = obterTokenConvite();

        console.log("Token encontrado:", tokenConvite);

        if (!tokenConvite) {
          setErro(true);

          setMensagem(
            "O convite é inválido porque não possui um token de acesso.",
          );

          return;
        }

        const resposta = await fetch(
          `${import.meta.env.VITE_API_URL}/convites/aceitar`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              token: tokenConvite,
            }),
          },
        );

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
          setErro(true);

          setMensagem(dados.mensagem || "Não foi possível aceitar o convite.");

          return;
        }

        localStorage.setItem("token", dados.token);

        localStorage.setItem("usuario", JSON.stringify(dados.usuario));

        if (typeof onUsuarioAtualizado === "function") {
          onUsuarioAtualizado(dados.usuario);
        }

        setErro(false);

        setMensagem("Acesso autorizado! Entrando no sistema...");

        setTimeout(() => {
          navigate("/administracao", {
            replace: true,
          });
        }, 500);
      } catch (error) {
        console.error("Erro ao aceitar convite:", error);

        setErro(true);

        setMensagem("Ocorreu um erro de conexão ao processar seu convite.");
      }
    };

    aceitarConvite();
  }, [navigate, onUsuarioAtualizado, searchParams]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#f4f4f4",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "40px 25px",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            marginTop: 0,

            color: erro ? "#c62828" : "#2e7d32",
          }}
        >
          {erro ? "Não foi possível entrar" : "Instituto Esperança"}
        </h1>

        <p
          style={{
            color: "#555555",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          {mensagem}
        </p>

        {erro && (
          <button
            type="button"
            onClick={() => {
              navigate("/", {
                replace: true,
              });
            }}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#333333",
              color: "#ffffff",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Ir para a página inicial
          </button>
        )}
      </section>
    </main>
  );
}
