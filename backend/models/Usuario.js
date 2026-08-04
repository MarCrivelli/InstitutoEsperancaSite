const { mongoose } = require("../config/connection");
const modelOptions = require("./modelOptions");

const phoneRegex =
  /^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório"],
      trim: true,
    },

    senha: {
      type: String,
      required: function requiredPassword() {
        return !this.googleId;
      },
      select: false,
    },

    senhaGoogleConfirmada: {
      type: Boolean,
      default: false,
    },

    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    nivelDeAcesso: {
      type: String,
      required: true,
      default: "visitante",
      trim: true,
    },

    telefone: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }

          return phoneRegex.test(value);
        },
        message:
          "Telefone deve estar no formato válido, por exemplo: +55 67 99999-9999",
      },
    },

    receberEmailEventos: {
      type: Boolean,
      required: true,
      default: false,
    },

    receberMensagensEventos: {
      type: Boolean,
      required: true,
      default: false,
    },

    foto: {
      type: String,
      default: null,
      trim: true,
    },

    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      trim: true,
    },

    dataUltimoLogin: {
      type: Date,
      default: null,
    },

    ativo: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    ...modelOptions,
    collection: "db_usuario",
  }
);

module.exports =
  mongoose.models.Usuario ||
  mongoose.model("Usuario", usuarioSchema);