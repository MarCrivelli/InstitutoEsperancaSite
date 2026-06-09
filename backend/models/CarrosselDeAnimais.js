const connection = require("../config/connection");

const CarrosselDeAnimais = connection.sequelize.define(
  "carrossel_animais",
  {
    id: {
      type: connection.Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    animalId: {
      type: connection.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "animais",
        key: "id",
      },
    },
    descricaoSaida: {
      type: connection.Sequelize.TEXT,
      allowNull: true,
      field: "descricao_saida",
    },
    ordem: {
      type: connection.Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "carrossel_animais",
    underscored: true,
    timestamps: true,
  },
);

module.exports = CarrosselDeAnimais;
