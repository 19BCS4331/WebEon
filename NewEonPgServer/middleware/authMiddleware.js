const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const secretKey = process.env.SECRET_KEY;

const authMiddleware = async (req, res, next) => {
  // console.log("AuthMiddleware: Request received at", new Date().toISOString());

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // console.log("AuthMiddleware: No token provided");
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    // console.log("AuthMiddleware: Verifying token");
    const decoded = jwt.verify(token, secretKey);
    // console.log("AuthMiddleware: Token decoded", decoded);

    const result = await pool.query(
      'SELECT * FROM "mstUser" WHERE "nUserID" = $1',
      [decoded.userId]
    );
    const user = result.rows[0];

    if (!user) {
      // console.log("AuthMiddleware: No user found with the provided userId");
      return res.status(401).json({ error: "Invalid token" });
    }

    if (user.token !== token) {
      // console.log("AuthMiddleware: Token mismatch");
      return res.status(401).json({ error: "Invalid token" });
    }

    // console.log("AuthMiddleware: User authenticated", user);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // console.log("AuthMiddleware: Token expired at", err.expiredAt);
      return res.status(401).json({ error: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      // console.log("AuthMiddleware: Invalid token");
      return res.status(401).json({ error: "Invalid token" });
    } else {
      // console.log("AuthMiddleware: Token verification failed", err);
      return res.status(401).json({ error: "Invalid token" });
    }
  }
};

module.exports = authMiddleware;
