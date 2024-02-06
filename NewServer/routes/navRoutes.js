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

router.post("/PaxCreate", authenticate, async (req, res) => {
  const {
    name,
    email,
    dob,
    contactno,
    nationality,
    occupation,
    residentstatus,
    address,
    bldg,
    street,
    city,
    state,
    country,
    pan_number,
    pan_name,
    pan_relation,
    uin,
    paidpan_number,
    paidby_name,
    loan_amount,
    declared_amount,
    gst_number,
    gst_state,
    istouroperator,
    isproprietorship,
    isnri,
    isitr,
    p_number,
    p_issuedat,
    p_issued_date,
    p_expiry,
    otherid_type,
    otherid_number,
    otherid_expiry,
    istcsexemption,
    exemption_remarks,
  } = req.body;

  const query = `
    INSERT INTO paxmaster (
name,
email,
dob,
contactno,
nationality,
occupation,
residentstatus,
address,
bldg,
street,
city,
state,
country,
pan_number,
pan_name,
pan_relation,
uin,
paidpan_number,
paidby_name,
loan_amount,
declared_amount,
gst_number,
gst_state,
istouroperator,
isproprietorship,
isnri,
isitr,
p_number,
p_issuedat,
p_issued_date,
p_expiry,
otherid_type,
otherid_number,
otherid_expiry,
istcsexemption,
exemption_remarks

    )
    VALUES (
      $1,
$2,
$3,
$4,
$5,
$6,
$7,
$8,
$9,
$10,
$11,
$12,
$13,
$14,
$15,
$16,
$17,
$18,
$19,
$20,
$21,
$22,
$23,
$24,
$25,
$26,
$27,
$28,
$29,
$30,
$31,
$32,
$33,
$34,
$35,
$36

    );
  `;

  try {
    pool.query(
      query,
      [
        name,
        email,
        dob,
        contactno,
        nationality,
        occupation,
        residentstatus,
        address,
        bldg,
        street,
        city,
        state,
        country,
        pan_number,
        pan_name,
        pan_relation,
        uin,
        paidpan_number,
        paidby_name,
        loan_amount,
        declared_amount,
        gst_number,
        gst_state,
        istouroperator,
        isproprietorship,
        isnri,
        isitr,
        p_number,
        p_issuedat,
        p_issued_date,
        p_expiry,
        otherid_type,
        otherid_number,
        otherid_expiry,
        istcsexemption,
        exemption_remarks,
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

router.get("/PaxDataID", authenticate, async (req, res) => {
  try {
    pool.query(`SELECT paxid,name from paxmaster`, (error, results) => {
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

router.post("/PaxDataFull", authenticate, async (req, res) => {
  const { paxid } = req.body;
  try {
    pool.query(
      `SELECT * from paxmaster WHERE paxid = $1`,
      [paxid],
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

router.get("/PaxDataFullMain", authenticate, async (req, res) => {
  try {
    pool.query(`SELECT * from paxmaster`, (error, results) => {
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
