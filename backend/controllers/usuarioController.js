const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ADMIN_NOME = process.env.ADMIN_NOME?.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const ADMIN_SENHA = process.env.ADMIN_SENHA;

const validarObjectId = (id) => mongoose.isValidObjectId(id);

const obterSegredoJwt = () => {
  const segredo = process.env.SECRET;

  if (!segredo) {
    throw new Error("Defina SECRET no ambiente.");
  }

  return segredo;
};

const obterSegredoConvite = () => {
  if (!process.env.SECRET_CONVITE) {
    throw new Error("SECRET_CONVITE não foi definido no arquivo .env");
  }
  return process.env.SECRET_CONVITE;
};

const gerarTokenUsuario = (usuario) =>
  jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nivelDeAcesso: usuario.nivelDeAcesso,
    },
    obterSegredoJwt(),
    { expiresIn: "168h" }
  );

const formatarUsuarioParaResposta = (usuario) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  telefone: usuario.telefone,
  receberEmailEventos:
    usuario.receberEmailEventos,
  receberMensagensEventos:
    usuario.receberMensagensEventos,
  nivelDeAcesso: usuario.nivelDeAcesso,
  foto: usuario.foto,
  googleId: usuario.googleId,
  ativo: usuario.ativo,
});

const validarEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validarTelefone = (telefone) => {
  if (!telefone || telefone.trim() === "") return true;
  return /^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(
    telefone.replace(/\s/g, "")
  );
};

const limparTelefone = (telefone) =>
  telefone ? telefone.replace(/[^\d+()-\s]/g, "").trim() : null;

const ehAdministradorPrincipal = (usuario) =>
  Boolean(
    usuario &&
      ADMIN_EMAIL &&
      usuario.email?.toLowerCase().trim() === ADMIN_EMAIL
  );

const criarTransportadorEmail = () => {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST não foi definido no .env");
  }
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER não foi definido no .env");
  }
  if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS não foi definido no .env");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const garantirAdminFixo = async () => {
  if (!ADMIN_NOME || !ADMIN_EMAIL || !ADMIN_SENHA) {
    throw new Error(
      "ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA devem estar definidos no .env"
    );
  }

  let administrador = await Usuario.findOne({
    email: ADMIN_EMAIL,
  }).select("+senha");

  if (administrador) {
    let alterou = false;

    if (administrador.nivelDeAcesso !== "administrador") {
      administrador.nivelDeAcesso = "administrador";
      alterou = true;
    }

    if (!administrador.ativo) {
      administrador.ativo = true;
      alterou = true;
    }

    if (alterou) {
      await administrador.save();
    }

    console.log("✅ Administrador principal já existe no sistema.");
    return administrador;
  }

  administrador = await Usuario.create({
    nome: ADMIN_NOME,
    email: ADMIN_EMAIL,
    senha: await bcrypt.hash(ADMIN_SENHA, 10),
    nivelDeAcesso: "administrador",
    telefone: null,
    receberEmailEventos: false,
    receberMensagensEventos: false,
    ativo: true,
    dataUltimoLogin: null,
  });

  console.log("✅ Administrador principal criado usando os dados do .env.");
  return administrador;
};

const cadastrarUsuario = async (req, res) => {
  const {
    nome,
    senha,
    email,
    telefone,
    receberEmailEventos = true,
    receberMensagensEventos = true,
  } = req.body;

  try {
    if (!nome || !senha || !email) {
      return res.status(400).json({
        erro: true,
        mensagem: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    const emailNormalizado = email.toLowerCase().trim();

    if (!validarEmail(emailNormalizado)) {
      return res.status(400).json({
        erro: true,
        mensagem: "Por favor, insira um e-mail válido.",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        erro: true,
        mensagem: "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    if (telefone && !validarTelefone(telefone)) {
      return res.status(400).json({
        erro: true,
        mensagem: "Telefone deve estar em um formato válido.",
      });
    }

    if (await Usuario.exists({ email: emailNormalizado })) {
      return res.status(400).json({
        erro: true,
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      senha: await bcrypt.hash(senha, 10),
      email: emailNormalizado,
      telefone: limparTelefone(telefone),
      receberEmailEventos: receberEmailEventos !== false,
      receberMensagensEventos: receberMensagensEventos !== false,
      nivelDeAcesso: "usuario",
      ativo: true,
      dataUltimoLogin: new Date(),
    });

    return res.status(201).json({
      erro: false,
      mensagem:
        "Cadastro realizado com sucesso! Você foi logado automaticamente.",
      usuario: formatarUsuarioParaResposta(novoUsuario),
      token: gerarTokenUsuario(novoUsuario),
      loginAutomatico: true,
    });
  } catch (erro) {
    console.error("❌ Erro no cadastro:", erro);

    if (erro.name === "ValidationError") {
      return res.status(400).json({
        erro: true,
        mensagem:
          Object.values(erro.errors || {})[0]?.message || "Dados inválidos.",
      });
    }

    if (erro.code === 11000) {
      return res.status(400).json({
        erro: true,
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    return res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor.",
    });
  }
};

const autenticarUsuario = async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({
        erro: true,
        mensagem: "E-mail e senha são obrigatórios.",
      });
    }

    const usuario = await Usuario.findOne({
      email: email.toLowerCase().trim(),
      ativo: true,
    }).select("+senha");

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({
        erro: true,
        mensagem: "E-mail ou senha incorretos.",
      });
    }

    usuario.dataUltimoLogin = new Date();
    await usuario.save();

    return res.json({
      erro: false,
      mensagem: "Login realizado com sucesso!",
      usuario: formatarUsuarioParaResposta(usuario),
      token: gerarTokenUsuario(usuario),
    });
  } catch (erro) {
    console.error("❌ Erro no login:", erro);
    return res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor.",
    });
  }
};

const loginComGoogle = async (req, res) => {
  try {
    const { googleToken, senha } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        erro: true,
        mensagem: "Token do Google não foi enviado.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email || !payload.email_verified) {
      return res.status(401).json({
        erro: true,
        mensagem: "Dados da conta Google inválidos ou não verificados.",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const foto = payload.picture || null;

    let usuario = await Usuario.findOne({ email });

    if (!usuario) {
      if (!senha) {
        return res.status(428).json({
          erro: true,
          requerCadastroSenha: true,
          mensagem:
            "Crie uma senha para concluir seu cadastro com o Google.",
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          erro: true,
          mensagem: "A senha deve ter pelo menos 6 caracteres.",
        });
      }

      usuario = await Usuario.create({
        nome: payload.name || email.split("@")[0],
        email,
        senha: await bcrypt.hash(senha, 10),
        senhaGoogleConfirmada: true,
        googleId,
        foto,
        receberEmailEventos: true,
        receberMensagensEventos: true,
        nivelDeAcesso: "usuario",
        ativo: true,
        dataUltimoLogin: new Date(),
      });
    } else {
      if (!usuario.ativo) {
        return res.status(403).json({
          erro: true,
          mensagem: "Esta conta não está ativa no sistema.",
        });
      }

      if (!usuario.senhaGoogleConfirmada) {
        if (!senha) {
          return res.status(428).json({
            erro: true,
            requerCadastroSenha: true,
            mensagem:
              "Crie uma senha para continuar usando sua conta do Google.",
          });
        }

        if (senha.length < 6) {
          return res.status(400).json({
            erro: true,
            mensagem: "A senha deve ter pelo menos 6 caracteres.",
          });
        }

        usuario.senha = await bcrypt.hash(senha, 10);
        usuario.senhaGoogleConfirmada = true;
      }

      usuario.googleId = googleId;
      usuario.dataUltimoLogin = new Date();

      if (foto) usuario.foto = foto;

      await usuario.save();
    }

    return res.json({
      erro: false,
      mensagem: "Login com Google realizado com sucesso!",
      usuario: formatarUsuarioParaResposta(usuario),
      token: gerarTokenUsuario(usuario),
    });
  } catch (error) {
    console.error("❌ Erro no login Google:", error);

    return res.status(500).json({
      erro: true,
      mensagem: "Erro interno ao realizar login com Google.",
    });
  }
};

const encontrarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarObjectId(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido.",
      });
    }

    const usuario = await Usuario.findById(id).select(
      "nome email telefone receberEmailEventos receberMensagensEventos " +
        "nivelDeAcesso foto ativo dataUltimoLogin createdAt updatedAt"
    );

    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado.",
      });
    }

    return res.json({ erro: false, usuario });
  } catch (erro) {
    console.error("❌ Erro ao buscar usuário:", erro);
    return res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao buscar o usuário.",
    });
  }
};

const procurarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select(
        "nome email telefone receberEmailEventos receberMensagensEventos " +
          "nivelDeAcesso foto ativo dataUltimoLogin createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    const usuariosFormatados = usuarios.map((usuario) => {
      const dados = usuario.toJSON();

      return {
        ...dados,
        protegido:
          Boolean(ADMIN_EMAIL) &&
          dados.email?.toLowerCase().trim() === ADMIN_EMAIL,
      };
    });

    return res.json({
      erro: false,
      usuarios: usuariosFormatados,
      total: usuariosFormatados.length,
    });
  } catch (erro) {
    console.error("❌ Erro ao listar usuários:", erro);
    return res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao listar os usuários.",
    });
  }
};

const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarObjectId(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido.",
      });
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado.",
      });
    }

    if (ehAdministradorPrincipal(usuario)) {
      return res.status(403).json({
        erro: true,
        mensagem: "O administrador principal do sistema não pode ser excluído.",
      });
    }

    const ehPropriaConta = String(req.user.id) === String(id);
    const ehAdministrador = req.user.nivelDeAcesso === "administrador";

    if (!ehPropriaConta && !ehAdministrador) {
      return res.status(403).json({
        erro: true,
        mensagem: "Você não tem permissão para excluir esta conta.",
      });
    }

    await usuario.deleteOne();

    return res.json({
      erro: false,
      mensagem: ehPropriaConta
        ? "Sua conta foi excluída com sucesso."
        : "Usuário excluído com sucesso.",
    });
  } catch (erro) {
    console.error("❌ Erro ao deletar usuário:", erro);
    return res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao excluir o usuário.",
    });
  }
};

const modificarDadosUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarObjectId(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido.",
      });
    }

    const usuario = await Usuario.findById(id).select("+senha");

    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado.",
      });
    }

    const {
      nome,
      senha,
      email,
      telefone,
      receberEmailEventos,
      receberMensagensEventos,
      foto,
      nivelDeAcesso,
      googleId,
    } = req.body;

    const adminPrincipal = ehAdministradorPrincipal(usuario);

    if (nome !== undefined && nome.trim()) {
      usuario.nome = nome.trim();
    }

    if (email !== undefined) {
      const emailNormalizado = email.toLowerCase().trim();

      if (adminPrincipal && emailNormalizado !== ADMIN_EMAIL) {
        return res.status(403).json({
          erro: true,
          mensagem:
            "O e-mail do administrador principal não pode ser alterado.",
        });
      }

      if (!validarEmail(emailNormalizado)) {
        return res.status(400).json({
          erro: true,
          mensagem: "Por favor, insira um e-mail válido.",
        });
      }

      if (
        await Usuario.exists({
          email: emailNormalizado,
          _id: { $ne: id },
        })
      ) {
        return res.status(400).json({
          erro: true,
          mensagem: "Este e-mail já está sendo usado por outro usuário.",
        });
      }

      usuario.email = emailNormalizado;
    }

    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({
          erro: true,
          mensagem: "A senha deve ter pelo menos 6 caracteres.",
        });
      }
      usuario.senha = await bcrypt.hash(senha, 10);
      usuario.senhaGoogleConfirmada = true;
    }

    if (nivelDeAcesso !== undefined) {
      const niveisPermitidos = [
        "administrador",
        "subAdministrador",
        "contribuinte",
        "usuario",
      ];

      if (!niveisPermitidos.includes(nivelDeAcesso)) {
        return res.status(400).json({
          erro: true,
          mensagem: "Nível de acesso inválido.",
        });
      }

      if (adminPrincipal && nivelDeAcesso !== "administrador") {
        return res.status(403).json({
          erro: true,
          mensagem:
            "O administrador principal deve permanecer como administrador.",
        });
      }

      usuario.nivelDeAcesso = nivelDeAcesso;
    }

    if (telefone !== undefined) {
      if (telefone && !validarTelefone(telefone)) {
        return res.status(400).json({
          erro: true,
          mensagem: "Telefone deve estar em um formato válido.",
        });
      }
      usuario.telefone = limparTelefone(telefone);
    }

    if (receberEmailEventos !== undefined) {
      usuario.receberEmailEventos = Boolean(receberEmailEventos);
    }

    if (receberMensagensEventos !== undefined) {
      usuario.receberMensagensEventos = Boolean(receberMensagensEventos);
    }

    if (foto !== undefined) usuario.foto = foto;
    if (googleId !== undefined) usuario.googleId = googleId || null;

    await usuario.save();

    return res.json({
      erro: false,
      mensagem: "Usuário alterado com sucesso!",
      usuario: formatarUsuarioParaResposta(usuario),
    });
  } catch (erro) {
    console.error("❌ Erro ao alterar usuário:", erro);

    if (erro.name === "ValidationError") {
      return res.status(400).json({
        erro: true,
        mensagem:
          Object.values(erro.errors || {})[0]?.message || "Dados inválidos.",
      });
    }

    if (erro.code === 11000) {
      return res.status(400).json({
        erro: true,
        mensagem: "Este e-mail já está sendo usado por outro usuário.",
      });
    }

    return res.status(500).json({
      erro: true,
      mensagem: "Ocorreu um erro ao alterar o usuário.",
    });
  }
};

const convidarUsuario = async (req, res) => {
  try {
    const { email, nivelDeAcesso } = req.body;

    if (!email || !nivelDeAcesso) {
      return res.status(400).json({
        erro: true,
        mensagem: "E-mail e nível de acesso são obrigatórios.",
      });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const niveisPermitidos = [
      "administrador",
      "subAdministrador",
      "contribuinte",
    ];

    if (
      !validarEmail(emailNormalizado) ||
      !niveisPermitidos.includes(nivelDeAcesso)
    ) {
      return res.status(400).json({
        erro: true,
        mensagem: "E-mail ou nível de acesso inválido.",
      });
    }

    if (await Usuario.exists({ email: emailNormalizado })) {
      return res.status(400).json({
        erro: true,
        mensagem: "Já existe um usuário cadastrado com este e-mail.",
      });
    }

    const tokenConvite = jwt.sign(
      {
        email: emailNormalizado,
        nivelDeAcesso,
        tipo: "convite-administrativo",
      },
      obterSegredoConvite(),
      { expiresIn: "24h" }
    );

    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
    const urlConvite =
      `${frontendUrl}/#/convite?token=` +
      encodeURIComponent(tokenConvite);

    await criarTransportadorEmail().sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Instituto Esperança - A Voz dos Animais" <${process.env.SMTP_USER}>`,
      to: emailNormalizado,
      subject: "Convite para acessar o Instituto Esperança",
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:30px">
          <h1>Você recebeu um convite</h1>
          <p>Você foi convidado para acessar a área administrativa do Instituto Esperança.</p>
          <p><a href="${urlConvite}">Acessar minha conta</a></p>
          <p>Este convite é válido por 24 horas.</p>
        </div>
      `,
    });

    return res.status(200).json({
      erro: false,
      mensagem: `Convite enviado com sucesso para ${emailNormalizado}.`,
    });
  } catch (error) {
    console.error("❌ Erro ao enviar convite:", error);
    return res.status(500).json({
      erro: true,
      mensagem: "Não foi possível enviar o convite.",
    });
  }
};

const aceitarConvite = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        erro: true,
        mensagem: "Token do convite não informado.",
      });
    }

    let dadosConvite;

    try {
      dadosConvite = jwt.verify(token, obterSegredoConvite());
    } catch {
      return res.status(401).json({
        erro: true,
        mensagem: "Este convite é inválido ou expirou.",
      });
    }

    const email = dadosConvite.email.toLowerCase().trim();
    const nivelDeAcesso = dadosConvite.nivelDeAcesso;

    if (
      dadosConvite.tipo !== "convite-administrativo" ||
      !["administrador", "subAdministrador", "contribuinte"].includes(
        nivelDeAcesso
      )
    ) {
      return res.status(400).json({
        erro: true,
        mensagem: "Convite inválido.",
      });
    }

    if (await Usuario.exists({ email })) {
      return res.status(409).json({
        erro: true,
        mensagem:
          "Este convite já foi utilizado ou já existe uma conta cadastrada.",
      });
    }

    const novoUsuario = await Usuario.create({
      nome: email.split("@")[0],
      email,
      senha: await bcrypt.hash(
        crypto.randomBytes(48).toString("hex"),
        10
      ),
      nivelDeAcesso,
      telefone: null,
      receberEmailEventos: true,
      receberMensagensEventos: true,
      ativo: true,
      dataUltimoLogin: new Date(),
    });

    return res.status(201).json({
      erro: false,
      mensagem: "Convite aceito. Login realizado com sucesso.",
      token: gerarTokenUsuario(novoUsuario),
      usuario: formatarUsuarioParaResposta(novoUsuario),
      loginAutomatico: true,
    });
  } catch (error) {
    console.error("❌ Erro ao aceitar convite:", error);
    return res.status(500).json({
      erro: true,
      mensagem: "Não foi possível processar o convite.",
    });
  }
};

const inicializarSistema = async () => {
  try {
    console.log("🔄 Inicializando sistema de usuários...");
    await garantirAdminFixo();
    console.log("✅ Sistema de usuários inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro na inicialização do sistema:", error);
  }
};

module.exports = {
  cadastrarUsuario,
  encontrarUsuario,
  procurarUsuarios,
  deletarUsuario,
  modificarDadosUsuario,
  autenticarUsuario,
  loginComGoogle,
  garantirAdminFixo,
  inicializarSistema,
  convidarUsuario,
  aceitarConvite,
};