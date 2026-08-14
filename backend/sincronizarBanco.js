require("dotenv").config();

const {
  mongoose,
  connectDatabase,
} = require("./config/connection");

// Importa os models para registrar os schemas.
require("./models/Animais");
require("./models/CarrosselDeAnimais");
require("./models/Usuario");
require("./models/Doadores");
require("./models/Avisos");
require("./models/Documentos");
require("./models/Postagem");

async function prepararBanco() {
  try {
    console.log(
      "🔄 Conectando ao MongoDB e preparando índices..."
    );

    await connectDatabase();

    /*
     * O MongoDB não usa sequelize.sync().
     *
     * syncIndexes() compara os índices definidos nos schemas
     * com os existentes no banco.
     *
     * Use este script manualmente. Não é necessário executá-lo
     * em toda inicialização do servidor.
     */
    const models = Object.values(mongoose.models);

    for (const model of models) {
      console.log(
        `🔄 Sincronizando índices: ${model.modelName}`
      );

      await model.syncIndexes();
    }

    console.log(
      "✅ MongoDB conectado e índices sincronizados."
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Erro ao preparar MongoDB:",
      error
    );

    try {
      await mongoose.disconnect();
    } catch {
      // Ignora falha ao desconectar.
    }

    process.exit(1);
  }
}

prepararBanco();
