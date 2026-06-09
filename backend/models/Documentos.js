const connection = require("../config/connection");

const Documentos = connection.sequelize.define("documentos", {
  id: {
    type: connection.Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  nome: {
    type: connection.Sequelize.STRING,
    allowNull: false,
  },

  tipoDeArquivo: {
    type: connection.Sequelize.STRING,
    allowNull: false,
  },

  caminhoArquivo: {
    type: connection.Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Documentos;