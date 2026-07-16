const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuarios");

require("dotenv").config();

const obterSegredoJwt = () => {
  const segredo =
    process.env.SECRET ||
    process.env.SEGREDO;

  if (!segredo) {
    throw new Error(
      "Defina SECRET no ambiente. SEGREDO é aceito apenas por compatibilidade."
    );
  }

  return segredo;
};

const verificarToken = async (req, res, next) => {
  try {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.BYPASS_AUTH === "true"
    ) {
      console.warn(
        "⚠️ [DEV] BYPASS DE AUTENTICAÇÃO ATIVADO"
      );

      const adminReal = await Usuario.findOne({
        nivelDeAcesso: "administrador",
        ativo: true,
      }).select(
        "nome email nivelDeAcesso ativo"
      );

      if (!adminReal) {
        return res.status(503).json({
          erro: true,
          mensagem:
            "BYPASS_AUTH está ativo, mas nenhum administrador foi encontrado.",
        });
      }

      req.user = {
        id: adminReal.id,
        nome: adminReal.nome,
        email: adminReal.email,
        nivelDeAcesso: adminReal.nivelDeAcesso,
      };

      return next();
    }

    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        erro: true,
        mensagem: "Token de acesso requerido",
      });
    }

    const [tipo, token] = authorization.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        erro: true,
        mensagem: "Token de acesso inválido",
      });
    }

    const decoded = jwt.verify(
      token,
      obterSegredoJwt()
    );

    if (!mongoose.isValidObjectId(decoded.id)) {
      return res.status(401).json({
        erro: true,
        mensagem: "Token contém um identificador inválido",
      });
    }

    const usuario = await Usuario.findOne({
      _id: decoded.id,
      ativo: true,
    }).select(
      "nome email nivelDeAcesso ativo"
    );

    if (!usuario) {
      return res.status(401).json({
        erro: true,
        mensagem: "Usuário não encontrado ou inativo",
      });
    }

    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nivelDeAcesso: usuario.nivelDeAcesso,
    };

    console.log(
      `🔐 Usuário autenticado: ${usuario.email} (${usuario.nivelDeAcesso})`
    );

    return next();
  } catch (error) {
    console.error(
      "❌ Erro na verificação do token:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        erro: true,
        mensagem: "Token expirado",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        erro: true,
        mensagem: "Token inválido",
      });
    }

    return res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor",
    });
  }
};

const apenasAdministrador = (req, res, next) => {
  if (req.user?.nivelDeAcesso !== "administrador") {
    return res.status(403).json({
      erro: true,
      mensagem:
        "Acesso negado. Apenas administradores têm acesso a esta funcionalidade.",
    });
  }

  return next();
};

const administradorOuSub = (req, res, next) => {
  if (
    !["administrador", "subAdministrador"].includes(
      req.user?.nivelDeAcesso
    )
  ) {
    return res.status(403).json({
      erro: true,
      mensagem:
        "Acesso negado. Funcionalidade restrita a administradores e sub-administradores.",
    });
  }

  return next();
};

const contribuinteOuSuperior = (req, res, next) => {
  const niveisPermitidos = [
    "contribuinte",
    "subAdministrador",
    "administrador",
  ];

  if (
    !niveisPermitidos.includes(
      req.user?.nivelDeAcesso
    )
  ) {
    return res.status(403).json({
      erro: true,
      mensagem:
        "Acesso negado. Você precisa ter nível de contribuinte ou superior.",
    });
  }

  return next();
};

const verificarProprioUsuarioOuAdmin = async (
  req,
  res,
  next
) => {
  try {
    const idRequisicao = req.params.id;
    const idUsuario = String(req.user.id);
    const nivelAcesso = req.user.nivelDeAcesso;

    if (!mongoose.isValidObjectId(idRequisicao)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID do usuário inválido",
      });
    }

    if (nivelAcesso === "administrador") {
      return next();
    }

    if (nivelAcesso === "subAdministrador") {
      if (String(idRequisicao) === idUsuario) {
        return next();
      }

      const usuarioAlvo = await Usuario.findById(
        idRequisicao
      ).select("nivelDeAcesso");

      if (!usuarioAlvo) {
        return res.status(404).json({
          erro: true,
          mensagem: "Usuário não encontrado",
        });
      }

      if (
        ["administrador", "subAdministrador"].includes(
          usuarioAlvo.nivelDeAcesso
        )
      ) {
        return res.status(403).json({
          erro: true,
          mensagem:
            "Sub-administradores não podem editar outros administradores ou sub-administradores",
        });
      }

      return next();
    }

    if (
      ["contribuinte", "usuario"].includes(
        nivelAcesso
      )
    ) {
      if (String(idRequisicao) !== idUsuario) {
        return res.status(403).json({
          erro: true,
          mensagem:
            "Você pode apenas editar seu próprio perfil",
        });
      }

      return next();
    }

    return res.status(403).json({
      erro: true,
      mensagem: "Nível de acesso não reconhecido",
    });
  } catch (error) {
    console.error(
      "❌ Erro na verificação de acesso:",
      error
    );

    return res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor",
    });
  }
};

const debugPermissoes = (req, res, next) => {
  if (req.user) {
    console.log(
      `🔍 [DEBUG] Usuário: ${req.user.email} | ` +
        `Nível: ${req.user.nivelDeAcesso} | ` +
        `Rota: ${req.method} ${req.path}`
    );
  }

  return next();
};

const verificarNivel = (nivelRequerido) => {
  const hierarquia = {
    usuario: 1,
    contribuinte: 2,
    subAdministrador: 3,
    administrador: 4,
  };

  return (req, res, next) => {
    const nivelUsuario =
      hierarquia[req.user?.nivelDeAcesso] || 0;

    const nivelMinimo =
      hierarquia[nivelRequerido] || 0;

    if (nivelUsuario < nivelMinimo) {
      return res.status(403).json({
        erro: true,
        mensagem:
          `Acesso negado. Nível mínimo requerido: ${nivelRequerido}`,
      });
    }

    return next();
  };
};

module.exports = {
  verificarToken,
  apenasAdministrador,
  administradorOuSub,
  contribuinteOuSuperior,
  verificarProprioUsuarioOuAdmin,
  debugPermissoes,
  verificarNivel,
};
