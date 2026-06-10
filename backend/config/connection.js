const { Sequelize } = require('sequelize');
require('dotenv').config();

const commonOptions = {
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true
  }
};

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...commonOptions,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  const config = {
    development: {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PWD || '',
      database: process.env.DB_NAME || 'seu_banco',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      ...commonOptions,
      retry: {
        max: 5,
        timeout: 5000
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
      ...commonOptions
    }
  };

  const env = process.env.NODE_ENV || 'development';
  const currentConfig = config[env];

  sequelize = new Sequelize(
    currentConfig.database,
    currentConfig.username,
    currentConfig.password,
    currentConfig
  );
}

// Testar conexão
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com PostgreSQL estabelecida.');
  })
  .catch(err => {
    console.error('❌ Falha na conexão:', err);
    process.exit(1);
  });

// Exportar para compatibilidade
module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PWD || '',
    database: process.env.DB_NAME || 'seu_banco',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
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
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  sequelize,
  Sequelize
};