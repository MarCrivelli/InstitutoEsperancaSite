const mongoose = require("mongoose");
const Documentos = require("../models/Documentos");
const path = require("path");
const fs = require("fs");

const validarId = (id) => mongoose.isValidObjectId(id);

const removerArquivoSeExistir = (caminho) => {
  try {
    if (caminho && fs.existsSync(caminho)) {
      fs.unlinkSync(caminho);
    }
  } catch (error) {
    console.error("Erro ao remover arquivo:", error.message);
  }
};

const cadastrarDocumento = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo foi enviado.",
      });
    }

    const extensoesPermitidas = [".doc", ".docx", ".xls", ".xlsx"];
    const extensaoArquivo = path.extname(
      req.file.originalname
    ).toLowerCase();

    if (!extensoesPermitidas.includes(extensaoArquivo)) {
      removerArquivoSeExistir(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "Tipo de arquivo não permitido. Envie apenas Word ou Excel.",
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

    if (req.file?.path) {
      removerArquivoSeExistir(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Erro ao cadastrar documento.",
      error: error.message,
    });
  }
};

const listarDocumentos = async (req, res) => {
  try {
    const pagina = Math.max(Number(req.query.page) || 1, 1);
    const limite = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );
    const offset = (pagina - 1) * limite;

    const [count, rows] = await Promise.all([
      Documentos.countDocuments(),
      Documentos.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limite),
    ]);

    return res.status(200).json({
      success: true,
      data: rows,
      paginacao: {
        paginaAtual: pagina,
        limitePorPagina: limite,
        totalDocumentos: count,
        totalPaginas: Math.ceil(count / limite),
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

    if (!validarId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do documento inválido.",
      });
    }

    const documento = await Documentos.findById(id);

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

    removerArquivoSeExistir(caminhoCompleto);
    await documento.deleteOne();

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
