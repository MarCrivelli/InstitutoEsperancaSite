const Animais = require(
  "../models/Animais"
);

const Postagem = require(
  "../models/Postagem"
);

const {
  verificarConfiguracaoMeta,
  publicarNoFacebook,
  publicarNoInstagram,
} = require("../services/metaService");

const camposDeFiltro = [
  "idade",
  "tipo",
  "sexo",
  "statusVacinacao",
  "statusCastracao",
  "statusAdocao",
  "statusMicrochipagem",
  "statusVermifugacao",
];

const plataformasPermitidas = [
  "facebook",
  "instagram",
];

function montarConsulta(
  filtros = {}
) {
  const consulta = {
    statusVida: {
      $ne: "falecido",
    },
  };

  for (
    const campo of camposDeFiltro
  ) {
    const valor = filtros[campo];

    if (
      Array.isArray(valor) &&
      valor.length
    ) {
      consulta[campo] = {
        $in: valor,
      };
    } else if (
      valor !== undefined &&
      valor !== null &&
      valor !== ""
    ) {
      consulta[campo] = valor;
    }
  }

  return consulta;
}

async function obterImagens({
  animalIds,
  filtros,
}) {
  const consulta =
    animalIds?.length
      ? {
          _id: {
            $in: animalIds,
          },
          statusVida: {
            $ne: "falecido",
          },
        }
      : montarConsulta(filtros);

  const animais =
    await Animais.find(consulta)
      .select("imagemEntrada")
      .limit(10);

  const baseUrl = (
    process.env.PUBLIC_BACKEND_URL ||
    ""
  ).replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error(
      "PUBLIC_BACKEND_URL não configurada."
    );
  }

  return animais
    .filter(
      (animal) =>
        animal.imagemEntrada
    )
    .map(
      (animal) =>
        `${baseUrl}/uploads/${encodeURIComponent(
          animal.imagemEntrada
        )}`
    );
}

async function executarPostagem(
  postagem
) {
  postagem.status = "publicando";
  postagem.erro = null;

  await postagem.save();

  const publicadores = {
    facebook: publicarNoFacebook,
    instagram:
      publicarNoInstagram,
  };

  const resultados = {};
  const erros = [];

  for (
    const plataforma
    of postagem.plataformas
  ) {
    try {
      resultados[plataforma] =
        await publicadores[
          plataforma
        ](postagem);
    } catch (error) {
      erros.push(
        `${plataforma}: ${error.message}`
      );
    }
  }

  postagem.resultados =
    resultados;

  postagem.erro =
    erros.length
      ? erros.join(" | ")
      : null;

  postagem.status =
    erros.length
      ? Object.keys(resultados)
          .length
        ? "parcial"
        : "erro"
      : "publicada";

  await postagem.save();

  return postagem;
}

const obterStatusMeta = (
  _req,
  res
) => {
  return res.json(
    verificarConfiguracaoMeta()
  );
};

const criarPostagem = async (
  req,
  res
) => {
  try {
    const {
      legenda,
      plataformas,
      animalIds,
      filtros,
      agendadaPara,
    } = req.body;

    if (
      !legenda?.trim() ||
      !plataformas?.length
    ) {
      return res
        .status(400)
        .json({
          message:
            "Informe a legenda e a rede social.",
        });
    }

    const plataformasInvalidas =
      plataformas.filter(
        (plataforma) =>
          !plataformasPermitidas.includes(
            plataforma
          )
      );

    if (
      plataformasInvalidas.length
    ) {
      return res
        .status(400)
        .json({
          message:
            "Rede social inválida.",
        });
    }

    const configuracao =
      verificarConfiguracaoMeta();

    const plataformasNaoConfiguradas =
      plataformas.filter(
        (plataforma) =>
          !configuracao[plataforma]
      );

    if (
      plataformasNaoConfiguradas.length
    ) {
      return res
        .status(503)
        .json({
          message:
            `Integração Meta não configurada para: ${
              plataformasNaoConfiguradas.join(
                ", "
              )
            }.`,
        });
    }

    let dataAgendada = null;

    if (agendadaPara) {
      dataAgendada =
        new Date(agendadaPara);

      if (
        Number.isNaN(
          dataAgendada.getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Data de agendamento inválida.",
          });
      }
    }

    const imagens =
      await obterImagens({
        animalIds,
        filtros,
      });

    if (!imagens.length) {
      return res
        .status(400)
        .json({
          message:
            "Nenhum animal com imagem foi selecionado.",
        });
    }

    const postagem =
      await Postagem.create({
        legenda:
          legenda.trim(),
        plataformas,
        imagens,
        agendadaPara:
          dataAgendada,
        criadoPor:
          req.user.id,
      });

    const publicarAgora =
      !dataAgendada ||
      dataAgendada <= new Date();

    if (publicarAgora) {
      await executarPostagem(
        postagem
      );
    }

    return res
      .status(201)
      .json(postagem);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: error.message,
      });
  }
};

const listarPostagens = async (
  _req,
  res
) => {
  try {
    const postagens =
      await Postagem.find()
        .sort({
          createdAt: -1,
        })
        .limit(50);

    return res.json(postagens);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: error.message,
      });
  }
};

const processarAgendadas =
  async (_req, res) => {
    try {
      const postagens =
        await Postagem.find({
          status: "agendada",
          agendadaPara: {
            $lte: new Date(),
          },
        }).limit(10);

      for (
        const postagem
        of postagens
      ) {
        await executarPostagem(
          postagem
        );
      }

      return res.json({
        processadas:
          postagens.length,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: error.message,
        });
    }
  };

module.exports = {
  obterStatusMeta,
  criarPostagem,
  listarPostagens,
  processarAgendadas,
};