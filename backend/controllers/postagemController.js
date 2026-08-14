const Animais = require("../models/Animais");
const Postagem = require("../models/Postagem");
const {
  verificarConfiguracaoMeta,
  publicarNoFacebook,
  publicarNoInstagram,
} = require("../services/metaService");

const camposDeFiltro = [
  "idade", "tipo", "sexo", "statusVacinacao", "statusCastracao",
  "statusAdocao", "statusMicrochipagem", "statusVermifugacao",
];

function montarConsulta(filtros = {}) {
  const consulta = { statusVida: { $ne: "falecido" } };
  for (const campo of camposDeFiltro) {
    const valor = filtros[campo];
    if (Array.isArray(valor) && valor.length) consulta[campo] = { $in: valor };
    else if (valor !== undefined && valor !== null && valor !== "") consulta[campo] = valor;
  }
  return consulta;
}

async function obterImagens({ animalIds, filtros }) {
  const consulta = animalIds?.length
    ? { _id: { $in: animalIds }, statusVida: { $ne: "falecido" } }
    : montarConsulta(filtros);
  const animais = await Animais.find(consulta).select("imagemEntrada").limit(10);
  const baseUrl = (process.env.PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
  if (!baseUrl) throw new Error("PUBLIC_BACKEND_URL não configurada.");
  return animais
    .filter((animal) => animal.imagemEntrada)
    .map((animal) => `${baseUrl}/uploads/${encodeURIComponent(animal.imagemEntrada)}`);
}

async function executarPostagem(postagem) {
  postagem.status = "publicando";
  postagem.erro = null;
  await postagem.save();
  try {
    const resultados = {};
    if (postagem.plataformas.includes("facebook")) {
      resultados.facebook = await publicarNoFacebook(postagem);
    }
    if (postagem.plataformas.includes("instagram")) {
      resultados.instagram = await publicarNoInstagram(postagem);
    }
    postagem.resultados = resultados;
    postagem.status = "publicada";
  } catch (error) {
    postagem.status = "erro";
    postagem.erro = error.message;
  }
  await postagem.save();
  return postagem;
}

const obterStatusMeta = (_req, res) => res.json(verificarConfiguracaoMeta());

const criarPostagem = async (req, res) => {
  try {
    const { legenda, plataformas, animalIds, filtros, agendadaPara } = req.body;
    if (!legenda?.trim() || !plataformas?.length) {
      return res.status(400).json({ message: "Informe a legenda e a rede social." });
    }
    const imagens = await obterImagens({ animalIds, filtros });
    if (!imagens.length) {
      return res.status(400).json({ message: "Nenhum animal com imagem foi selecionado." });
    }
    const postagem = await Postagem.create({
      legenda: legenda.trim(), plataformas, imagens,
      agendadaPara: agendadaPara || null,
      criadoPor: req.user.id,
    });
    const publicarAgora = !agendadaPara || new Date(agendadaPara) <= new Date();
    if (publicarAgora) await executarPostagem(postagem);
    return res.status(201).json(postagem);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listarPostagens = async (_req, res) => {
  const postagens = await Postagem.find().sort({ createdAt: -1 }).limit(50);
  res.json(postagens);
};

const processarAgendadas = async (_req, res) => {
  const postagens = await Postagem.find({
    status: "agendada",
    agendadaPara: { $lte: new Date() },
  }).limit(10);
  for (const postagem of postagens) await executarPostagem(postagem);
  res.json({ processadas: postagens.length });
};

module.exports = { obterStatusMeta, criarPostagem, listarPostagens, processarAgendadas };
