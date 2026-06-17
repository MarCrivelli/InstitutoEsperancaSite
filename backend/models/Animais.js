const connection = require("../config/connection");

const Animais = connection.sequelize.define(
  "animais",
  {
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
    idade: {
      type: connection.Sequelize.INTEGER,
      allowNull: false,
    },
    sexo: {
      type: connection.Sequelize.STRING,
      allowNull: false,
    },
    tipo: {
      type: connection.Sequelize.STRING,
      allowNull: false,
    },
    statusMicrochipagem: {
      type: connection.Sequelize.STRING,
      allowNull: false,
      field: "status_microchipagem",
    },
    statusVacinacao: {
      type: connection.Sequelize.STRING,
      allowNull: false,
      field: "status_vacinacao",
    },
    statusCastracao: {
      type: connection.Sequelize.STRING,
      allowNull: false,
      field: "status_castracao",
    },
    statusAdocao: {
      type: connection.Sequelize.STRING,
      allowNull: false,
      field: "status_adocao",
    },
    statusVermifugacao: {
      type: connection.Sequelize.STRING,
      allowNull: false,
      field: "status_vermifugacao",
    },
    imagemEntrada: {
      type: connection.Sequelize.STRING,
      allowNull: false,
      field: "imagem_entrada",
    },
    imagemSaida: {
      type: connection.Sequelize.STRING,
      allowNull: true,
      field: "imagem_saida",
    },
    dataVacinacao: {
      type: connection.Sequelize.DATE,
      allowNull: true,
      field: "data_vacinacao",
    },
    descricaoEntrada: {
      type: connection.Sequelize.TEXT,
      allowNull: true,
      field: "descricao_entrada",
    },
    descricaoSaida: {
      type: connection.Sequelize.TEXT,
      allowNull: true,
      field: "descricao_saida",
    },
  },
  {
    tableName: "animais",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Animais;