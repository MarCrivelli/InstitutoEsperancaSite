const connection = require("../config/connection");

const Doadores = connection.sequelize.define("doadores", {
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
  descricao: {
    type: connection.Sequelize.TEXT,
    allowNull: false,
  },
  imagem: {
    type: connection.Sequelize.STRING,
    allowNull: false,
  },
  createdAt: {
    type: connection.Sequelize.DATE,
    allowNull: false,
    defaultValue: connection.Sequelize.NOW,
  },
  updatedAt: {
    type: connection.Sequelize.DATE,
    allowNull: false,
    defaultValue: connection.Sequelize.NOW,
  },
});

module.exports = Doadores;