"use client";
import { useState, useEffect } from "react";
import BotaoParaPaginaDeAdms from "../../Visitantes/BotaoParaPaginaDeAdms/app";
import CadastroELogin from "../CadastroELogin/app";
import PainelUsuario from "../PainelDeUsuario/app";

// ================ FUNÇÕES DE AUTENTICAÇÃO MELHORADAS ================

// Função para decodificar JWT e verificar validade
const decodificarToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

// Função para verificar se o token está expirado
const tokenExpirado = (token) => {
  if (!token) return true;
  
  const decoded = decodificarToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < now;
  
  if (isExpired) {
    console.warn('Token expirado:', new Date(decoded.exp * 1000));
  }
  
  return isExpired;
};

// Função para limpar dados de autenticação expirados
const limparDadosExpirados = () => {
  console.log('Limpando dados de autenticação expirados...');
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  sessionStorage.removeItem("token");
};

// Função para verificar validade do token e limpar se necessário
const verificarELimparToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  if (token && tokenExpirado(token)) {
    limparDadosExpirados();
    return null;
  }
  
  return token;
};

export default function GerenciarUsuario() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [carregandoVerificacao, setCarregandoVerificacao] = useState(true);

  // Verificar se usuário está logado e token é válido
  useEffect(() => {
    const verificarUsuarioLogado = async () => {
      setCarregandoVerificacao(true);
      
      try {
        // Primeiro, verificar se existe token válido
        const token = verificarELimparToken();
        
        if (!token) {
          console.log("Nenhum token válido encontrado");
          setCarregandoVerificacao(false);
          return;
        }

        // Verificar dados do usuário no localStorage
        const dadosUsuario = localStorage.getItem("usuario");
        
        if (!dadosUsuario) {
          console.log("Dados do usuário não encontrados");
          limparDadosExpirados();
          setCarregandoVerificacao(false);
          return;
        }

        try {
          const usuarioData = JSON.parse(dadosUsuario);
          
          // Verificar se o token ainda é válido no servidor
          const response = await fetch("http://localhost:3003/verificar-token", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            setUsuarioLogado(usuarioData);
            console.log("Usuário autenticado com sucesso:", usuarioData.email);
          } else {
            // Token inválido no servidor - limpar dados
            console.warn("Token inválido no servidor");
            limparDadosExpirados();
            setUsuarioLogado(null);
          }
        } catch (parseError) {
          console.error("Erro ao parsear dados do usuário:", parseError);
          limparDadosExpirados();
        }
      } catch (error) {
        console.error("Erro ao verificar usuário logado:", error);
        limparDadosExpirados();
      } finally {
        setCarregandoVerificacao(false);
      }
    };

    verificarUsuarioLogado();
  }, []);

  // Função para salvar dados do usuário logado
  const salvarDadosUsuario = (dadosUsuario, token) => {
    // Verificar se o token não está expirado antes de salvar
    if (tokenExpirado(token)) {
      console.error("Tentativa de salvar token expirado");
      alert("O token recebido já está expirado. Tente fazer login novamente.");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
    setUsuarioLogado(dadosUsuario);
    
    console.log("Usuário logado com sucesso:", dadosUsuario.email);
    console.log("Token salvo e válido até:", new Date(decodificarToken(token).exp * 1000));
  };

  // Função para fazer logout
  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair da sua conta?")) {
      limparDadosExpirados();
      setUsuarioLogado(null);
      console.log("Usuário deslogado com sucesso");
      alert("Logout realizado com sucesso!");
    }
  };

  // Função para atualizar dados do usuário (quando alterações são feitas)
  const handleUsuarioAtualizado = (novosDados) => {
    if (novosDados === null) {
      // Usuário foi deslogado ou conta foi excluída
      limparDadosExpirados();
      setUsuarioLogado(null);
    } else {
      // Dados do usuário foram atualizados
      localStorage.setItem("usuario", JSON.stringify(novosDados));
      setUsuarioLogado(novosDados);
      console.log("Dados do usuário atualizados:", novosDados.email);
    }
  };

  // Verificação periódica do token (a cada 5 minutos)
  useEffect(() => {
    if (!usuarioLogado) return;

    const verificarTokenPeriodicamente = setInterval(() => {
      const token = verificarELimparToken();
      
      if (!token && usuarioLogado) {
        // Token expirou - fazer logout automático
        console.warn("Token expirou - fazendo logout automático");
        setUsuarioLogado(null);
        alert("Sua sessão expirou. Por favor, faça login novamente.");
      }
    }, 5 * 60 * 1000); // Verificar a cada 5 minutos

    return () => clearInterval(verificarTokenPeriodicamente);
  }, [usuarioLogado]);

  // Mostrar loading enquanto verifica autenticação
  if (carregandoVerificacao) {
    return (
      <div >
        <BotaoParaPaginaDeAdms />
        <div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BotaoParaPaginaDeAdms />
      
      {usuarioLogado ? (
        <PainelUsuario 
          usuarioLogado={usuarioLogado}
          funcaoDeslogarRequerida={handleLogout}
          onUsuarioAtualizado={handleUsuarioAtualizado}
        />
      ) : (
        <CadastroELogin 
          onLoginSucesso={salvarDadosUsuario}
        />
      )}
    </div>
  );
}