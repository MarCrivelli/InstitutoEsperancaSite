/*
 * Substitui o carregador automático do Sequelize.
 * Importe os models diretamente ou através deste objeto.
 */

module.exports = {
  Animais: require("./Animais"),
  CarrosselDeAnimais: require("./CarrosselDeAnimais"),
  Doadores: require("./Doadores"),
  Documentos: require("./Documentos"),
  Destaque: require("./Destaque"),
  Usuario: require("./Usuario"),
};
