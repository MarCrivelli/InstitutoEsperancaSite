"use client";
import React, { useState } from "react";
import styles from "../Autenticacao/autenticacao.module.css";
import Header from "../Visitantes/HeaderVisitantes/app";

export default function Autenticacao() {
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    password: "",
  });

  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const alterarNome = (novoNome) => {
    setUsuario((valoresAnteriores) => ({
      ...valoresAnteriores,
      nome: novoNome,
    }));
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
      password: novaSenha,
    }));
  };

  const handleCadastro = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/cadastro`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(usuario),
        }
      );

      const data = await response.json();
      if (!data.erro) {
        alert("Usuário cadastrado com sucesso!");
        setIsRightPanelActive(false);
      } else {
        alert(`Erro: ${data.mensagem}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar o usuário:", error);
      alert("Erro ao cadastrar. Tente novamente.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: usuario.email,
            password: usuario.password,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Login realizado com sucesso!");
      } else {
        alert(`Erro: ${data.mensagem}`);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.alinharFormulario}>
        <div
          className={`${styles.container} ${
            isRightPanelActive ? styles.rightPanelActive : ""
          }`}
        >
          <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
            <form className={styles.form} onSubmit={handleCadastro}>
              <h1 className={styles.tituloAutenticacao}>Crie sua Conta</h1>
              <input
                className={styles.input}
                type="email"
                placeholder="Digite seu e-mail"
                value={usuario.email}
                onChange={(e) => alterarEmail(e.target.value)}
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Digite sua senha"
                value={usuario.password}
                onChange={(e) => alterarSenha(e.target.value)}
              />
              <button className={styles.button} type="submit">
                Cadastrar
              </button>
            </form>
          </div>

          <div className={`${styles.formContainer} ${styles.signInContainer}`}>
            <form className={styles.form} onSubmit={handleLogin}>
              <h1 className={styles.tituloAutenticacao}>Fazer Login</h1>
              <input
                className={styles.input}
                type="email"
                placeholder="Digite seu e-mail"
                value={usuario.email}
                onChange={(e) => alterarEmail(e.target.value)}
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Digite sua senha"
                value={usuario.password}
                onChange={(e) => alterarSenha(e.target.value)}
              />
              <button className={styles.button} type="submit">
                Logar
              </button>
            </form>
          </div>

          <div className={styles.overlayContainer}>
            <div className={styles.overlay}>
              <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
                <h1 className={styles.tituloAutenticacao}>
                  Bem Vindo De Volta!
                </h1>
                <p className={styles.textoAutenticar}>
                  Para se manter conectado conosco, faça login com sua conta.
                </p>
                <button
                  className={`${styles.button} ${styles.fantasma}`}
                  onClick={() => setIsRightPanelActive(false)}
                >
                  Logar
                </button>
              </div>
              <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
                <h1 className={styles.tituloAutenticacao}>Ainda não tem conta?</h1>
                <p className={styles.textoAutenticar}>
                  Cadastre-se e fique por dentro de todas as dicas e informações que o Instituto tem a oferecer!.
                </p>
                <button
                  className={`${styles.button} ${styles.fantasma}`}
                  onClick={() => setIsRightPanelActive(true)}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
