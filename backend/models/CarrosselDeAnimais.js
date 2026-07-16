const { mongoose } = require("../config/connection");
const modelOptions = require("./modelOptions");

const carrosselDeAnimaisSchema = new mongoose.Schema(
  {
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animais",
      required: [true, "O animal é obrigatório"],
      index: true,
    },

    descricaoSaida: {
      type: String,
      default: null,
      trim: true,
    },

    ordem: {
      type: Number,
      required: [true, "A ordem é obrigatória"],
      min: [0, "A ordem não pode ser negativa"],
    },
  },
  {
    ...modelOptions,
    collection: "carrossel_animais",
  }
);

module.exports =
  mongoose.models.CarrosselDeAnimais ||
  mongoose.model(
    "CarrosselDeAnimais",
    carrosselDeAnimaisSchema
  );
