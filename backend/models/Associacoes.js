/*
 * No Mongoose, as associações são definidas dentro dos schemas.
 *
 * Animais.js possui o virtual "itensCarrossel".
 * CarrosselDeAnimais.js possui:
 *   animalId: { type: ObjectId, ref: "Animais" }
 *
 * Portanto, este arquivo não precisa executar nenhuma configuração.
 */

function setupAssociations() {
  console.log("✅ Referências do Mongoose configuradas nos schemas.");
}

module.exports = setupAssociations;
