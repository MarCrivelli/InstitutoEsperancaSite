const Animais = require("../models/Animais");

const atualizarStatusVacinacao = (animal) => {
  if (animal.dataVacinacao) {
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    if (new Date(animal.dataVacinacao) < umAnoAtras) {
      animal.statusVacinacao = "naoVacinado";
    } else {
      animal.statusVacinacao = "vacinado";
    }
  }
  return animal;
};

// Buscar todos os animais
const procurarAnimais = async (req, res) => {
  try {
    const animais = await Animais.findAll({
      attributes: [
        "id",
        "nome",
        "idade",
        "sexo",
        "tipo",
        "statusMicrochipagem",
        "statusVacinacao",
        "statusCastracao",
        "statusAdocao",
        "statusVermifugacao",
        "imagemEntrada",
        "imagemSaida",
        "dataVacinacao",
        "descricaoEntrada",
        "descricaoSaida",
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json(animais);
  } catch (error) {
    console.error("Erro ao buscar animais:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar animais",
      error: error.message,
    });
  }
};

// Cadastrar animal
const cadastrarAnimal = async (req, res) => {
  try {
    const {
      nome,
      idade,
      sexo,
      tipo,
      statusMicrochipagem,
      statusVacinacao,
      dataVacinacao,
      statusCastracao,
      statusAdocao,
      statusVermifugacao,
      descricaoEntrada,
    } = req.body;

    const imagemEntrada = req.file ? req.file.filename : null;

    const novoAnimal = await Animais.create({
      nome,
      idade,
      sexo,
      tipo,
      statusMicrochipagem,
      statusVacinacao,
      dataVacinacao: dataVacinacao || null,
      statusCastracao,
      statusAdocao,
      statusVermifugacao,
      descricaoEntrada,
      imagemEntrada,
    });

    res.status(201).json({
      message: "Animal cadastrado com sucesso!",
      animal: novoAnimal,
    });
  } catch (error) {
    console.error("Erro ao cadastrar animal:", error);
    res.status(500).json({ message: "Erro ao cadastrar o animal." });
  }
};

const atualizarAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosRecebidos = req.body;

    console.log("🔄 Atualizando animal ID:", id);
    console.log("📋 Dados recebidos:", dadosRecebidos);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido",
      });
    }

    const animal = await Animais.findByPk(id);
    if (!animal) {
      console.log("❌ Animal não encontrado:", id);
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado.",
      });
    }

    const camposPermitidos = [
      "nome",
      "idade",
      "sexo",
      "tipo",
      "statusMicrochipagem",
      "statusVacinacao",
      "dataVacinacao",
      "statusCastracao",
      "statusAdocao",
      "statusVermifugacao",
      "descricaoEntrada",
      "descricaoSaida",
    ];

    const dadosParaAtualizar = {};
    let houveAlteracao = false;

    camposPermitidos.forEach((campo) => {
      if (Object.prototype.hasOwnProperty.call(dadosRecebidos, campo)) {
        let valor = dadosRecebidos[campo];

        if (typeof valor === "string") {
          valor = valor.trim();
        }

        if (campo === "dataVacinacao" && !valor) {
          valor = null;
        }

        if (animal[campo] !== valor) {
          dadosParaAtualizar[campo] = valor;
          houveAlteracao = true;
          console.log(
            `📝 Campo alterado - ${campo}: "${animal[campo]}" → "${valor}"`
          );
        }
      }
    });

    if (!houveAlteracao) {
      return res.status(200).json({
        success: true,
        message: "Nenhuma alteração necessária",
        animal,
      });
    }

    Object.keys(dadosParaAtualizar).forEach((campo) => {
      animal[campo] = dadosParaAtualizar[campo];
    });

    if (
      dadosParaAtualizar.hasOwnProperty("dataVacinacao") ||
      dadosParaAtualizar.hasOwnProperty("statusVacinacao")
    ) {
      atualizarStatusVacinacao(animal);
    }

    await animal.save();

    console.log("✅ Animal atualizado com sucesso");
    console.log("📋 Dados finais do animal:", {
      id: animal.id,
      nome: animal.nome,
      descricaoEntrada: animal.descricaoEntrada,
      descricaoSaida: animal.descricaoSaida,
    });

    res.status(200).json({
      success: true,
      message: "Animal atualizado com sucesso!",
      animal,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar animal:", error);
    console.error("❌ Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Erro ao atualizar animal.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Buscar animal por ID
const buscarAnimalPorId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Buscando animal por ID:", id);

    const animal = await Animais.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado.",
      });
    }

    const animalData = animal.toJSON();

    if (!animalData.hasOwnProperty("descricaoSaida")) {
      animalData.descricaoSaida = null;
    }

    if (!animalData.hasOwnProperty("descricaoEntrada")) {
      animalData.descricaoEntrada = null;
    }

    res.status(200).json(animalData);
  } catch (error) {
    console.error("❌ Erro ao buscar animal:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar animal.",
      error: error.message,
    });
  }
};

// Atualizar imagem de saída
const atualizarImagemSaida = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhuma imagem foi enviada",
      });
    }

    const animal = await Animais.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    const imagemAnterior = animal.imagemSaida;
    animal.imagemSaida = req.file.filename;
    await animal.save();

    console.log(
      `✅ Imagem de saída atualizada: "${imagemAnterior}" → "${req.file.filename}"`
    );

    res.status(200).json({
      success: true,
      message: "Imagem de saída atualizada com sucesso",
      animal,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar imagem de saída:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao atualizar imagem",
      error: error.message,
    });
  }
};

// Atualizar imagem de entrada
const atualizarImagemEntrada = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhuma imagem foi enviada",
      });
    }

    const animal = await Animais.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado.",
      });
    }

    const imagemAnterior = animal.imagemEntrada;
    animal.imagemEntrada = req.file.filename;
    await animal.save();

    console.log(
      `✅ Imagem de entrada atualizada: "${imagemAnterior}" → "${req.file.filename}"`
    );

    res.status(200).json({
      success: true,
      message: "Imagem de entrada atualizada com sucesso!",
      animal,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar imagem de entrada:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar imagem de entrada.",
      error: error.message,
    });
  }
};

// Atualizar apenas descrição de saída
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

    const animal = await Animais.findByPk(id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    animal.descricaoSaida = descricaoSaida.trim();
    await animal.save();

    return res.status(200).json({
      success: true,
      message: "Descrição de saída atualizada com sucesso",
      animal,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar descrição de saída:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar descrição de saída",
      error: error.message,
    });
  }
};

module.exports = {
  procurarAnimais,
  cadastrarAnimal,
  buscarAnimalPorId,
  atualizarImagemEntrada,
  atualizarImagemSaida,
  atualizarDescricaoSaida,
  atualizarAnimal,
};