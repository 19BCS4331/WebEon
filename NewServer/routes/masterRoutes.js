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

router.get("/CurrencyMasterAll", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT * FROM currencymaster WHERE isdeleted=false",
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

router.get("/CurrencyMasterOne", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT * FROM currencymaster where currencyid = 1",
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

router.post("/CurrencyMasterCreate", authenticate, async (req, res) => {
  const {
    currency_code,
    currency_name,
    priority,
    rateper,
    defaultminrate,
    defaultmaxrate,
    calculationmethod,
    openratepremium,
    gulfdiscfactor,
    isactive,
  } = req.body;

  const query = `
    INSERT INTO currencymaster (
      currency_code, currency_name,priority, rateper, defaultminrate, defaultmaxrate, calculationmethod ,
      openratepremium, gulfdiscfactor, isactive
    )
    VALUES (
      $1, $2, $3, $4 , $5, $6, $7, $8, $9, $10
    );
  `;

  try {
    pool.query(
      query,
      [
        currency_code,
        currency_name,
        priority,
        rateper,
        defaultminrate,
        defaultmaxrate,
        calculationmethod,
        openratepremium,
        gulfdiscfactor,
        isactive,
      ],
      (error, results) => {
        if (error) {
          console.error("Error inserting data:", error);
          res.status(500).json({ error: "Error inserting data" });
        }
        console.log("Data inserted successfully");
        res.status(201).json({ message: "Data inserted successfully" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/CurrencyMasterDelete", authenticate, async (req, res) => {
  const { currencyid } = req.body;

  const query = `
  UPDATE currencymaster
  SET isdeleted = true
  WHERE currencyid = $1
  `;

  try {
    pool.query(query, [currencyid], (error, results) => {
      if (error) {
        console.error("Error deleting row:", error);
        res.status(500).json({ error: "Error deleting data" });
      }
      console.log("Data deleted successfully");
      res.status(201).json({ message: "Data deleted successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/CurrencyMasterDeletedData", authenticate, async (req, res) => {
  const query = `
  SELECT * FROM currencymaster WHERE isdeleted = true
  `;

  try {
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching rows:", error);
        res.status(500).json({ error: "Error fetching rows" });
      }
      console.log("Data fetched successfully");
      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
