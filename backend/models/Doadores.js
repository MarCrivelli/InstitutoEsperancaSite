const { mongoose } = require("../config/connection");
const modelOptions = require("./modelOptions");

const doadoresSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório"],
      trim: true,
    },

    descricao: {
      type: String,
      required: [true, "A descrição é obrigatória"],
      trim: true,
    },

    imagem: {
      type: String,
      required: [true, "A imagem é obrigatória"],
      trim: true,
    },
  },
  {
    ...modelOptions,
    collection: "doadores",
  }
);

module.exports =
  mongoose.models.Doadores ||
  mongoose.model("Doadores", doadoresSchema);
