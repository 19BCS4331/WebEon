// controllers/userController.js
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

const resetUserPassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ error: "User ID and new password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await userModel.updateUserPassword(userId, hashedPassword);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password reset successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkAdmin = async (req, res) => {
  if (!req.user.bIsAdministrator) {
    return res.status(403).json({ error: "Access denied" });
  }
  res.json({ isAdmin: true });
};

module.exports = {
  resetUserPassword,
  checkAdmin,
};
