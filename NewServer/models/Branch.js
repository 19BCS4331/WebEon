const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Branch = sequelize.define(
  "branches",
  {
    branchid: {
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

module.exports = Branch;
