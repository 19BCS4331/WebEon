// routes/authRoutes.js
const express = require("express");
const {
  register,
  login,
  getBranches,
  getCounters,
  getFinYear,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/login/branchOnUser", getBranches);
router.post("/login/CounterOnBranchAndUser", getCounters);
router.get("/login/finYear", getFinYear);

module.exports = router;
