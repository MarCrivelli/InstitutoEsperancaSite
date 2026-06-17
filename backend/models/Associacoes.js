// models/Associacoes.js
const Animais = require("./Animais");
const CarrosselAnimais = require("./CarrosselDeAnimais");

function setupAssociations() {
  Animais.hasMany(CarrosselAnimais, {
    foreignKey: "animalId",
    as: "itensCarrossel",
  });

  CarrosselAnimais.belongsTo(Animais, {
    foreignKey: "animalId",
    as: "animal",
  });

  console.log("Associações configuradas com sucesso");
}

module.exports = setupAssociations;