const mongoose = require("mongoose");
const modelOptions = require("./modelOptions");

const postagemSchema = new mongoose.Schema(
  {
    legenda: { type: String, required: true, trim: true, maxlength: 2200 },
    plataformas: [{ type: String, enum: ["facebook", "instagram"] }],
    imagens: [{ type: String, required: true }],
    agendadaPara: { type: Date, default: null },
    status: {
      type: String,
      enum: ["agendada", "publicando", "publicada", "erro"],
      default: "agendada",
    },
    resultados: { type: mongoose.Schema.Types.Mixed, default: {} },
    erro: { type: String, default: null },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  },
  modelOptions,
);

module.exports =
  mongoose.models.Postagem || mongoose.model("Postagem", postagemSchema);
