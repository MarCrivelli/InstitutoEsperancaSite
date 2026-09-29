const mongoose = require("mongoose");
const Destaque = require("../models/Destaques");

const listar = async (req, res) => {
  try {
    const filtro = req.user ? {} : { ativo: true };

    const destaques = await Destaque.find(filtro).sort({
      createdAt: -1,
    });

    return res.json(destaques);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar destaques.",
      error: error.message,
    });
  }
};

const criar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "A imagem é obrigatória.",
      });
    }

    const destaque = await Destaque.create({
      texto: req.body.texto,
      imagem: req.file.filename,
      ativo: req.body.ativo !== "false",
    });

    return res.status(201).json(destaque);
  } catch (error) {
    return res.status(400).json({
      message: "Não foi possível criar o destaque.",
      error: error.message,
    });
  }
};

const atualizar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID inválido.",
      });
    }

    const destaque = await Destaque.findById(req.params.id);

    if (!destaque) {
      return res.status(404).json({
        message: "Destaque não encontrado.",
      });
    }

    if (req.body.texto !== undefined) {
      destaque.texto = req.body.texto;
    }

    if (req.body.ativo !== undefined) {
      destaque.ativo =
        String(req.body.ativo) !== "false";
    }

    if (req.file) {
      destaque.imagem = req.file.filename;
    }

    await destaque.save();

    return res.json(destaque);
  } catch (error) {
    return res.status(400).json({
      message: "Não foi possível atualizar o destaque.",
      error: error.message,
    });
  }
};

const excluir = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "ID inválido.",
    });
  }

  const destaque = await Destaque.findByIdAndDelete(
    req.params.id,
  );

  if (!destaque) {
    return res.status(404).json({
      message: "Destaque não encontrado.",
    });
  }

  return res.json({
    message: "Destaque excluído com sucesso.",
  });
};

module.exports = {
  listar,
  criar,
  atualizar,
  excluir,
};