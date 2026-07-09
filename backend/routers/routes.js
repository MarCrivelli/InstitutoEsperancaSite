const express = require("express");
const routes = express.Router();
const multer = require("multer");
const path = require("path");

// ============================================================================
// CONTROLLERS
// ============================================================================

const animalController = require(
  "../controllers/animalController",
);

const carrosselAnimaisController = require(
  "../controllers/carrosselDeAnimaisController",
);

const doadorController = require(
  "../controllers/doadorController",
);

const avisoController = require(
  "../controllers/avisoController",
);

const usuarioController = require(
  "../controllers/usuarioController",
);

const documentosController = require(
  "../controllers/documentosController",
);

// ============================================================================
// MIDDLEWARES DE AUTENTICAÇÃO
// ============================================================================

const {
  verificarToken,
  apenasAdministrador,
  administradorOuSub,
  contribuinteOuSuperior,
  verificarProprioUsuarioOuAdmin,
} = require("../middlewares/auth");

// ============================================================================
// DEBUG
// ============================================================================

routes.use((req, res, next) => {
  console.log(
    `🔍 [${new Date().toISOString()}] Requisição: ${req.method} ${req.path}`,
  );

  if (
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    console.log("📦 Body:", req.body);
  }

  next();
});

// ============================================================================
// MULTER
// ============================================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.join(__dirname, "../uploads"),
    );
  },

  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage,
});

// ============================================================================
// ROTA DE TESTE
// ============================================================================

routes.get("/teste", (req, res) => {
  res.json({
    erro: false,

    mensagem:
      "Servidor funcionando corretamente!",

    timestamp: new Date().toISOString(),

    permissoes: {
      administrador: {
        descricao:
          "Acesso total a todas as funcionalidades",

        pode: [
          "Gerenciar usuários",
          "Gerenciar animais",
          "Gerenciar carrossel",
          "Gerenciar doadores",
          "Gerenciar avisos",
          "Gerenciar documentos",
          "Visualizar todas as informações",
        ],
      },

      subAdministrador: {
        descricao:
          "Acesso administrativo com algumas limitações",

        pode: [
          "Gerenciar animais",
          "Gerenciar carrossel",
          "Gerenciar doadores",
          "Editar usuários de nível inferior",
          "Visualizar informações administrativas",
        ],

        nao_pode: [
          "Gerenciar avisos exclusivos de administrador",
          "Excluir outros usuários",
          "Editar administradores",
        ],
      },

      contribuinte: {
        descricao:
          "Acesso limitado a visualização e próprio perfil",

        pode: [
          "Visualizar animais",
          "Visualizar carrossel",
          "Visualizar doadores",
          "Visualizar avisos",
          "Editar próprio perfil",
          "Excluir própria conta",
        ],
      },

      usuario: {
        descricao:
          "Usuário básico",

        pode: [
          "Visualizar conteúdo público",
          "Editar próprio perfil",
          "Excluir própria conta",
        ],
      },
    },
  });
});

// ============================================================================
// ROTAS PÚBLICAS DE AUTENTICAÇÃO
// ============================================================================

routes.post(
  "/cadastro",
  usuarioController.cadastrarUsuario,
);

routes.post(
  "/login",
  usuarioController.autenticarUsuario,
);

routes.post(
  "/login-google",
  usuarioController.loginComGoogle,
);

/*
  Esta rota é pública porque a autenticação ocorre
  usando o token temporário enviado no próprio convite.
*/

routes.post(
  "/convites/aceitar",
  usuarioController.aceitarConvite,
);

// ============================================================================
// VERIFICAÇÃO DE TOKEN
// ============================================================================

routes.get(
  "/verificar-token",
  verificarToken,

  (req, res) => {
    res.json({
      erro: false,
      valido: true,

      usuario: {
        id: req.user.id,
        email: req.user.email,
        nivelDeAcesso:
          req.user.nivelDeAcesso,
      },
    });
  },
);

// ============================================================================
// ROTAS DE USUÁRIOS
// ============================================================================

/*
  IMPORTANTE:

  /usuarios/convidar deve ficar antes de /usuarios/:id.

  Assim, o Express não interpreta "convidar"
  como se fosse o valor do parâmetro :id.
*/

routes.post(
  "/usuarios/convidar",
  verificarToken,
  apenasAdministrador,
  usuarioController.convidarUsuario,
);

// ADMINISTRADOR: listar usuários

routes.get(
  "/usuarios",
  verificarToken,
  apenasAdministrador,
  usuarioController.procurarUsuarios,
);

// PRÓPRIO USUÁRIO OU ADMINISTRADOR

routes.get(
  "/usuarios/:id",
  verificarToken,
  verificarProprioUsuarioOuAdmin,
  usuarioController.encontrarUsuario,
);

// PRÓPRIO USUÁRIO OU ADMINISTRADOR

routes.put(
  "/usuarios/:id",
  verificarToken,
  verificarProprioUsuarioOuAdmin,
  usuarioController.modificarDadosUsuario,
);

/*
  CORREÇÃO:

  Antes esta rota usava apenasAdministrador.

  Agora qualquer usuário pode chegar ao controller
  quando tenta acessar a própria conta.

  O próprio controller também verifica se:

  - é a própria conta; ou
  - quem está logado é administrador.

  Portanto, existe proteção tanto no middleware
  quanto no controller.
*/

routes.delete(
  "/usuarios/:id",
  verificarToken,
  verificarProprioUsuarioOuAdmin,
  usuarioController.deletarUsuario,
);

// ============================================================================
// ROTAS DO CARROSSEL
// ============================================================================

routes.get(
  "/carrossel/animais/selecao",

  (req, res, next) => {
    console.log(
      "🎠 Rota /carrossel/animais/selecao chamada",
    );

    carrosselAnimaisController.listarAnimaisParaSelecao(
      req,
      res,
      next,
    );
  },
);

routes.get(
  "/carrossel/animais/:id",

  (req, res, next) => {
    console.log(
      `🎠 Rota /carrossel/animais/${req.params.id} chamada`,
    );

    carrosselAnimaisController.buscarAnimalPorId(
      req,
      res,
      next,
    );
  },
);

routes.get(
  "/carrossel/animais",

  (req, res, next) => {
    console.log(
      "🎠 Rota /carrossel/animais chamada",
    );

    carrosselAnimaisController.listarAnimaisDoCarrossel(
      req,
      res,
      next,
    );
  },
);

routes.post(
  "/carrossel/animais",
  verificarToken,
  administradorOuSub,

  (req, res, next) => {
    console.log(
      "🎠 Rota POST /carrossel/animais chamada",
    );

    carrosselAnimaisController.adicionarAnimalAoCarrossel(
      req,
      res,
      next,
    );
  },
);

routes.delete(
  "/carrossel/animais/:id",
  verificarToken,
  administradorOuSub,

  (req, res, next) => {
    console.log(
      `🎠 Rota DELETE /carrossel/animais/${req.params.id} chamada`,
    );

    carrosselAnimaisController.removerAnimalDoCarrossel(
      req,
      res,
      next,
    );
  },
);

routes.put(
  "/carrossel/animais/:id",
  verificarToken,
  administradorOuSub,

  (req, res, next) => {
    console.log(
      `🎠 Rota PUT /carrossel/animais/${req.params.id} chamada`,
    );

    carrosselAnimaisController.atualizarDescricaoSaida(
      req,
      res,
      next,
    );
  },
);

// ============================================================================
// ROTAS DE ANIMAIS
// ============================================================================

routes.get(
  "/animais",
  animalController.procurarAnimais,
);

routes.get(
  "/animais/:id",
  animalController.buscarAnimalPorId,
);

routes.post(
  "/animais",
  verificarToken,
  administradorOuSub,
  upload.single("imagem"),
  animalController.cadastrarAnimal,
);

routes.put(
  "/animais/:id",
  verificarToken,
  administradorOuSub,
  animalController.atualizarAnimal,
);

routes.put(
  "/animais/:id/imagem",
  verificarToken,
  administradorOuSub,
  upload.single("imagem"),
  animalController.atualizarImagemEntrada,
);

routes.put(
  "/animais/:id/imagem-saida",
  verificarToken,
  administradorOuSub,
  upload.single("imagemSaida"),
  animalController.atualizarImagemSaida,
);

routes.put(
  "/animais/:id/descricao-saida",
  verificarToken,
  administradorOuSub,
  animalController.atualizarDescricaoSaida,
);

// ============================================================================
// ROTAS DE DOADORES
// ============================================================================

routes.get(
  "/doadores",
  doadorController.listarDoadores,
);

routes.get(
  "/doadores/:id",
  doadorController.buscarDoadorPorId,
);

routes.post(
  "/doadores",
  verificarToken,
  administradorOuSub,
  upload.single("imagem"),
  doadorController.cadastrarDoador,
);

routes.put(
  "/doadores/:id",
  verificarToken,
  administradorOuSub,
  upload.single("imagem"),
  doadorController.atualizarDoador,
);

routes.delete(
  "/doadores/:id",
  verificarToken,
  apenasAdministrador,
  doadorController.deletarDoador,
);

// ============================================================================
// ROTAS DE AVISOS
// ============================================================================

routes.get(
  "/avisos",
  avisoController.listarAvisos,
);

routes.get(
  "/avisos/:id",
  avisoController.buscarAvisoPorId,
);

routes.post(
  "/avisos",
  verificarToken,
  apenasAdministrador,
  avisoController.criarAviso,
);

routes.put(
  "/avisos/:id",
  verificarToken,
  apenasAdministrador,
  avisoController.atualizarAviso,
);

routes.delete(
  "/avisos/:id",
  verificarToken,
  apenasAdministrador,
  avisoController.deletarAviso,
);

// ============================================================================
// ROTAS DE DOCUMENTOS
// ============================================================================

routes.get(
  "/documentos",
  verificarToken,
  administradorOuSub,
  documentosController.listarDocumentos,
);

routes.post(
  "/documentos",
  verificarToken,
  administradorOuSub,
  upload.single("arquivo"),
  documentosController.cadastrarDocumento,
);

routes.delete(
  "/documentos/:id",
  verificarToken,
  administradorOuSub,
  documentosController.deletarDocumento,
);

// ============================================================================
// ROTA NÃO ENCONTRADA
// ============================================================================

routes.use("*", (req, res) => {
  console.log(
    `❌ Rota não encontrada: ${req.method} ${req.originalUrl}`,
  );

  return res.status(404).json({
    erro: true,

    mensagem:
      `Rota ${req.method} ${req.originalUrl} não encontrada`,

    timestamp: new Date().toISOString(),
  });
});

module.exports = routes;