const mongoose = require("mongoose");
const Avisos = require("../models/Avisos");

const validarId = (id) => mongoose.isValidObjectId(id);

const formatarAviso = (aviso) => {
  const dataInicioFormatada = new Date(
    aviso.dataInicio
  ).toLocaleDateString("pt-BR", { timeZone: "UTC" });

  const dataFormatada =
    aviso.ehPeriodo && aviso.dataFim
      ? `${dataInicioFormatada} ao ${new Date(
          aviso.dataFim
        ).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`
      : dataInicioFormatada;

  return {
    id: aviso.id,
    data: dataFormatada,
    descricao: aviso.descricao,
    corData: aviso.corData,
    dataInicio: aviso.dataInicio,
    dataFim: aviso.dataFim,
    ehPeriodo: aviso.ehPeriodo,
  };
};

const avisoController = {
  async listarAvisos(req, res) {
    try {
      const avisos = await Avisos.find().sort({ dataInicio: 1 });

      res.status(200).json(avisos.map(formatarAviso));
    } catch (error) {
      console.error("Erro ao listar avisos:", error);

      res.status(500).json({
        erro: "Erro interno do servidor",
        detalhes: error.message,
      });
    }
  },

  async buscarAvisoPorId(req, res) {
    try {
      const { id } = req.params;

      if (!validarId(id)) {
        return res.status(400).json({ erro: "ID inválido" });
      }

      const aviso = await Avisos.findById(id);

      if (!aviso) {
        return res.status(404).json({ erro: "Aviso não encontrado" });
      }

      res.status(200).json(formatarAviso(aviso));
    } catch (error) {
      console.error("Erro ao buscar aviso:", error);

      res.status(500).json({
        erro: "Erro interno do servidor",
        detalhes: error.message,
      });
    }
  },

  async criarAviso(req, res) {
    try {
      const { descricao, dataInicio, dataFim, ehPeriodo, corData } = req.body;

      if (!descricao || !dataInicio) {
        return res.status(400).json({
          erro: "Descrição e data de início são obrigatórias",
        });
      }

      if (ehPeriodo && !dataFim) {
        return res.status(400).json({
          erro: "Data final é obrigatória quando é um período",
        });
      }

      if (ehPeriodo && new Date(dataFim) < new Date(dataInicio)) {
        return res.status(400).json({
          erro: "Data final deve ser posterior à data inicial",
        });
      }

      const novoAviso = await Avisos.create({
        descricao: descricao.trim(),
        dataInicio,
        dataFim: ehPeriodo ? dataFim : null,
        ehPeriodo: Boolean(ehPeriodo),
        corData: corData || "#000000",
      });

      res.status(201).json(formatarAviso(novoAviso));
    } catch (error) {
      console.error("Erro ao criar aviso:", error);

      res.status(500).json({
        erro: "Erro interno do servidor",
        detalhes: error.message,
      });
    }
  },

  async atualizarAviso(req, res) {
    try {
      const { id } = req.params;
      const { descricao, dataInicio, dataFim, ehPeriodo, corData } = req.body;

      if (!validarId(id)) {
        return res.status(400).json({ erro: "ID inválido" });
      }

      const aviso = await Avisos.findById(id);

      if (!aviso) {
        return res.status(404).json({ erro: "Aviso não encontrado" });
      }

      const novoEhPeriodo =
        ehPeriodo !== undefined ? Boolean(ehPeriodo) : aviso.ehPeriodo;

      const novaDataInicio = dataInicio || aviso.dataInicio;
      const novaDataFim = novoEhPeriodo
        ? dataFim || aviso.dataFim
        : null;

      if (novoEhPeriodo && !novaDataFim) {
        return res.status(400).json({
          erro: "Data final é obrigatória quando é um período",
        });
      }

      if (
        novoEhPeriodo &&
        new Date(novaDataFim) < new Date(novaDataInicio)
      ) {
        return res.status(400).json({
          erro: "Data final deve ser posterior à data inicial",
        });
      }

      if (descricao !== undefined) {
        aviso.descricao = descricao.trim();
      }

      aviso.dataInicio = novaDataInicio;
      aviso.dataFim = novaDataFim;
      aviso.ehPeriodo = novoEhPeriodo;

      if (corData !== undefined) {
        aviso.corData = corData;
      }

      await aviso.save();

      res.status(200).json(formatarAviso(aviso));
    } catch (error) {
      console.error("Erro ao atualizar aviso:", error);

      res.status(500).json({
        erro: "Erro interno do servidor",
        detalhes: error.message,
      });
    }
  },

  async deletarAviso(req, res) {
    try {
      const { id } = req.params;

      if (!validarId(id)) {
        return res.status(400).json({ erro: "ID inválido" });
      }

      const aviso = await Avisos.findByIdAndDelete(id);

      if (!aviso) {
        return res.status(404).json({ erro: "Aviso não encontrado" });
      }

      res.status(200).json({
        mensagem: "Aviso deletado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar aviso:", error);

      res.status(500).json({
        erro: "Erro interno do servidor",
        detalhes: error.message,
      });
    }
  },
};

module.exports = avisoController;
