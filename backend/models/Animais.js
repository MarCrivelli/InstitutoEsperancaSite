const { mongoose } = require("../config/connection");
const modelOptions = require("./modelOptions");

const animaisSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório"],
      trim: true,
    },

    idade: {
      type: Number,
      required: [true, "A idade é obrigatória"],
      min: [0, "A idade não pode ser negativa"],
    },

    sexo: {
      type: String,
      required: [true, "O sexo é obrigatório"],
      trim: true,
    },

    tipo: {
      type: String,
      required: [true, "O tipo é obrigatório"],
      trim: true,
    },

    statusMicrochipagem: {
      type: String,
      required: [true, "O status de microchipagem é obrigatório"],
      trim: true,
    },

    statusVacinacao: {
      type: String,
      required: [true, "O status de vacinação é obrigatório"],
      trim: true,
    },

    statusCastracao: {
      type: String,
      required: [true, "O status de castração é obrigatório"],
      trim: true,
    },

    statusAdocao: {
      type: String,
      required: [true, "O status de adoção é obrigatório"],
      trim: true,
    },

    statusVermifugacao: {
      type: String,
      required: [true, "O status de vermifugação é obrigatório"],
      trim: true,
    },

    statusVida: {
      type: String,
      enum: {
        values: ["vivo", "falecido"],
        message: "O status de vida deve ser vivo ou falecido",
      },
      default: "vivo",
      required: [true, "O status de vida é obrigatório"],
    },

    imagemEntrada: {
      type: String,
      required: [true, "A imagem de entrada é obrigatória"],
      trim: true,
    },

    imagemSaida: {
      type: String,
      default: null,
      trim: true,
    },

    dataVacinacao: {
      type: Date,
      default: null,
    },

    descricaoEntrada: {
      type: String,
      default: null,
      trim: true,
    },

    descricaoSaida: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    ...modelOptions,
    collection: "animais",
  }
);

// Equivale ao antigo "as: itensCarrossel" do Sequelize.
// É um virtual: os itens continuam armazenados na coleção carrossel_animais.
animaisSchema.virtual("itensCarrossel", {
  ref: "CarrosselDeAnimais",
  localField: "_id",
  foreignField: "animalId",
});

module.exports =
  mongoose.models.Animais ||
  mongoose.model("Animais", animaisSchema);
