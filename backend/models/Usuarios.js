const connection = require("../config/connection");

const Usuario = connection.sequelize.define("db_usuario", {
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
  senha: {
    type: connection.Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: connection.Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  nivelDeAcesso: {
    type: connection.Sequelize.STRING,
    allowNull: false,
    defaultValue: "visitante",
  },
  telefone: {
    type: connection.Sequelize.STRING,
    allowNull: true, // Opcional
    validate: {
      isValidPhone(value) {
        if (value && value.trim() !== "") {
          // Regex para validar telefones brasileiros: +55 XX 9XXXX-XXXX ou variações
          const phoneRegex = /^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ""))) {
            throw new Error(
              "Telefone deve estar no formato válido (ex: +55 67 99999-9999)"
            );
          }
        }
      },
    },
  },
  receberEmailEventos: {
    type: connection.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  receberMensagensEventos: {
    type: connection.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  foto: {
    type: connection.Sequelize.TEXT, // Para URLs longas ou base64
    allowNull: true,
    validate: {
      isUrl: {
        msg: "Foto deve ser uma URL válida",
      },
    },
  },
  googleId: {
    type: connection.Sequelize.STRING,
    allowNull: true, // Apenas para usuários que fazem login com Google
    unique: true,
  },
  dataUltimoLogin: {
    type: connection.Sequelize.DATE,
    allowNull: true,
  },
  ativo: {
    type: connection.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true, 
  },
});

// ═══════════════════════════════════════════════════════════════
// 🔧 CONFIGURAÇÕES DO SEQUELIZE
// ═══════════════════════════════════════════════════════════════

// Sincronizar com alter: true para adicionar novos campos sem perder dados
Usuario.sync({ alter: true })
  .then(() => {
    console.log("✅ Modelo de usuário sincronizado com novos campos");
  })
  .catch((error) => {
    console.error("❌ Erro na sincronização:", error);
  });

module.exports = Usuario;
