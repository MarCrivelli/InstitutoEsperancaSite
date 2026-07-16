const mongoose = require("mongoose");
const Doadores = require("../models/Doadores");

const validarId = (id) => mongoose.isValidObjectId(id);

// Listar todos os doadores
const listarDoadores = async (req, res) => {
  try {
    const doadores = await Doadores.find().sort({ createdAt: -1 });

    res.json(doadores);
  } catch (error) {
    console.error("Erro ao listar doadores:", error);

    res.status(500).json({
      message: "Erro ao listar os doadores.",
      error: error.message,
    });
  }
};

// Cadastrar doador
const cadastrarDoador = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Imagem é obrigatória.",
      });
    }

    if (descricao && descricao.length > 500) {
      return res.status(400).json({
        message: "A descrição não pode exceder 500 caracteres",
      });
    }

    const novoDoador = await Doadores.create({
      nome,
      descricao,
      imagem: req.file.filename,
    });

    res.status(201).json(novoDoador);
  } catch (error) {
    console.error("Erro ao cadastrar doador:", error);

    res.status(500).json({
      message: "Erro ao cadastrar o doador.",
      error: error.message,
    });
  }
};

// Buscar doador por ID
const buscarDoadorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({
        message: "ID do doador inválido.",
      });
    }

    const doador = await Doadores.findById(id);

    if (!doador) {
      return res.status(404).json({
        message: "Doador não encontrado.",
      });
    }

    res.json(doador);
  } catch (error) {
    console.error("Erro ao buscar doador:", error);

    res.status(500).json({
      message: "Erro ao buscar doador.",
      error: error.message,
    });
  }
};

// Atualizar doador
const atualizarDoador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    if (!validarId(id)) {
      return res.status(400).json({
        message: "ID do doador inválido.",
      });
    }

    if (descricao && descricao.length > 500) {
      return res.status(400).json({
        message: "A descrição não pode exceder 500 caracteres",
      });
    }

    const doador = await Doadores.findById(id);

    if (!doador) {
      return res.status(404).json({
        message: "Doador não encontrado.",
      });
    }

    if (nome !== undefined && nome.trim()) {
      doador.nome = nome.trim();
    }

    if (descricao !== undefined) {
      doador.descricao = descricao.trim();
    }

    if (req.file) {
      doador.imagem = req.file.filename;
    }

    await doador.save();

    res.json({
      message: "Doador atualizado com sucesso!",
      doador,
    });
  } catch (error) {
    console.error("Erro ao atualizar doador:", error);

    res.status(500).json({
      message: "Erro ao atualizar doador.",
      error: error.message,
    });
  }
};

// Deletar doador
const deletarDoador = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({
        message: "ID do doador inválido.",
      });
    }

    const doador = await Doadores.findByIdAndDelete(id);

    if (!doador) {
      return res.status(404).json({
        message: "Doador não encontrado.",
      });
    }

    res.json({
      message: "Doador deletado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao deletar doador:", error);

    res.status(500).json({
      message: "Erro ao deletar doador.",
      error: error.message,
    });
  }
};

module.exports = {
  listarDoadores,
  cadastrarDoador,
  buscarDoadorPorId,
  atualizarDoador,
  deletarDoador,
};
