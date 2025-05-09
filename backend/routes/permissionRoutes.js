const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { checkUserPermissions, hasPermission } = require("../utils/permissionUtils");

/**
 * Get all permissions for a specific menu path
 */
router.get("/check", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.nUserID;
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: "Menu path is required" });
    }
    
    const permissions = await checkUserPermissions(userId, path);
    res.json(permissions);
  } catch (error) {
    console.error("Error checking permissions:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check a specific permission for a menu path
 */
router.get("/has-permission", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.nUserID;
    const { path, permission } = req.query;
    
    if (!path || !permission) {
      return res.status(400).json({ error: "Menu path and permission type are required" });
    }
    
    const hasAccess = await hasPermission(userId, path, permission);
    res.json({ hasPermission: hasAccess });
  } catch (error) {
    console.error("Error checking specific permission:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
