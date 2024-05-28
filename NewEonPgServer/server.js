// const express = require("express");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { Pool } = require("pg");
// const cors = require("cors");

// const app = express();
// const port = 6000;

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "dummy2",
//   password: "J1c2m@raekat",
//   port: 5432,
// });

// app.use(bodyParser.json());
// app.use(cors());

// const secretKey = "your-secret-key"; // Use an environment variable in production

// // Middleware to authenticate user
// const authMiddleware = async (req, res, next) => {
//   const token = req.headers["authorization"];

//   if (!token) {
//     return res.status(401).json({ error: "Access denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     const result = await pool.query(
//       'SELECT * FROM "mstUser" WHERE "nUserID" = $1',
//       [decoded.userId]
//     );
//     const user = result.rows[0];

//     if (!user || user.token !== token) {
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// // Middleware to authenticate admin
// const adminAuthMiddleware = async (req, res, next) => {
//   const token = req.headers["authorization"];

//   if (!token) {
//     return res.status(401).json({ error: "Access denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     const result = await pool.query(
//       'SELECT * FROM "mstUser" WHERE "nUserID" = $1',
//       [decoded.userId]
//     );
//     const user = result.rows[0];

//     if (!user || user.bIsAdministrator !== true) {
//       // Assuming 'role' column exists in users table
//       return res.status(401).json({ error: "Access denied" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// // Register
// app.post("/register", async (req, res) => {
//   const { username, password, IsAdmin } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const upperCaseUsername = username.toUpperCase(); // Convert username to uppercase

//   try {
//     const result = await pool.query(
//       'INSERT INTO "mstUser" ("vUID", "vPassword","bIsAdministrator") VALUES ($1, $2, $3) RETURNING *',
//       [upperCaseUsername, hashedPassword, IsAdmin]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Login
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const result = await pool.query(
//       'SELECT * FROM "mstUser" WHERE "vUID" = $1',
//       [username]
//     );
//     const user = result.rows[0];

//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const isPasswordMatch = await bcrypt.compare(password, user.vPassword);

//     if (!isPasswordMatch) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Invalidate any existing token
//     const newToken = jwt.sign({ userId: user.nUserID }, secretKey, {
//       expiresIn: "1h",
//     });

//     await pool.query('UPDATE "mstUser" SET token = $1 WHERE "nUserID" = $2', [
//       newToken,
//       user.nUserID,
//     ]);

//     res.json({ token: newToken });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Protected route example
// app.get("/protected", authMiddleware, (req, res) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });

// // Admin-only route to reset user password
// app.post(
//   "/admin/reset-user-password",
//   adminAuthMiddleware,
//   async (req, res) => {
//     const { userId, newPassword } = req.body;

//     if (!userId || !newPassword) {
//       return res
//         .status(400)
//         .json({ error: "User ID and new password are required" });
//     }

//     try {
//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       const result = await pool.query(
//         'UPDATE "mstUser" SET "vPassword" = $1 WHERE "nUserID" = $2 RETURNING *',
//         [hashedPassword, userId]
//       );

//       if (result.rowCount === 0) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       res.json({ message: "Password reset successful", user: result.rows[0] });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// // Check if user is admin
// app.get("/check-admin", authMiddleware, async (req, res) => {
//   if (!req.user.bIsAdministrator) {
//     return res.status(403).json({ error: "Access denied" });
//   }
//   res.json({ isAdmin: true });
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const navRoutes = require("./routes/navRoutes");

const app = express();
const port = 5002;

app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/nav", navRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
