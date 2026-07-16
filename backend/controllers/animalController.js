const mongoose = require("mongoose");
const Animais = require("../models/Animais");

const atualizarStatusVacinacao = (animal) => {
  if (animal.dataVacinacao) {
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    animal.statusVacinacao =
      new Date(animal.dataVacinacao) < umAnoAtras
        ? "naoVacinado"
        : "vacinado";
  }

  return animal;
};

const validarId = (id) => mongoose.isValidObjectId(id);

// Buscar todos os animais
const procurarAnimais = async (req, res) => {
  try {
    const animais = await Animais.find()
      .select(
        "nome idade sexo tipo statusMicrochipagem statusVacinacao " +
          "statusCastracao statusAdocao statusVermifugacao imagemEntrada " +
          "imagemSaida dataVacinacao descricaoEntrada descricaoSaida"
      )
      .sort({ createdAt: 1 });

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

    res.status(500).json({
      message: "Erro ao cadastrar o animal.",
      error: error.message,
    });
  }
};

const atualizarAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosRecebidos = req.body;

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido",
      });
    }

    const animal = await Animais.findById(id);

    if (!animal) {
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

    let houveAlteracao = false;

    for (const campo of camposPermitidos) {
      if (!Object.prototype.hasOwnProperty.call(dadosRecebidos, campo)) {
        continue;
      }

      let valor = dadosRecebidos[campo];

      if (typeof valor === "string") {
        valor = valor.trim();
      }

      if (campo === "idade" && valor !== "") {
        valor = Number(valor);
      }

      if (campo === "dataVacinacao" && !valor) {
        valor = null;
      }

      const valorAtual =
        animal[campo] instanceof Date
          ? animal[campo].toISOString()
          : animal[campo];

      const novoValor =
        campo === "dataVacinacao" && valor
          ? new Date(valor).toISOString()
          : valor;

      if (String(valorAtual ?? "") !== String(novoValor ?? "")) {
        animal[campo] = valor;
        houveAlteracao = true;
      }
    }

    if (!houveAlteracao) {
      return res.status(200).json({
        success: true,
        message: "Nenhuma alteração necessária",
        animal,
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(dadosRecebidos, "dataVacinacao") ||
      Object.prototype.hasOwnProperty.call(dadosRecebidos, "statusVacinacao")
    ) {
      atualizarStatusVacinacao(animal);
    }

    await animal.save();

    res.status(200).json({
      success: true,
      message: "Animal atualizado com sucesso!",
      animal,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar animal:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao atualizar animal.",
      error: error.message,
    });
  }
};

// Buscar animal por ID
const buscarAnimalPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido.",
      });
    }

    const animal = await Animais.findById(id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado.",
      });
    }

    const animalData = animal.toJSON();

    animalData.descricaoSaida ??= null;
    animalData.descricaoEntrada ??= null;

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

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhuma imagem foi enviada",
      });
    }

    const animal = await Animais.findById(id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    animal.imagemSaida = req.file.filename;
    await animal.save();

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

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhuma imagem foi enviada",
      });
    }

    const animal = await Animais.findById(id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado.",
      });
    }

    animal.imagemEntrada = req.file.filename;
    await animal.save();

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

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do animal inválido",
      });
    }

    if (!descricaoSaida || descricaoSaida.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Descrição de saída é obrigatória",
      });
    }

    const animal = await Animais.findByIdAndUpdate(
      id,
      { descricaoSaida: descricaoSaida.trim() },
      { new: true, runValidators: true }
    );

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

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
