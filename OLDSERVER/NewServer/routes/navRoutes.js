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

router.get("/AuthCheck", authenticate, async (req, res) => {
  try {
    pool.query(`SELECT isverified from authverify`, (error, results) => {
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

router.get("/CurrencyNames", authenticate, async (req, res) => {
  try {
    pool.query(
      `SELECT currencyid,currency_code,currency_name from currencymaster WHERE isdeleted = false ORDER BY currencyid ASC`,
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

router.post("/CurrencyRates", authenticate, async (req, res) => {
  const { currencyid } = req.body;
  try {
    pool.query(
      `SELECT rate from forexrate WHERE m_currencyid = $1`,
      [currencyid],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).json(results.rows);
        console.log("CURRENCYRATE SENT");
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

// router.post("/CheckPax", authenticate, async (req, res) => {
//   const { name, contactno } = req.body;
//   try {
//     // Query the database to check if a PAX with the same name or number exists
//     const queryResult = await pool.query(
//       `SELECT * FROM paxmaster WHERE name = $1 OR contactno = $2`,
//       [name, contactno]
//     );

//     // If a PAX with the same name or number exists, return a response indicating its existence
//     if (queryResult.rows.length > 0) {
//       res.status(200).json({ exists: true, existingPax: queryResult.rows[0] });
//     } else {
//       // If no matching PAX is found, indicate that no PAX exists
//       res.status(200).json({ exists: false });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

router.post("/CheckPax", authenticate, async (req, res) => {
  const { name, contactno } = req.body;
  try {
    // Query the database to check if a PAX with the same name or number exists
    const queryResult = await pool.query(
      `SELECT * FROM paxmaster WHERE name = $1 OR contactno = $2`,
      [name, contactno]
    );

    // If a PAX with the same name or number exists
    if (queryResult.rows.length > 0) {
      const existingPax = queryResult.rows[0];
      if (existingPax.name !== name && existingPax.contactno === contactno) {
        // If mobile number exists but the name is different
        return res.status(200).json({
          exists: true,
          message: "Mobile number already exists with a different name.",
          existingPax,
        });
      } else if (
        existingPax.name === name &&
        existingPax.contactno !== contactno
      ) {
        // If name exists but number is different
        return res.status(200).json({
          exists: true,
          message: "Pax already exists with a different Number.",
          existingPax,
        });
      } else {
        // If same name or mobile number exists
        return res.status(200).json({
          exists: true,
          message: "A PAX with the same name or mobile number already exists.",
          existingPax,
        });
      }
    } else {
      // If no matching PAX is found, indicate that no PAX exists
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/AccProfileFetchBuyFromIndi", authenticate, async (req, res) => {
  try {
    pool.query(
      `SELECT id,acc_code,acc_name FROM accountsprofile_master WHERE acc_type = 'GL' AND ispurchase = true AND isactive = true AND isdeleted = false`,
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

module.exports = router;
