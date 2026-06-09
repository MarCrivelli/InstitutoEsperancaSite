const connection = require("../config/connection");

const Avisos = connection.sequelize.define("avisos", {
  id: {
    type: connection.Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  descricao: {
    type: connection.Sequelize.TEXT,
    allowNull: false,
  },
  dataInicio: {
    type: connection.Sequelize.DATEONLY, // Apenas data, sem horário
    allowNull: false,
  },
  dataFim: {
    type: connection.Sequelize.DATEONLY, // Para períodos
    allowNull: true, // Pode ser null se for data única
  },
  ehPeriodo: {
    type: connection.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  corData: {
    type: connection.Sequelize.STRING(7), // Para cores hex (#ffffff)
    allowNull: false,
    defaultValue: '#000000',
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

module.exports = Avisos;