// models/userModel.js
const pool = require("../config/db");

const findCounterByBranchAndUser = async (
  vBranchCode,
  vUID,
  nBranchID,
  nUserID
) => {
  const result = await pool.query(
    //     `SELECT bcl."nCounterID"
    //     FROM "mstBranchCounterLink" AS bcl
    //     JOIN "mstCounterUserLink" AS cul
    //     ON bcl."nCounterID" = cul."nCounterID"
    //     WHERE bcl."vBranchCode" = $1 AND cul."vUID" = $2 AND cul."bIsActive" = true AND bcl."bIsActive" = true
    // `,
    `SELECT bcl."nCounterID" 
    FROM "mstBranchCounterLink" AS bcl
    JOIN "mstCounterUserLink" AS cul
    ON bcl."nCounterID" = cul."nCounterID"
    WHERE bcl."vBranchCode" = $1 AND cul."vUID" = $2 AND cul."nBranchID" = $3 AND cul."nUserID"= $4 AND cul."bIsActive" = true AND bcl."bIsActive" = true ORDER BY bcl."nCounterID" ASC`,
    [vBranchCode, vUID, nBranchID, nUserID]
  );
  return result.rows;
};

module.exports = {
  findCounterByBranchAndUser,
};
