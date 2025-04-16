// routes/userRoutes.js
const express = require("express");
const {
  resetUserPassword,
  checkAdmin,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const router = express.Router();
const pool = require("../config/db");

router.post(
  "/admin/reset-user-password",
  adminAuthMiddleware,
  resetUserPassword
);
router.get("/check-admin", authMiddleware, checkAdmin);

router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

router.get("/theme", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.nUserID;
    const { rows } = await pool.query(
      `SELECT "themeName", "themeMode" FROM "mstUser" WHERE "nUserID" = $1`,
      [userId]
    );
    if (rows.length > 0) {
      res.json({ theme: rows[0].themeName, mode: rows[0].themeMode });
    } else {
      res.status(404).send("Theme not found");
    }
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).send("Error fetching theme");
  }
});

router.post("/theme", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.nUserID;
    const { theme, mode } = req.body;
    await pool.query(
      `UPDATE "mstUser" SET "themeName" = $1, "themeMode" = $2 WHERE "nUserID" = $3`,
      [theme, mode, userId]
    );
    res.send("Theme updated successfully");
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).send("Error updating theme");
  }
});

module.exports = router;
