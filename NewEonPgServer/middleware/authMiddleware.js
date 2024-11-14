const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const secretKey = process.env.SECRET_KEY;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied", errorCode: "NO_TOKEN" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const result = await pool.query(
      'SELECT * FROM "mstUser" WHERE "nUserID" = $1',
      [decoded.userId]
    );
    const user = result.rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid token", errorCode: "USER_NOT_FOUND" });
    }

    if (user.token !== token) {
      return res
        .status(401)
        .json({ error: "Invalid token", errorCode: "TOKEN_MISMATCH" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired", errorCode: "TOKEN_EXPIRED" });
    } else if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token", errorCode: "INVALID_TOKEN" });
    } else {
      return res
        .status(401)
        .json({
          error: "Token verification failed",
          errorCode: "VERIFICATION_FAILED",
        });
    }
  }
};

module.exports = authMiddleware;
