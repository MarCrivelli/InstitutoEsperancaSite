const mongoose = require("mongoose");
require("dotenv").config();

let connectionPromise = null;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "A variável MONGODB_URI não foi configurada. Adicione-a no arquivo .env e no Render."
    );
  }

  console.log("🔍 NODE_ENV:", process.env.NODE_ENV || "development");
  console.log("🔍 MONGODB_URI existe?", mongoUri ? "SIM" : "NÃO");
  console.log("🌐 Conectando ao MongoDB...");

  connectionPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    })
    .then((mongooseInstance) => {
      console.log("✅ Conexão com MongoDB estabelecida.");
      return mongooseInstance.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error("❌ Falha na conexão com MongoDB:", error.message);
      throw error;
    });

  return connectionPromise;
}

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB desconectado.");
  connectionPromise = null;
});

mongoose.connection.on("error", (error) => {
  console.error("❌ Erro na conexão do MongoDB:", error.message);
});

module.exports = {
  mongoose,
  connectDatabase,
};
