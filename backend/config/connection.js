const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PWD || '',
    database: process.env.DB_NAME || 'seu_banco',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    retry: {
      max: 5,
      timeout: 5000
    },
    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: true
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PWD || '',
    database: process.env.DB_NAME_TEST || 'test_database',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: true
    }
  }
};

// Criar instância do Sequelize
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

const sequelize = new Sequelize(
  currentConfig.database,
  currentConfig.username,
  currentConfig.password,
  currentConfig
);

// Testar conexão
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com PostgreSQL estabelecida.');
  })
  .catch(err => {
    console.error('❌ Falha na conexão:', err);
    process.exit(1);
  });

// Exportar para compatibilidade com models/index.js
module.exports = config;

// Exportar instâncias para uso direto (compatibilidade com código existente)
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;