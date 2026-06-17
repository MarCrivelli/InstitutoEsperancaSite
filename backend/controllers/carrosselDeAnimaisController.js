const Animais = require("../models/Animais");
const CarrosselAnimais = require("../models/CarrosselDeAnimais");

const verificarAssociacoes = async () => {
  try {
    const count = await CarrosselAnimais.count();
    console.log(`🔍 [VERIFY] Total de registros em CarrosselAnimais: ${count}`);

    const testeAssociacao = await CarrosselAnimais.findOne({
      include: [
        {
          model: Animais,
          as: "animal",
          required: false,
        },
      ],
    });

    console.log(`✅ [VERIFY] Associações funcionando: ${!!testeAssociacao}`);
    return true;
  } catch (error) {
    console.error(`❌ [VERIFY] Erro nas associações:`, error.message);
    return false;
  }
};

const listarAnimaisParaSelecao = async (req, res) => {
  try {
    const todosAnimais = await Animais.findAll({
      attributes: [
        "id",
        "nome",
        "descricaoEntrada",
        "descricaoSaida",
        "imagemEntrada",
        "imagemSaida",
      ],
      order: [["nome", "ASC"]],
    });

    const animaisNoCarrossel = await CarrosselAnimais.findAll({
      attributes: ["animalId"],
    });

    const idsNoCarrossel = animaisNoCarrossel.map((item) => item.animalId);

    const animaisDisponiveis = todosAnimais.filter((animal) => {
      const naoEstaNoCarrossel = !idsNoCarrossel.includes(animal.id);

      const temDadosCompletos =
        !!animal.nome &&
        !!animal.descricaoEntrada &&
        !!animal.descricaoSaida &&
        !!animal.imagemEntrada &&
        !!animal.imagemSaida;

      return naoEstaNoCarrossel && temDadosCompletos;
    });

    res.status(200).json(animaisDisponiveis);
  } catch (error) {
    console.error("❌ [SELECAO] Erro:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar animais para seleção",
      error: error.message,
    });
  }
};

const buscarAnimalPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const animal = await Animais.findByPk(id, {
      attributes: [
        "id",
        "nome",
        "imagemEntrada",
        "imagemSaida",
        "descricaoEntrada",
        "descricaoSaida",
      ],
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    res.status(200).json(animal);
  } catch (error) {
    console.error("❌ [BY_ID] Erro:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar animal",
      error: error.message,
    });
  }
};

const adicionarAnimalAoCarrossel = async (req, res) => {
  try {
    const { animalId, descricaoSaida } = req.body;

    const animal = await Animais.findByPk(animalId);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    const existe = await CarrosselAnimais.findOne({ where: { animalId } });
    if (existe) {
      return res.status(400).json({
        success: false,
        message: "Animal já está no carrossel",
      });
    }

    const ultimo = await CarrosselAnimais.findOne({
      order: [["ordem", "DESC"]],
    });
    const novaOrdem = ultimo ? ultimo.ordem + 1 : 1;

    const novoItem = await CarrosselAnimais.create({
      animalId,
      descricaoSaida: descricaoSaida || animal.descricaoSaida,
      ordem: novaOrdem,
    });

    res.status(201).json({
      success: true,
      message: "Animal adicionado ao carrossel com sucesso",
      data: novoItem,
    });
  } catch (error) {
    console.error("❌ [ADD] Erro:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao adicionar animal ao carrossel",
      error: error.message,
    });
  }
};

const listarAnimaisDoCarrossel = async (req, res) => {
  try {
    const associacoesOk = await verificarAssociacoes();

    if (!associacoesOk) {
      const carrosselItems = await CarrosselAnimais.findAll({
        order: [["ordem", "ASC"]],
      });

      const dadosProcessados = [];

      for (const item of carrosselItems) {
        const animal = await Animais.findByPk(item.animalId, {
          attributes: [
            "id",
            "nome",
            "imagemEntrada",
            "imagemSaida",
            "descricaoEntrada",
            "descricaoSaida",
          ],
        });

        if (animal) {
          dadosProcessados.push({
            id: item.id,
            animalId: item.animalId,
            descricaoSaida: item.descricaoSaida || animal.descricaoSaida,
            ordem: item.ordem,
            animal: {
              id: animal.id,
              nome: animal.nome || "Animal sem nome",
              imagemEntrada: animal.imagemEntrada || null,
              imagemSaida: animal.imagemSaida || null,
              descricaoEntrada:
                animal.descricaoEntrada || "Sem descrição de entrada",
              descricaoSaida:
                item.descricaoSaida ||
                animal.descricaoSaida ||
                "Sem descrição de saída",
            },
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: dadosProcessados,
        note: "Dados obtidos com método alternativo",
      });
    }

    const animaisCarrossel = await CarrosselAnimais.findAll({
      include: [
        {
          model: Animais,
          as: "animal",
          attributes: [
            "id",
            "nome",
            "imagemEntrada",
            "imagemSaida",
            "descricaoEntrada",
            "descricaoSaida",
          ],
          required: false,
        },
      ],
      order: [["ordem", "ASC"]],
    });

    const dadosProcessados = animaisCarrossel
      .filter((item) => item?.animal)
      .map((item) => ({
        id: item.id,
        animalId: item.animalId,
        descricaoSaida: item.descricaoSaida || item.animal.descricaoSaida,
        ordem: item.ordem,
        animal: {
          ...item.animal.toJSON(),
          imagemEntrada: item.animal.imagemEntrada || null,
          imagemSaida: item.animal.imagemSaida || null,
          nome: item.animal.nome || "Animal sem nome",
          descricaoEntrada:
            item.animal.descricaoEntrada || "Sem descrição de entrada",
          descricaoSaida:
            item.descricaoSaida ||
            item.animal.descricaoSaida ||
            "Sem descrição de saída",
        },
      }));

    res.status(200).json({
      success: true,
      data: dadosProcessados,
    });
  } catch (error) {
    console.error("❌ [LIST] Erro detalhado:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      sql: error.sql || "N/A",
    });

    res.status(500).json({
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

    const result = await CarrosselAnimais.destroy({
      where: { id },
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: "Item do carrossel não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Animal removido do carrossel com sucesso",
    });
  } catch (error) {
    console.error("❌ [REMOVE] Erro:", error);
    res.status(500).json({
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

    if (!descricaoSaida || descricaoSaida.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Descrição de saída é obrigatória",
      });
    }

    const carrosselAnimal = await CarrosselAnimais.findByPk(id);
    if (!carrosselAnimal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado no carrossel",
      });
    }

    const [numRowsUpdated] = await CarrosselAnimais.update(
      { descricaoSaida: descricaoSaida.trim() },
      { where: { id } }
    );

    if (numRowsUpdated === 0) {
      return res.status(400).json({
        success: false,
        message: "Nenhum registro foi atualizado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Descrição de saída atualizada com sucesso",
      data: {
        id,
        descricaoSaida: descricaoSaida.trim(),
      },
    });
  } catch (error) {
    console.error("❌ [UPDATE] Erro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao atualizar descrição",
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