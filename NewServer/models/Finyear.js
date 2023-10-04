const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Finyear = sequelize.define(
  "finyear",
  {
    finyearid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Disable timestamps
  }
);

module.exports = Finyear;
