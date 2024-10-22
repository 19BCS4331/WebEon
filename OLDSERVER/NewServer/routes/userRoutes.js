const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const User = require("../models/User");
const { where } = require("sequelize");
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TestDB",
  password: "J1c2m@raekat",
  port: 5432,
});

// @route    GET api/users
// @desc     Get all users
// @access   Private
router.get("/", authenticate, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// router.get("/UserData/:userid", authenticate, async (req, res) => {
//   const { userid } = req.params;

//   try {
//     const userData = await User.findOne({ where: { userid } });
//     res.json(userData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

router.get("/UserData/:userid", authenticate, async (req, res) => {
  const { userid } = req.params;

  try {
    // Retrieve user data from the database
    const userData = await User.findOne({
      where: { userid },
      attributes: { exclude: ["password"] }, // Exclude sensitive fields
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return sanitized user data
    const sanitizedUserData = {
      userid: userData.userid,
      username: userData.username,
      role: userData.role,
      // Other non-sensitive fields
    };

    res.json(sanitizedUserData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
