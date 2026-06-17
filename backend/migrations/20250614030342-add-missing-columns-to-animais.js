
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('animais', 'dataVacinacao', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('animais', 'descricao', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('animais', 'dataVacinacao');
    await queryInterface.removeColumn('animais', 'descricao');
  }
};