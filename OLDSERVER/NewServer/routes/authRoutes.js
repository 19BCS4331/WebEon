const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  branch,
  counter,
  finyear,
} = require("../controllers/authController");

// @route    POST api/auth
// @desc     Authenticate user and get token
// @access   Public
router.post("/login", login);
router.post("/logout", logout);
router.get("/branch", branch);
router.get("/counter", counter);
router.get("/finyear", finyear);

module.exports = router;
