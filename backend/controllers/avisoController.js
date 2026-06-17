const Avisos = require('../models/Avisos'); // Ajuste o caminho conforme sua estrutura

const avisoController = {
  // Listar todos os avisos
  async listarAvisos(req, res) {
    try {
      const avisos = await Avisos.findAll({
        order: [['dataInicio', 'ASC']] // Ordenar por data de início
      });

      // Formatar as datas para exibição no frontend
      const avisosFormatados = avisos.map(aviso => {
        let dataFormatada;
        
        if (aviso.ehPeriodo && aviso.dataFim) {
          // Período: "01/01/2025 ao 07/01/2025"
          const dataInicioFormatada = new Date(aviso.dataInicio).toLocaleDateString('pt-BR');
          const dataFimFormatada = new Date(aviso.dataFim).toLocaleDateString('pt-BR');
          dataFormatada = `${dataInicioFormatada} ao ${dataFimFormatada}`;
        } else {
          // Data única: "01/01/2025"
          dataFormatada = new Date(aviso.dataInicio).toLocaleDateString('pt-BR');
        }

        return {
          id: aviso.id,
          data: dataFormatada,
          descricao: aviso.descricao,
          corData: aviso.corData,
          dataInicio: aviso.dataInicio,
          dataFim: aviso.dataFim,
          ehPeriodo: aviso.ehPeriodo
        };
      });

      res.status(200).json(avisosFormatados);
    } catch (error) {
      console.error('Erro ao listar avisos:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor',
        detalhes: error.message 
      });
    }
  },

  // Buscar aviso por ID
  async buscarAvisoPorId(req, res) {
    try {
      const { id } = req.params;
      
      const aviso = await Avisos.findByPk(id);
      
      if (!aviso) {
        return res.status(404).json({ erro: 'Aviso não encontrado' });
      }

      // Formatar data para exibição
      let dataFormatada;
      if (aviso.ehPeriodo && aviso.dataFim) {
        const dataInicioFormatada = new Date(aviso.dataInicio).toLocaleDateString('pt-BR');
        const dataFimFormatada = new Date(aviso.dataFim).toLocaleDateString('pt-BR');
        dataFormatada = `${dataInicioFormatada} ao ${dataFimFormatada}`;
      } else {
        dataFormatada = new Date(aviso.dataInicio).toLocaleDateString('pt-BR');
      }

      const avisoFormatado = {
        id: aviso.id,
        data: dataFormatada,
        descricao: aviso.descricao,
        corData: aviso.corData,
        dataInicio: aviso.dataInicio,
        dataFim: aviso.dataFim,
        ehPeriodo: aviso.ehPeriodo
      };

      res.status(200).json(avisoFormatado);
    } catch (error) {
      console.error('Erro ao buscar aviso:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor',
        detalhes: error.message 
      });
    }
  },

  // Criar novo aviso
  async criarAviso(req, res) {
    try {
      const { descricao, dataInicio, dataFim, ehPeriodo, corData } = req.body;

      // Validações básicas
      if (!descricao || !dataInicio) {
        return res.status(400).json({ 
          erro: 'Descrição e data de início são obrigatórias' 
        });
      }

      if (ehPeriodo && !dataFim) {
        return res.status(400).json({ 
          erro: 'Data final é obrigatória quando é um período' 
        });
      }

      // Validar se dataFim é posterior a dataInicio quando é período
      if (ehPeriodo && dataFim && new Date(dataFim) < new Date(dataInicio)) {
        return res.status(400).json({ 
          erro: 'Data final deve ser posterior à data inicial' 
        });
      }

      const novoAviso = await Avisos.create({
        descricao,
        dataInicio,
        dataFim: ehPeriodo ? dataFim : null,
        ehPeriodo: !!ehPeriodo,
        corData: corData || '#000000'
      });

      // Formatar resposta
      let dataFormatada;
      if (novoAviso.ehPeriodo && novoAviso.dataFim) {
        const dataInicioFormatada = new Date(novoAviso.dataInicio).toLocaleDateString('pt-BR');
        const dataFimFormatada = new Date(novoAviso.dataFim).toLocaleDateString('pt-BR');
        dataFormatada = `${dataInicioFormatada} ao ${dataFimFormatada}`;
      } else {
        dataFormatada = new Date(novoAviso.dataInicio).toLocaleDateString('pt-BR');
      }

      const avisoFormatado = {
        id: novoAviso.id,
        data: dataFormatada,
        descricao: novoAviso.descricao,
        corData: novoAviso.corData,
        dataInicio: novoAviso.dataInicio,
        dataFim: novoAviso.dataFim,
        ehPeriodo: novoAviso.ehPeriodo
      };

      res.status(201).json(avisoFormatado);
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor',
        detalhes: error.message 
      });
    }
  },

  // Atualizar aviso
  async atualizarAviso(req, res) {
    try {
      const { id } = req.params;
      const { descricao, dataInicio, dataFim, ehPeriodo, corData } = req.body;

      const aviso = await Avisos.findByPk(id);
      
      if (!aviso) {
        return res.status(404).json({ erro: 'Aviso não encontrado' });
      }

      // Validações
      if (ehPeriodo && dataFim && new Date(dataFim) < new Date(dataInicio)) {
        return res.status(400).json({ 
          erro: 'Data final deve ser posterior à data inicial' 
        });
      }

      await aviso.update({
        descricao: descricao || aviso.descricao,
        dataInicio: dataInicio || aviso.dataInicio,
        dataFim: ehPeriodo ? (dataFim || aviso.dataFim) : null,
        ehPeriodo: ehPeriodo !== undefined ? !!ehPeriodo : aviso.ehPeriodo,
        corData: corData || aviso.corData
      });

      // Formatar resposta
      let dataFormatada;
      if (aviso.ehPeriodo && aviso.dataFim) {
        const dataInicioFormatada = new Date(aviso.dataInicio).toLocaleDateString('pt-BR');
        const dataFimFormatada = new Date(aviso.dataFim).toLocaleDateString('pt-BR');
        dataFormatada = `${dataInicioFormatada} ao ${dataFimFormatada}`;
      } else {
        dataFormatada = new Date(aviso.dataInicio).toLocaleDateString('pt-BR');
      }

      const avisoFormatado = {
        id: aviso.id,
        data: dataFormatada,
        descricao: aviso.descricao,
        corData: aviso.corData,
        dataInicio: aviso.dataInicio,
        dataFim: aviso.dataFim,
        ehPeriodo: aviso.ehPeriodo
      };

      res.status(200).json(avisoFormatado);
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor',
        detalhes: error.message 
      });
    }
  },

  // Deletar aviso
  async deletarAviso(req, res) {
    try {
      const { id } = req.params;
      
      const aviso = await Avisos.findByPk(id);
      
      if (!aviso) {
        return res.status(404).json({ erro: 'Aviso não encontrado' });
      }

      await aviso.destroy();
      
      res.status(200).json({ mensagem: 'Aviso deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar aviso:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor',
        detalhes: error.message 
      });
    }
  }
};

module.exports = avisoController;