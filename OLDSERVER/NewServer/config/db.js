const { Sequelize } = require("sequelize");

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  define: {
    freezeTableName: true, // This ensures that table names are not modified
  },
});

module.exports = sequelize;
