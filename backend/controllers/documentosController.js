const Documentos = require("../models/Documentos");
const path = require("path");
const fs = require("fs");

const cadastrarDocumento = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo foi enviado.",
      });
    }

    const extensoesPermitidas = [".doc", ".docx", ".xls", ".xlsx"];
    const extensaoArquivo = path.extname(req.file.originalname).toLowerCase();

    if (!extensoesPermitidas.includes(extensaoArquivo)) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Tipo de arquivo não permitido. Envie apenas Word ou Excel.",
      });
    }

    const novoDocumento = await Documentos.create({
      nome: req.file.originalname,
      tipoDeArquivo: extensaoArquivo,
      caminhoArquivo: req.file.filename,
    });

    return res.status(201).json({
      success: true,
      message: "Documento cadastrado com sucesso.",
      data: novoDocumento,
    });
  } catch (error) {
    console.error("Erro ao cadastrar documento:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao cadastrar documento.",
      error: error.message,
    });
  }
};

const listarDocumentos = async (req, res) => {
  try {
    const pagina = Number(req.query.page) || 1;
    const limite = Number(req.query.limit) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await Documentos.findAndCountAll({
      limit: limite,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPaginas = Math.ceil(count / limite);

    return res.status(200).json({
      success: true,
      data: rows,
      paginacao: {
        paginaAtual: pagina,
        limitePorPagina: limite,
        totalDocumentos: count,
        totalPaginas,
      },
    });
  } catch (error) {
    console.error("Erro ao listar documentos:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar documentos.",
      error: error.message,
    });
  }
};

const deletarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documentos.findByPk(id);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Documento não encontrado.",
      });
    }

    const caminhoCompleto = path.join(
      __dirname,
      "../uploads",
      documento.caminhoArquivo
    );

    if (fs.existsSync(caminhoCompleto)) {
      fs.unlinkSync(caminhoCompleto);
    }

    await documento.destroy();

    return res.status(200).json({
      success: true,
      message: "Documento removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao deletar documento:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao deletar documento.",
      error: error.message,
    });
  }
};

module.exports = {
  cadastrarDocumento,
  listarDocumentos,
  deletarDocumento,
};