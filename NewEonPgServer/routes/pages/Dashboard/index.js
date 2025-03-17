const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/authMiddleware");
const DashboardModel = require("../../../models/pages/Dashboard/DashboardModel");

// Get dashboard statistics
router.post("/stats", authMiddleware, async (req, res) => {
  try {
    const { nBranchID, vBranchCode } = req.body;
    
    // Check if branch parameters are provided
    if (!nBranchID || !vBranchCode) {
      return res.status(400).json({
        error: 'Branch ID and Branch Code are required in the request body'
      });
    }

    // Validate branch parameters
    const branchId = parseInt(nBranchID);
    if (isNaN(branchId) || branchId <= 0) {
      return res.status(400).json({
        error: 'Invalid Branch ID. Must be a positive number.'
      });
    }

    if (typeof vBranchCode !== 'string' || vBranchCode.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid Branch Code. Must be a non-empty string.'
      });
    }

    const stats = await DashboardModel.getDashboardStats(branchId, vBranchCode);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    const statusCode = error.message.includes('Branch ID and Branch Code are required') ? 400 : 500;
    res.status(statusCode).json({ 
      error: error.message || 'Failed to fetch dashboard statistics'
    });
  }
});

module.exports = router;
