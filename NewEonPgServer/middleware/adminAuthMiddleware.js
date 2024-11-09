// middleware/adminAuthMiddleware.js
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const secretKey = process.env.SECRET_KEY;

const adminAuthMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const result = await pool.query(
      'SELECT * FROM "mstUser" WHERE "nUserID" = $1',
      [decoded.userId]
    );
    const user = result.rows[0];

    if (!user || user.bIsAdministrator !== true) {
      return res.status(401).json({ error: "Access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = adminAuthMiddleware;
