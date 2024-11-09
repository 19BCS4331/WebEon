// models/userModel.js
const pool = require("../config/db");

const finYearFetch = async () => {
  const result = await pool.query(
    `select "nUniqCode","fromDate","tillDate" from "yrMaster"`
  );
  return result.rows;
};

module.exports = {
  finYearFetch,
};
