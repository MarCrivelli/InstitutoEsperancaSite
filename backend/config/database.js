require("dotenv").config();

module.exports = {
  development: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/instituto_esperanca",
  },
  test: {
    uri: process.env.MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/instituto_esperanca_test",
  },
  production: {
    uri: process.env.MONGODB_URI,
  },
};
