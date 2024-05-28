// models/userModel.js
const pool = require("../config/db");

const findUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM "mstUser" WHERE "vUID" = $1', [
    username,
  ]);
  return result.rows[0];
};

const findUserById = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM "mstUser" WHERE "nUserID" = $1',
    [userId]
  );
  return result.rows[0];
};

const createUser = async (username, hashedPassword, isAdmin) => {
  const result = await pool.query(
    'INSERT INTO "mstUser" ("vUID", "vPassword", "bIsAdministrator") VALUES ($1, $2, $3) RETURNING *',
    [username, hashedPassword, isAdmin]
  );
  return result.rows[0];
};

const updateUserToken = async (userId, token) => {
  await pool.query('UPDATE "mstUser" SET token = $1 WHERE "nUserID" = $2', [
    token,
    userId,
  ]);
};

const updateUserPassword = async (userId, hashedPassword) => {
  const result = await pool.query(
    'UPDATE "mstUser" SET "vPassword" = $1 WHERE "nUserID" = $2 RETURNING *',
    [hashedPassword, userId]
  );
  return result.rows[0];
};

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  updateUserToken,
  updateUserPassword,
};
