const { mongoose } = require("../config/connection");
const modelOptions = require("./modelOptions");

const destaqueSchema = new mongoose.Schema(
  {
    texto: {
      type: String,
      required: [true, "O texto é obrigatório"],
      trim: true,
      maxlength: [
        1200,
        "O texto deve ter no máximo 1200 caracteres",
      ],
    },

    imagem: {
      type: String,
      required: [true, "A imagem é obrigatória"],
      trim: true,
    },

    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    ...modelOptions,
    collection: "destaques",
  },
);

module.exports =
  mongoose.models.Destaque ||
  mongoose.model("Destaque", destaqueSchema);