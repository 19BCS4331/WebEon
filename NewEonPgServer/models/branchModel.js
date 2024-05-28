// models/userModel.js
const pool = require("../config/db");

const findBranchByUsername = async (username) => {
  const result = await pool.query(
    `select "nBranchID","vBranchCode" from "mstBranchUserLink" where "vUID" = $1 AND "bIsActive" = true`,
    [username]
  );
  return result.rows;
};

module.exports = {
  findBranchByUsername,
};
