// routes/userRoutes.js
const express = require("express");
const {
  resetUserPassword,
  checkAdmin,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const router = express.Router();

router.post(
  "/admin/reset-user-password",
  adminAuthMiddleware,
  resetUserPassword
);
router.get("/check-admin", authMiddleware, checkAdmin);

router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
