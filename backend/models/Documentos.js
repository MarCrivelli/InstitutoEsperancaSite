const { mongoose } = require("../config/connection");
const modelOptions = require("./modelOptions");

const documentosSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório"],
      trim: true,
    },

    tipoDeArquivo: {
      type: String,
      required: [true, "O tipo do arquivo é obrigatório"],
      trim: true,
    },

    caminhoArquivo: {
      type: String,
      required: [true, "O caminho do arquivo é obrigatório"],
      trim: true,
    },
  },
  {
    ...modelOptions,
    collection: "documentos",
  }
);

module.exports =
  mongoose.models.Documentos ||
  mongoose.model("Documentos", documentosSchema);
