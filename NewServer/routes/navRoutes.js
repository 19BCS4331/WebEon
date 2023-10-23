const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
// const User = require("../models/User");
// const { where } = require("sequelize");
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TestDB",
  password: "J1c2m@raekat",
  port: 5432,
});

router.get("/NavMenu", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT * FROM navigationmenu ORDER BY id ASC ",
      (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).json(results.rows);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
