// models/userModel.js
const pool = require("../config/db");

const findBranchByUsername = async (username) => {
  const result = await pool.query(
    `SELECT "nBranchID","vBranchCode" FROM "mstBranchUserLink" WHERE "vUID" = $1 AND "bIsActive" = true`,
    [username]
  );
  return result.rows;
};

module.exports = {
  findBranchByUsername,
};
