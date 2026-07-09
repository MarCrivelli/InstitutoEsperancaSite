const Usuario = require("../models/Usuarios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

require("dotenv").config();

// ============================================================================
// CONFIGURAÇÕES DO ADMINISTRADOR PRINCIPAL
// ============================================================================

const ADMIN_NOME = process.env.ADMIN_NOME?.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const ADMIN_SENHA = process.env.ADMIN_SENHA;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const obterSegredoJwt = () => {
  if (!process.env.SECRET) {
    throw new Error("SECRET não foi definido no arquivo .env");
  }

  return process.env.SECRET;
};

const obterSegredoConvite = () => {
  if (!process.env.SECRET_CONVITE) {
    throw new Error("SECRET_CONVITE não foi definido no arquivo .env");
  }

  return process.env.SECRET_CONVITE;
};

const gerarTokenUsuario = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nivelDeAcesso: usuario.nivelDeAcesso,
    },
    obterSegredoJwt(),
    {
      expiresIn: "168h",
    },
  );
};

const formatarUsuarioParaResposta = (usuario) => {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    receberEmailEventos: usuario.receberEmailEventos,
    receberMensagensEventos: usuario.receberMensagensEventos,
    nivelDeAcesso: usuario.nivelDeAcesso,
    foto: usuario.foto,
    ativo: usuario.ativo,
  };
};

const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

const validarTelefone = (telefone) => {
  if (!telefone || telefone.trim() === "") {
    return true;
  }

  const phoneRegex = /^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

  return phoneRegex.test(telefone.replace(/\s/g, ""));
};

const limparTelefone = (telefone) => {
  if (!telefone) {
    return null;
  }

  return telefone.replace(/[^\d+()-\s]/g, "").trim();
};

const ehAdministradorPrincipal = (usuario) => {
  if (!usuario || !ADMIN_EMAIL) {
    return false;
  }

  return usuario.email?.toLowerCase().trim() === ADMIN_EMAIL;
};

// ============================================================================
// CONFIGURAÇÃO DO E-MAIL
// ============================================================================

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

// ============================================================================
// GARANTIR ADMINISTRADOR PRINCIPAL
// ============================================================================

const garantirAdminFixo = async () => {
  try {
    if (!ADMIN_NOME) {
      throw new Error("ADMIN_NOME não foi definido no .env");
    }

    if (!ADMIN_EMAIL) {
      throw new Error("ADMIN_EMAIL não foi definido no .env");
    }

    if (!ADMIN_SENHA) {
      throw new Error("ADMIN_SENHA não foi definido no .env");
    }

    let administrador = await Usuario.findOne({
      where: {
        email: ADMIN_EMAIL,
      },
    });

    if (administrador) {
      const dadosParaAtualizar = {};

      if (administrador.nivelDeAcesso !== "administrador") {
        dadosParaAtualizar.nivelDeAcesso = "administrador";
      }

      if (!administrador.ativo) {
        dadosParaAtualizar.ativo = true;
      }

      if (Object.keys(dadosParaAtualizar).length > 0) {
        await administrador.update(dadosParaAtualizar);

        console.log("🔄 Dados do administrador principal atualizados.");
      }

      console.log("✅ Administrador principal já existe no sistema.");

      return administrador;
    }

    const senhaCriptografada = await bcrypt.hash(ADMIN_SENHA, 10);

    administrador = await Usuario.create({
      nome: ADMIN_NOME,
      email: ADMIN_EMAIL,
      senha: senhaCriptografada,
      nivelDeAcesso: "administrador",
      telefone: null,
      receberEmailEventos: false,
      receberMensagensEventos: false,
      ativo: true,
      dataUltimoLogin: null,
    });

    console.log("✅ Administrador principal criado usando os dados do .env.");

    return administrador;
  } catch (error) {
    console.error("❌ Erro ao garantir administrador principal:", error);

    throw error;
  }
};

// ============================================================================
// CADASTRAR USUÁRIO COMUM
// ============================================================================

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

    const usuarioExistente = await Usuario.findOne({
      where: {
        email: emailNormalizado,
      },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        erro: true,
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      senha: senhaCriptografada,
      email: emailNormalizado,
      telefone: limparTelefone(telefone),

      receberEmailEventos: receberEmailEventos !== false,

      receberMensagensEventos: receberMensagensEventos !== false,

      nivelDeAcesso: "usuario",
      ativo: true,
      dataUltimoLogin: new Date(),
    });

    const token = gerarTokenUsuario(novoUsuario);

    return res.status(201).json({
      erro: false,

      mensagem:
        "Cadastro realizado com sucesso! Você foi logado automaticamente.",

      usuario: formatarUsuarioParaResposta(novoUsuario),

      token,

      loginAutomatico: true,
    });
  } catch (erro) {
    console.error("❌ Erro no cadastro:", erro);

    if (erro.name === "SequelizeValidationError") {
      return res.status(400).json({
        erro: true,
        mensagem: erro.errors?.[0]?.message || "Dados inválidos.",
      });
    }

    if (erro.name === "SequelizeUniqueConstraintError") {
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

// ============================================================================
// AUTENTICAR USUÁRIO
// ============================================================================

const autenticarUsuario = async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({
        erro: true,
        mensagem: "E-mail e senha são obrigatórios.",
      });
    }

    const emailNormalizado = email.toLowerCase().trim();

    const usuario = await Usuario.findOne({
      where: {
        email: emailNormalizado,
        ativo: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: true,
        mensagem: "E-mail ou senha incorretos.",
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: true,
        mensagem: "E-mail ou senha incorretos.",
      });
    }

    await usuario.update({
      dataUltimoLogin: new Date(),
    });

    const token = gerarTokenUsuario(usuario);

    return res.json({
      erro: false,
      mensagem: "Login realizado com sucesso!",

      usuario: formatarUsuarioParaResposta(usuario),

      token,
    });
  } catch (erro) {
    console.error("❌ Erro no login:", erro);

    return res.status(500).json({
      erro: true,
      mensagem: "Erro interno do servidor.",
    });
  }
};

// ============================================================================
// LOGIN COM GOOGLE
// ============================================================================

const loginComGoogle = async (req, res) => {
  try {
    const { nome, email, googleId, foto } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        erro: true,
        mensagem: "Nome e e-mail são obrigatórios.",
      });
    }

    const emailNormalizado = email.toLowerCase().trim();

    let usuario = await Usuario.findOne({
      where: {
        email: emailNormalizado,
      },
    });

    if (!usuario) {
      const senhaAleatoria = crypto.randomBytes(32).toString("hex");

      const senhaCriptografada = await bcrypt.hash(senhaAleatoria, 10);

      usuario = await Usuario.create({
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaCriptografada,
        googleId,
        foto,
        receberEmailEventos: true,
        receberMensagensEventos: true,
        nivelDeAcesso: "usuario",
        ativo: true,
        dataUltimoLogin: new Date(),
      });

      console.log("✅ Novo usuário criado via Google:", usuario.email);
    } else {
      if (!usuario.ativo) {
        return res.status(403).json({
          erro: true,
          mensagem: "Esta conta não está ativa no sistema.",
        });
      }

      const atualizacoes = {
        dataUltimoLogin: new Date(),
      };

      if (foto && foto !== usuario.foto) {
        atualizacoes.foto = foto;
      }

      if (googleId && googleId !== usuario.googleId) {
        atualizacoes.googleId = googleId;
      }

      await usuario.update(atualizacoes);

      await usuario.reload();
    }

    const token = gerarTokenUsuario(usuario);

    return res.json({
      erro: false,

      mensagem: "Login com Google realizado com sucesso!",

      usuario: formatarUsuarioParaResposta(usuario),

      token,
    });
  } catch (error) {
    console.error("❌ Erro no login Google:", error);

    return res.status(500).json({
      erro: true,

      mensagem: "Erro interno do servidor: " + error.message,
    });
  }
};

// ============================================================================
// ENCONTRAR USUÁRIO
// ============================================================================

const encontrarUsuario = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido.",
      });
    }

    const usuario = await Usuario.findOne({
      where: { id },

      attributes: [
        "id",
        "nome",
        "email",
        "telefone",
        "receberEmailEventos",
        "receberMensagensEventos",
        "nivelDeAcesso",
        "foto",
        "ativo",
        "dataUltimoLogin",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado.",
      });
    }

    return res.json({
      erro: false,
      usuario,
    });
  } catch (erro) {
    console.error("❌ Erro ao buscar usuário:", erro);

    return res.status(500).json({
      erro: true,

      mensagem: "Ocorreu um erro ao buscar o usuário.",
    });
  }
};

// ============================================================================
// PROCURAR TODOS OS USUÁRIOS
// ============================================================================

const procurarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        "id",
        "nome",
        "email",
        "telefone",
        "receberEmailEventos",
        "receberMensagensEventos",
        "nivelDeAcesso",
        "foto",
        "ativo",
        "dataUltimoLogin",
        "createdAt",
        "updatedAt",
      ],

      order: [["createdAt", "DESC"]],
    });

    /*
      O frontend não precisa conhecer ADMIN_EMAIL.

      O backend simplesmente informa se a conta
      é protegida ou não.
    */

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

// ============================================================================
// DELETAR USUÁRIO
// ============================================================================

const deletarUsuario = async (req, res) => {
  try {
    const idUsuarioParaExcluir = Number(req.params.id);

    if (!Number.isInteger(idUsuarioParaExcluir)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido.",
      });
    }

    const usuario = await Usuario.findOne({
      where: {
        id: idUsuarioParaExcluir,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado.",
      });
    }

    /*
      O administrador principal, definido exclusivamente
      pelo ADMIN_EMAIL do .env, nunca pode ser excluído.
    */

    if (ehAdministradorPrincipal(usuario)) {
      return res.status(403).json({
        erro: true,

        mensagem: "O administrador principal do sistema não pode ser excluído.",
      });
    }

    const idUsuarioLogado = Number(req.user.id);

    const ehPropriaConta = idUsuarioLogado === idUsuarioParaExcluir;

    const ehAdministrador = req.user.nivelDeAcesso === "administrador";

    /*
      Um usuário pode excluir a própria conta.

      Somente um administrador pode excluir
      a conta de outra pessoa.
    */

    if (!ehPropriaConta && !ehAdministrador) {
      return res.status(403).json({
        erro: true,

        mensagem: "Você não tem permissão para excluir esta conta.",
      });
    }

    await usuario.destroy();

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

// ============================================================================
// MODIFICAR DADOS DO USUÁRIO
// ============================================================================

const modificarDadosUsuario = async (req, res) => {
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

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: true,
        mensagem: "ID inválido.",
      });
    }

    const usuarioExistente = await Usuario.findOne({
      where: { id },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        erro: true,
        mensagem: "Usuário não encontrado.",
      });
    }

    /*
      Não bloqueamos todas as alterações no admin principal.

      Porém, seu e-mail e nível de administrador
      continuam protegidos.
    */

    const usuarioEhAdminPrincipal = ehAdministradorPrincipal(usuarioExistente);

    const dadosParaAtualizar = {};

    if (nome !== undefined && nome.trim()) {
      dadosParaAtualizar.nome = nome.trim();
    }

    if (email !== undefined) {
      const emailNormalizado = email.toLowerCase().trim();

      if (usuarioEhAdminPrincipal && emailNormalizado !== ADMIN_EMAIL) {
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

      const { Op } = require("sequelize");

      const emailJaExiste = await Usuario.findOne({
        where: {
          email: emailNormalizado,

          id: {
            [Op.ne]: id,
          },
        },
      });

      if (emailJaExiste) {
        return res.status(400).json({
          erro: true,

          mensagem: "Este e-mail já está sendo usado por outro usuário.",
        });
      }

      dadosParaAtualizar.email = emailNormalizado;
    }

    if (senha !== undefined && senha !== "") {
      if (senha.length < 6) {
        return res.status(400).json({
          erro: true,

          mensagem: "A senha deve ter pelo menos 6 caracteres.",
        });
      }

      dadosParaAtualizar.senha = await bcrypt.hash(senha, 10);
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

      if (usuarioEhAdminPrincipal && nivelDeAcesso !== "administrador") {
        return res.status(403).json({
          erro: true,

          mensagem:
            "O administrador principal deve permanecer como administrador.",
        });
      }

      dadosParaAtualizar.nivelDeAcesso = nivelDeAcesso;
    }

    if (telefone !== undefined) {
      if (telefone && !validarTelefone(telefone)) {
        return res.status(400).json({
          erro: true,

          mensagem: "Telefone deve estar em um formato válido.",
        });
      }

      dadosParaAtualizar.telefone = limparTelefone(telefone);
    }

    if (receberEmailEventos !== undefined) {
      dadosParaAtualizar.receberEmailEventos = Boolean(receberEmailEventos);
    }

    if (receberMensagensEventos !== undefined) {
      dadosParaAtualizar.receberMensagensEventos = Boolean(
        receberMensagensEventos,
      );
    }

    if (foto !== undefined) {
      dadosParaAtualizar.foto = foto;
    }

    if (googleId !== undefined) {
      dadosParaAtualizar.googleId = googleId;
    }

    if (Object.keys(dadosParaAtualizar).length === 0) {
      return res.status(400).json({
        erro: true,
        mensagem: "Nenhum dado para atualizar.",
      });
    }

    await usuarioExistente.update(dadosParaAtualizar);

    await usuarioExistente.reload();

    return res.json({
      erro: false,

      mensagem: "Usuário alterado com sucesso!",

      usuario: formatarUsuarioParaResposta(usuarioExistente),
    });
  } catch (erro) {
    console.error("❌ Erro ao alterar usuário:", erro);

    if (erro.name === "SequelizeValidationError") {
      return res.status(400).json({
        erro: true,

        mensagem: erro.errors?.[0]?.message || "Dados inválidos.",
      });
    }

    if (erro.name === "SequelizeUniqueConstraintError") {
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

// ============================================================================
// ENVIAR CONVITE POR E-MAIL
// ============================================================================

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

    if (!validarEmail(emailNormalizado)) {
      return res.status(400).json({
        erro: true,

        mensagem: "Por favor, insira um e-mail válido.",
      });
    }

    const niveisPermitidos = [
      "administrador",
      "subAdministrador",
      "contribuinte",
    ];

    if (!niveisPermitidos.includes(nivelDeAcesso)) {
      return res.status(400).json({
        erro: true,

        mensagem: "O nível de acesso selecionado é inválido.",
      });
    }

    const usuarioExistente = await Usuario.findOne({
      where: {
        email: emailNormalizado,
      },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        erro: true,

        mensagem: "Já existe um usuário cadastrado com este e-mail.",
      });
    }

    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL não foi definido no .env");
    }

    const tokenConvite = jwt.sign(
      {
        email: emailNormalizado,
        nivelDeAcesso,
        tipo: "convite-administrativo",
      },

      obterSegredoConvite(),

      {
        expiresIn: "24h",
      },
    );

    /*
      Como seu frontend usa HashRouter,
      o link utiliza #/convite.
    */

    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

    const urlConvite =
      `${frontendUrl}/#/convite?token=` + encodeURIComponent(tokenConvite);

    const transportador = criarTransportadorEmail();

    await transportador.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Instituto Esperança - A Voz dos Animais" <${process.env.SMTP_USER}>`,

      to: emailNormalizado,

      subject: "Convite para acessar o Instituto Esperança",

      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">

          <head>
            <meta charset="UTF-8">
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            >

            <title>
              Convite para acessar o Instituto Esperança
            </title>
          </head>

          <body
            style="
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
              font-family: Arial, Helvetica, sans-serif;
            "
          >

            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px 25px;
                border-radius: 12px;
                text-align: center;
                box-sizing: border-box;
              "
            >

              <h1
                style="
                  color: #333333;
                  margin-top: 0;
                  margin-bottom: 20px;
                "
              >
                Você recebeu um convite
              </h1>

              <p
                style="
                  color: #555555;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Você foi convidado para acessar a área administrativa
                do Instituto Esperança - A Voz dos Animais.
              </p>

              <p
                style="
                  color: #555555;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Clique no botão abaixo para criar sua conta
                e entrar automaticamente:
              </p>

              <a
                href="${urlConvite}"

                style="
                  display: inline-block;
                  margin-top: 20px;
                  padding: 15px 30px;
                  background-color: #2e7d32;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-size: 16px;
                  font-weight: bold;
                "
              >
                Acessar minha conta
              </a>

              <p
                style="
                  margin-top: 30px;
                  color: #777777;
                  font-size: 13px;
                  line-height: 1.5;
                "
              >
                Este convite é válido por 24 horas.
                Após a criação da conta, o mesmo convite
                não poderá ser utilizado novamente.
              </p>

            </div>

          </body>

        </html>
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

      mensagem:
        "Não foi possível enviar o convite. Verifique as configurações de e-mail do servidor.",
    });
  }
};

// ============================================================================
// ACEITAR CONVITE E FAZER LOGIN AUTOMÁTICO
// ============================================================================

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
    } catch (error) {
      return res.status(401).json({
        erro: true,

        mensagem: "Este convite é inválido ou expirou.",
      });
    }

    if (dadosConvite.tipo !== "convite-administrativo") {
      return res.status(401).json({
        erro: true,
        mensagem: "Tipo de convite inválido.",
      });
    }

    const email = dadosConvite.email.toLowerCase().trim();

    const nivelDeAcesso = dadosConvite.nivelDeAcesso;

    const niveisPermitidos = [
      "administrador",
      "subAdministrador",
      "contribuinte",
    ];

    if (!niveisPermitidos.includes(nivelDeAcesso)) {
      return res.status(400).json({
        erro: true,

        mensagem: "O nível de acesso deste convite é inválido.",
      });
    }

    const usuarioExistente = await Usuario.findOne({
      where: { email },
    });

    /*
      O usuário já existir significa que o convite
      já foi utilizado ou que esse e-mail já tinha conta.
    */

    if (usuarioExistente) {
      return res.status(409).json({
        erro: true,

        mensagem:
          "Este convite já foi utilizado ou já existe uma conta cadastrada com este e-mail.",
      });
    }

    /*
      Criamos uma senha aleatória internamente.

      Ela nunca é mostrada ao usuário e não é enviada
      pelo navegador.
    */

    const senhaAleatoria = crypto.randomBytes(48).toString("hex");

    const senhaCriptografada = await bcrypt.hash(senhaAleatoria, 10);

    const novoUsuario = await Usuario.create({
      nome: email.split("@")[0],
      email,
      senha: senhaCriptografada,
      nivelDeAcesso,
      telefone: null,
      receberEmailEventos: true,
      receberMensagensEventos: true,
      ativo: true,
      dataUltimoLogin: new Date(),
    });

    const tokenAutenticacao = gerarTokenUsuario(novoUsuario);

    return res.status(201).json({
      erro: false,

      mensagem: "Convite aceito. Login realizado com sucesso.",

      token: tokenAutenticacao,

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

// ============================================================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================================================

const inicializarSistema = async () => {
  try {
    console.log("🔄 Inicializando sistema de usuários...");

    await garantirAdminFixo();

    console.log("✅ Sistema de usuários inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro na inicialização do sistema:", error);
  }
};

inicializarSistema();

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

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
