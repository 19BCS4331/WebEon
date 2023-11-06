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
      "SELECT * FROM navigationmenu WHERE isvisible=true ORDER BY id ASC",
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

// -------------------------------BUYFROMINDIVI------------------------------------

router.get("/CityOptions", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT description FROM optionsmaster WHERE type='City'",
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

router.get("/CountryOptions", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT description FROM optionsmaster WHERE type='CTRY' ORDER BY description ASC",
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

router.get("/NationalityOptions", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT description FROM optionsmaster WHERE type='NAT' ORDER BY description ASC",
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

router.get("/StateOptions", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT description FROM optionsmaster WHERE type='State' ORDER BY description ASC",
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

router.get("/IDOptions", authenticate, async (req, res) => {
  try {
    pool.query(
      `SELECT description FROM optionsmaster WHERE type= '"ID"' AND isvisible IS NULL ORDER BY description ASC`,
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

router.get("/CurrencyRate", authenticate, async (req, res) => {
  try {
    pool.query(`select * from forexrate`, (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// -------------------------------BUYFROMINDIVI------------------------------------

module.exports = router;
