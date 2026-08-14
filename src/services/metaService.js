const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v24.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

const obterConfiguracao = () => ({
  pageId: process.env.META_PAGE_ID,
  instagramUserId: process.env.META_INSTAGRAM_USER_ID,
  accessToken: process.env.META_PAGE_ACCESS_TOKEN,
});

const verificarConfiguracaoMeta = () => {
  const config = obterConfiguracao();
  return {
    facebook: Boolean(config.pageId && config.accessToken),
    instagram: Boolean(config.instagramUserId && config.accessToken),
  };
};

async function chamarGraph(caminho, parametros) {
  const { accessToken } = obterConfiguracao();
  const corpo = new URLSearchParams({ ...parametros, access_token: accessToken });
  const resposta = await fetch(`${GRAPH_URL}/${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: corpo,
  });
  const dados = await resposta.json();
  if (!resposta.ok || dados.error) {
    throw new Error(dados.error?.message || "A Meta recusou a publicação.");
  }
  return dados;
}

async function publicarNoFacebook({ legenda, imagens }) {
  const { pageId } = obterConfiguracao();
  if (!pageId) throw new Error("META_PAGE_ID não configurado.");

  const fotos = [];
  for (const url of imagens) {
    const foto = await chamarGraph(`${pageId}/photos`, {
      url,
      published: "false",
    });
    fotos.push({ media_fbid: foto.id });
  }

  return chamarGraph(`${pageId}/feed`, {
    message: legenda,
    attached_media: JSON.stringify(fotos),
  });
}

async function publicarNoInstagram({ legenda, imagens }) {
  const { instagramUserId } = obterConfiguracao();
  if (!instagramUserId) {
    throw new Error("META_INSTAGRAM_USER_ID não configurado.");
  }
  if (imagens.length > 10) {
    throw new Error("O Instagram aceita no máximo 10 imagens por carrossel.");
  }

  let creationId;
  if (imagens.length === 1) {
    const container = await chamarGraph(`${instagramUserId}/media`, {
      image_url: imagens[0],
      caption: legenda,
    });
    creationId = container.id;
  } else {
    const filhos = [];
    for (const url of imagens) {
      const filho = await chamarGraph(`${instagramUserId}/media`, {
        image_url: url,
        is_carousel_item: "true",
      });
      filhos.push(filho.id);
    }
    const container = await chamarGraph(`${instagramUserId}/media`, {
      media_type: "CAROUSEL",
      children: filhos.join(","),
      caption: legenda,
    });
    creationId = container.id;
  }

  return chamarGraph(`${instagramUserId}/media_publish`, {
    creation_id: creationId,
  });
}

module.exports = {
  verificarConfiguracaoMeta,
  publicarNoFacebook,
  publicarNoInstagram,
};
