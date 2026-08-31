const GRAPH_VERSION =
  process.env.META_GRAPH_API_VERSION || "v24.0";

const GRAPH_URL =
  `https://graph.facebook.com/${GRAPH_VERSION}`;

const obterConfiguracao = () => ({
  pageId: process.env.META_PAGE_ID,
  instagramUserId:
    process.env.META_INSTAGRAM_USER_ID,
  accessToken:
    process.env.META_PAGE_ACCESS_TOKEN,
});

const verificarConfiguracaoMeta = () => {
  const config = obterConfiguracao();

  return {
    facebook: Boolean(
      config.pageId &&
      config.accessToken
    ),

    instagram: Boolean(
      config.instagramUserId &&
      config.accessToken
    ),
  };
};

async function requisitarGraph(
  caminho,
  {
    metodo = "POST",
    parametros = {},
  } = {}
) {
  const { accessToken } =
    obterConfiguracao();

  if (!accessToken) {
    throw new Error(
      "META_PAGE_ACCESS_TOKEN não configurado."
    );
  }

  const corpo = new URLSearchParams({
    ...parametros,
    access_token: accessToken,
  });

  const url =
    metodo === "GET"
      ? `${GRAPH_URL}/${caminho}?${corpo.toString()}`
      : `${GRAPH_URL}/${caminho}`;

  const resposta = await fetch(url, {
    method: metodo,

    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
    },

    body:
      metodo === "GET"
        ? undefined
        : corpo,
  });

  const dados = await resposta
    .json()
    .catch(() => ({}));

  if (!resposta.ok || dados.error) {
    const codigo =
      dados.error?.code
        ? ` (código ${dados.error.code})`
        : "";

    throw new Error(
      `${
        dados.error?.message ||
        "A Meta recusou a publicação."
      }${codigo}`
    );
  }

  return dados;
}

const chamarGraph = (
  caminho,
  parametros
) =>
  requisitarGraph(caminho, {
    parametros,
  });

const esperar = (milissegundos) =>
  new Promise((resolve) =>
    setTimeout(resolve, milissegundos)
  );

async function aguardarContainerInstagram(
  containerId
) {
  for (
    let tentativa = 0;
    tentativa < 10;
    tentativa += 1
  ) {
    const container =
      await requisitarGraph(containerId, {
        metodo: "GET",
        parametros: {
          fields:
            "status_code,status",
        },
      });

    if (
      container.status_code ===
      "FINISHED"
    ) {
      return;
    }

    if (
      ["ERROR", "EXPIRED"].includes(
        container.status_code
      )
    ) {
      throw new Error(
        container.status ||
          "A Meta não conseguiu processar a imagem."
      );
    }

    await esperar(2000);
  }

  throw new Error(
    "A Meta demorou demais para processar a imagem do Instagram."
  );
}

async function publicarNoFacebook({
  legenda,
  imagens,
}) {
  const { pageId } =
    obterConfiguracao();

  if (!pageId) {
    throw new Error(
      "META_PAGE_ID não configurado."
    );
  }

  const fotos = [];

  for (const url of imagens) {
    const foto = await chamarGraph(
      `${pageId}/photos`,
      {
        url,
        published: "false",
      }
    );

    fotos.push({
      media_fbid: foto.id,
    });
  }

  return chamarGraph(
    `${pageId}/feed`,
    {
      message: legenda,
      attached_media:
        JSON.stringify(fotos),
    }
  );
}

async function publicarNoInstagram({
  legenda,
  imagens,
}) {
  const { instagramUserId } =
    obterConfiguracao();

  if (!instagramUserId) {
    throw new Error(
      "META_INSTAGRAM_USER_ID não configurado."
    );
  }

  if (imagens.length > 10) {
    throw new Error(
      "O Instagram aceita no máximo 10 imagens por carrossel."
    );
  }

  let creationId;

  if (imagens.length === 1) {
    const container =
      await chamarGraph(
        `${instagramUserId}/media`,
        {
          image_url: imagens[0],
          caption: legenda,
        }
      );

    creationId = container.id;
  } else {
    const filhos = [];

    for (const url of imagens) {
      const filho =
        await chamarGraph(
          `${instagramUserId}/media`,
          {
            image_url: url,
            is_carousel_item: "true",
          }
        );

      await aguardarContainerInstagram(
        filho.id
      );

      filhos.push(filho.id);
    }

    const container =
      await chamarGraph(
        `${instagramUserId}/media`,
        {
          media_type: "CAROUSEL",
          children: filhos.join(","),
          caption: legenda,
        }
      );

    creationId = container.id;
  }

  await aguardarContainerInstagram(
    creationId
  );

  return chamarGraph(
    `${instagramUserId}/media_publish`,
    {
      creation_id: creationId,
    }
  );
}

module.exports = {
  verificarConfiguracaoMeta,
  publicarNoFacebook,
  publicarNoInstagram,
};