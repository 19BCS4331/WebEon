const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Counter = sequelize.define(
  "counters",
  {
    counterid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Disable timestamps
  }
);

module.exports = Counter;
