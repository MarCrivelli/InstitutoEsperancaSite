const mongoose = require("mongoose");
const Animais = require("../models/Animais");
const CarrosselAnimais = require("../models/CarrosselDeAnimais");

const validarId = (id) => mongoose.isValidObjectId(id);

const verificarAssociacoes = async () => {
  try {
    const count = await CarrosselAnimais.countDocuments();

    const testeAssociacao = await CarrosselAnimais.findOne().populate({
      path: "animalId",
      select:
        "nome imagemEntrada imagemSaida descricaoEntrada descricaoSaida",
    });

    console.log(
      `🔍 [VERIFY] Total de registros no carrossel: ${count}`
    );

    console.log(
      `✅ [VERIFY] Referência Mongoose funcionando: ${
        testeAssociacao ? "SIM" : "sem registros para testar"
      }`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ [VERIFY] Erro nas referências:",
      error.message
    );

    return false;
  }
};

const listarAnimaisParaSelecao = async (req, res) => {
  try {
    const animaisNoCarrossel = await CarrosselAnimais.find()
      .select("animalId")
      .lean();

    const idsNoCarrossel = animaisNoCarrossel.map(
      (item) => item.animalId
    );

    const animaisDisponiveis = await Animais.find({
      _id: {
        $nin: idsNoCarrossel,
      },

      nome: {
        $nin: [null, ""],
      },

      descricaoEntrada: {
        $nin: [null, ""],
      },

      descricaoSaida: {
        $nin: [null, ""],
      },

      imagemEntrada: {
        $nin: [null, ""],
      },

      imagemSaida: {
        $nin: [null, ""],
      },
    })
      .select(
        "nome descricaoEntrada descricaoSaida imagemEntrada imagemSaida"
      )
      .sort({
        nome: 1,
      });

    return res.status(200).json(animaisDisponiveis);
  } catch (error) {
    console.error("❌ [SELECAO] Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar animais para seleção",
      error: error.message,
    });
  }
};

const buscarAnimalPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido",
      });
    }

    const animal = await Animais.findById(id).select(
      "nome imagemEntrada imagemSaida descricaoEntrada descricaoSaida"
    );

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    return res.status(200).json(animal);
  } catch (error) {
    console.error("❌ [BY_ID] Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar animal",
      error: error.message,
    });
  }
};

const adicionarAnimalAoCarrossel = async (req, res) => {
  try {
    const { animalId, descricaoSaida } = req.body;

    if (!validarId(animalId)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido",
      });
    }

    const animal = await Animais.findById(animalId);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    const existe = await CarrosselAnimais.findOne({
      animalId,
    });

    if (existe) {
      return res.status(400).json({
        success: false,
        message: "Animal já está no carrossel",
      });
    }

    const ultimo = await CarrosselAnimais.findOne()
      .sort({
        ordem: -1,
      })
      .select("ordem");

    const novaOrdem = ultimo ? ultimo.ordem + 1 : 1;

    const novoItem = await CarrosselAnimais.create({
      animalId,
      descricaoSaida:
        descricaoSaida?.trim() || animal.descricaoSaida,
      ordem: novaOrdem,
    });

    return res.status(201).json({
      success: true,
      message: "Animal adicionado ao carrossel com sucesso",
      data: novoItem,
    });
  } catch (error) {
    console.error("❌ [ADD] Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao adicionar animal ao carrossel",
      error: error.message,
    });
  }
};

const listarAnimaisDoCarrossel = async (req, res) => {
  try {
    await verificarAssociacoes();

    const animaisCarrossel = await CarrosselAnimais.find()
      .populate({
        path: "animalId",
        select:
          "nome imagemEntrada imagemSaida descricaoEntrada descricaoSaida",
      })
      .sort({
        ordem: 1,
      });

    const dadosProcessados = animaisCarrossel
      .filter((item) => item.animalId)
      .map((item) => {
        const animal = item.animalId;

        return {
          id: item.id,
          animalId: animal.id,
          descricaoSaida:
            item.descricaoSaida || animal.descricaoSaida,
          ordem: item.ordem,

          animal: {
            id: animal.id,
            nome: animal.nome || "Animal sem nome",
            imagemEntrada: animal.imagemEntrada || null,
            imagemSaida: animal.imagemSaida || null,

            descricaoEntrada:
              animal.descricaoEntrada ||
              "Sem descrição de entrada",

            descricaoSaida:
              item.descricaoSaida ||
              animal.descricaoSaida ||
              "Sem descrição de saída",
          },
        };
      });

    return res.status(200).json({
      success: true,
      data: dadosProcessados,
    });
  } catch (error) {
    console.error("❌ [LIST] Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar animais do carrossel",
      error: error.message,
      data: [],
    });
  }
};

const removerAnimalDoCarrossel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do item do carrossel inválido",
      });
    }

    const itemRemovido =
      await CarrosselAnimais.findByIdAndDelete(id);

    if (!itemRemovido) {
      return res.status(404).json({
        success: false,
        message: "Item do carrossel não encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Animal removido do carrossel com sucesso",
    });
  } catch (error) {
    console.error("❌ [REMOVE] Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao remover animal do carrossel",
      error: error.message,
    });
  }
};

const atualizarDescricaoSaida = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricaoSaida } = req.body;

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do item do carrossel inválido",
      });
    }

    if (!descricaoSaida || descricaoSaida.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Descrição de saída é obrigatória",
      });
    }

    const carrosselAnimal =
      await CarrosselAnimais.findByIdAndUpdate(
        id,
        {
          descricaoSaida: descricaoSaida.trim(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!carrosselAnimal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado no carrossel",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Descrição de saída atualizada com sucesso",
      data: carrosselAnimal,
    });
  } catch (error) {
    console.error("❌ [UPDATE] Erro:", error);

    return res.status(500).json({
      success: false,
      message:
        "Erro interno do servidor ao atualizar descrição",
      error: error.message,
    });
  }
};

module.exports = {
  listarAnimaisParaSelecao,
  buscarAnimalPorId,
  adicionarAnimalAoCarrossel,
  listarAnimaisDoCarrossel,
  removerAnimalDoCarrossel,
  atualizarDescricaoSaida,
};
