const { mongoose } = require("../config/connection");
const modelOptions = require("./modelOptions");

const avisosSchema = new mongoose.Schema(
  {
    descricao: {
      type: String,
      required: [true, "A descrição é obrigatória"],
      trim: true,
    },

    dataInicio: {
      type: Date,
      required: [true, "A data de início é obrigatória"],
    },

    dataFim: {
      type: Date,
      default: null,
    },

    ehPeriodo: {
      type: Boolean,
      default: false,
    },

    corData: {
      type: String,
      default: "#000000",
      trim: true,
    },
  },
  {
    ...modelOptions,
    collection: "avisos",
  }
);

avisosSchema.pre("validate", function validarPeriodo(next) {
  if (this.ehPeriodo && !this.dataFim) {
    return next(
      new Error("A data final é obrigatória quando o aviso é um período")
    );
  }

  if (
    this.ehPeriodo &&
    this.dataFim &&
    this.dataInicio &&
    this.dataFim < this.dataInicio
  ) {
    return next(
      new Error("A data final deve ser posterior à data inicial")
    );
  }

  if (!this.ehPeriodo) {
    this.dataFim = null;
  }

  next();
});

module.exports =
  mongoose.models.Avisos ||
  mongoose.model("Avisos", avisosSchema);
