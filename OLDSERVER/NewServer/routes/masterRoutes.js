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

// -----------------------------FETCH-------------------------

// --------------------------------Accounts Profile Start

router.get("/FinCodeFetch", authenticate, async (req, res) => {
  try {
    pool.query(
      "SELECT type,code,name FROM fincode_master WHERE isdeleted=false",
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

router.post("/FinCodeFetchOnType", authenticate, async (req, res) => {
  const { type } = req.body;

  const query = `SELECT id,code,name FROM fincode_master WHERE type=$1 AND isdeleted=false`;

  try {
    // Use a promise-based query function to handle errors properly
    const { rows } = await pool.query(query, [type]);
    console.log("Data Fetched successfully");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error Fetching data:", error);
    res.status(500).json({ error: "Error Fetching data" });
  }
});

router.post("/SubFincodeFetchOnFinCode", authenticate, async (req, res) => {
  const { id } = req.body;

  const query = `SELECT id,code,name FROM sub_fincode_master WHERE finid=$1 AND isdeleted=false`;

  try {
    // Use a promise-based query function to handle errors properly
    const { rows } = await pool.query(query, [id]);
    console.log("Data Fetched successfully");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error Fetching data:", error);
    res.status(500).json({ error: "Error Fetching data" });
  }
});

router.post(
  "/SubFincodeFetchOnFinCodeForEdit",
  authenticate,
  async (req, res) => {
    const { code } = req.body;

    const query = `SELECT sub_fincode_master.id, sub_fincode_master.code, sub_fincode_master.name
  FROM sub_fincode_master
  JOIN fincode_master ON sub_fincode_master.finid = fincode_master.id
  WHERE fincode_master.code = $1;`;

    try {
      // Use a promise-based query function to handle errors properly
      const { rows } = await pool.query(query, [code]);
      console.log("Data Fetched successfully");
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error Fetching data:", error);
      res.status(500).json({ error: "Error Fetching data" });
    }
  }
);
// --------------------------------Accounts Profile END

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

router.get("/AgentsMaster", authenticate, async (req, res) => {
  const query = `
  SELECT * FROM agents_master
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

router.get("/MarktRefMaster", authenticate, async (req, res) => {
  const query = `
  SELECT id,name FROM markt_ref_master ORDER BY id ASC
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

router.get("/DeliAgentMaster", authenticate, async (req, res) => {
  const query = `
  SELECT id,name FROM delivery_agent_master ORDER BY id ASC
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

// ----------------------------- Currency FETCH END-------------------------

// System Setup Fetch Start ----------------------------------------------

router.get("/TaxMasterFetch", authenticate, async (req, res) => {
  const query = `
  SELECT * FROM tax_master WHERE isdeleted = false ORDER BY taxid;
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

router.get("/TaxMasterFetchTxn", authenticate, async (req, res) => {
  const query = `
  SELECT * FROM tax_master WHERE isdeleted = false AND is_active = true ORDER BY taxid;
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

router.get("/TaxMasterSlabFetch", authenticate, async (req, res) => {
  const query = `
  SELECT * FROM slabs_table ORDER BY taxid;
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

// System setup Fetch End ---------------------------------------------------

// -----------------INSERT---------------------

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

// -----------------INSERT END---------------------

// ---------------System Setup Insert-------------------------

router.post("/TaxMasterCreate", authenticate, async (req, res) => {
  try {
    const {
      TaxCode,
      description,
      ApplyAs,
      InclInvoiceAmount,
      RbiRefRate,
      SlabWise,
      TaxValue,
      feehead,
      isActive,
      isInstrumentChgHead,
      tranround,
      OtherInfoData,
      TransConfig,
      Slabs,
      isdeleted,
    } = req.body; // Extract data from request body

    const {
      "Retail Buying": retailBuying,
      "Retail Selling": retailSelling,
      "Bulk Buying": bulkBuying,
      "TC Settlement": tcSettlement,
      "Bulk Selling": bulkSelling,
      "Product Settlement": productSettlement,
    } = TransConfig;

    // Start a client connection from the pool
    const client = await pool.connect();
    try {
      // Begin a transaction
      await client.query("BEGIN");

      // Insert main data (excluding slabsData)
      const mainDataQuery = `
        INSERT INTO tax_master (
          tax_code, description, apply_as, incl_invoice_amount, rbi_ref_rate,
          slab_wise, tax_value, fee_head, is_active, is_instrument_chg_head,
          tran_round, other_info_data, retail_buying, retail_selling,
          bulk_buying, bulk_selling, tc_settlement, product_settlement,isdeleted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING taxid
      `;
      const mainDataValues = [
        TaxCode,
        description,
        ApplyAs,
        InclInvoiceAmount,
        RbiRefRate,
        SlabWise,
        TaxValue,
        feehead,
        isActive,
        isInstrumentChgHead,
        tranround,
        OtherInfoData,
        retailBuying,
        retailSelling,
        bulkBuying,
        bulkSelling,
        tcSettlement,
        productSettlement,
        isdeleted,
      ];
      const { rows: mainDataRows } = await client.query(
        mainDataQuery,
        mainDataValues
      );
      const mainDataId = mainDataRows[0].taxid;

      // Insert slabsData as separate rows
      for (const slab of Slabs) {
        const { srNo, minValue, maxValue, rate } = slab;
        const slabsDataQuery = `
          INSERT INTO slabs_table (taxid, sr_no, min_value, max_value, rate)
          VALUES ($1, $2, $3, $4, $5)
        `;
        const slabsDataValues = [mainDataId, srNo, minValue, maxValue, rate];
        await client.query(slabsDataQuery, slabsDataValues);
      }

      // Commit the transaction
      await client.query("COMMIT");

      res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
      // Rollback the transaction in case of an error
      await client.query("ROLLBACK");
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------System Setup Insert-------------------------

// System Setup Delete ----------------------------

router.post("/TaxMasterDelete", authenticate, async (req, res) => {
  const { taxid } = req.body;

  const query = `
  UPDATE tax_master
  SET isdeleted = true
  WHERE taxid = $1
  `;

  try {
    pool.query(query, [taxid], (error, results) => {
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

// System Setup Delete ----------------------------

// System Setup Edit ----------------------------

router.post("/TaxMasterEdit", authenticate, async (req, res) => {
  const {
    taxid,
    tax_code,
    description,
    apply_as,
    incl_invoice_amount,
    rbi_ref_rate,
    slab_wise,
    tax_value,
    fee_head,
    is_active,
    is_instrument_chg_head,
    tran_round,
    other_info_data,
    retail_buying,
    retail_selling,
    bulk_buying,
    bulk_selling,
    tc_settlement,
    product_settlement,
    slabData, // New array of slab data
  } = req.body;

  const query = `
  UPDATE tax_master
  SET tax_code = $2, description = $3, apply_as = $4, incl_invoice_amount = $5, rbi_ref_rate = $6, slab_wise = $7, tax_value = $8, fee_head =$9, is_active = $10, is_instrument_chg_head = $11,
  tran_round = $12,other_info_data=$13,retail_buying=$14,retail_selling=$15,bulk_buying=$16,bulk_selling=$17,tc_settlement=$18,product_settlement=$19
  WHERE taxid = $1
  `;

  try {
    // Start a transaction to ensure atomicity

    // Perform the update query for the tax master data
    pool.query(query, [
      taxid,
      tax_code,
      description,
      apply_as,
      incl_invoice_amount,
      rbi_ref_rate,
      slab_wise,
      tax_value,
      fee_head,
      is_active,
      is_instrument_chg_head,
      tran_round,
      other_info_data,
      retail_buying,
      retail_selling,
      bulk_buying,
      bulk_selling,
      tc_settlement,
      product_settlement,
    ]);

    // If slabData is provided, process it
    if (slabData && slabData.length > 0) {
      // Perform the insertion or update query for the slab data
      const slabQuery = `
    INSERT INTO slabs_table (slabsid, taxid, sr_no, min_value, max_value, rate)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (slabsid) DO UPDATE SET
    max_value = excluded.max_value,
    min_value = excluded.min_value,
    rate = excluded.rate
`;
      // Iterate over slabData array and perform the necessary database operations
      for (const slab of slabData) {
        pool.query(slabQuery, [
          slab.slabsid,
          taxid,
          slab.sr_no,
          slab.min_value,
          slab.max_value,
          slab.rate,
        ]);
      }
    }

    res.status(201).json({ message: "Data Edited successfully" });
  } catch (error) {
    // Rollback the transaction in case of any error

    console.error(error);
    res.status(500).send("Server error");
  }
});

// System Setup Edit ----------------------------

//Accounts Profile Insert------------------------

router.post("/AccountsPCreate", authenticate, async (req, res) => {
  try {
    const {
      AccCode,
      Accname,
      SL,
      BN,
      BranchIdTransfer,
      Currency,
      PCExpID,
      accType,
      division,
      doPayment,
      doPurchase,
      doReceipt,
      doSale,
      finCode,
      finSubCode,
      finType,
      isActive,
      isCMSBank,
      isDirRemit,
      isEodBalZero,
      mapAcc,
    } = req.body; // Extract data from request body

    // Start a client connection from the pool
    const client = await pool.connect();
    try {
      // Begin a transaction
      await client.query("BEGIN");

      // Insert main data (excluding slabsData)
      const query = `
        INSERT INTO AccountsProfile_Master (
          acc_code, acc_name, subledger,banknature, branch_id_transfer, currency,
          petty_cash_expense_id, acc_type, division, ispayment, ispurchase,
          isreceipt, issale, fin_code, fin_sub_code,
          fin_type, isactive, iscms, isdirremit,iszerobal_eod,map_to_account
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,$20,$21)
      `;
      const mainDataValues = [
        AccCode,
        Accname,
        SL,
        BN,
        BranchIdTransfer,
        Currency,
        PCExpID,
        accType,
        division,
        doPayment,
        doPurchase,
        doReceipt,
        doSale,
        finCode,
        finSubCode,
        finType,
        isActive,
        isCMSBank,
        isDirRemit,
        isEodBalZero,
        mapAcc,
      ];
      await client.query(query, mainDataValues);

      // Commit the transaction
      await client.query("COMMIT");

      res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
      // Rollback the transaction in case of an error
      await client.query("ROLLBACK");
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accounts Profile Insert End--------------------------

// ------------------------------------------Accounts Profile FETCH

router.get("/APMasterFetch", authenticate, async (req, res) => {
  const query = `
  SELECT * FROM accountsprofile_master WHERE isdeleted = false AND isactive = true ORDER BY id;
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

router.post("/getFincodeAsId", authenticate, async (req, res) => {
  const { code } = req.body;
  const query = `
  SELECT id FROM fincode_master WHERE code = $1;
  `;

  try {
    pool.query(query, [code], (error, results) => {
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

// ------------------------------------------Accounts Profile FETCH

// ------------------------------------------Accounts Profile EDIT
router.post("/APMasterEdit", authenticate, async (req, res) => {
  const {
    id,
    AccCode,
    Accname,
    SL,
    BN,
    BranchIdTransfer,
    Currency,
    PCExpID,
    accType,
    division,
    doPayment,
    doPurchase,
    doReceipt,
    doSale,
    finCode,
    finSubCode,
    finType,
    isActive,
    isCMSBank,
    isDirRemit,
    isEodBalZero,
    mapAcc,
  } = req.body;

  const query = `
  UPDATE accountsprofile_master
  SET acc_code=$2, acc_name = $3, subledger = $4,banknature = $5, branch_id_transfer = $6, currency = $7,
  petty_cash_expense_id = $8, acc_type = $9, division = $10, ispayment = $11, ispurchase = $12,
  isreceipt = $13, issale = $14, fin_code = $15, fin_sub_code = $16,
  fin_type = $17, isactive = $18, iscms = $19, isdirremit = $20,iszerobal_eod = $21,map_to_account = $22
  WHERE id = $1
  `;

  try {
    pool.query(
      query,
      [
        id,
        AccCode,
        Accname,
        SL,
        BN,
        BranchIdTransfer,
        Currency,
        PCExpID,
        accType,
        division,
        doPayment,
        doPurchase,
        doReceipt,
        doSale,
        finCode,
        finSubCode,
        finType,
        isActive,
        isCMSBank,
        isDirRemit,
        isEodBalZero,
        mapAcc,
      ],
      (error, results) => {
        if (error) {
          console.error("Error Editing:", error);
          res.status(500).json({ error: "Error Editing data" });
        }
        console.log("Data Edited successfully");
        res.status(201).json({ message: "Data Edited successfully" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ------------------------------------------Accounts Profile EDIT

// ------------------------------------------Accounts Profile DELETE

router.post("/APMasterDelete", authenticate, async (req, res) => {
  const { id } = req.body;

  const query = `
  UPDATE accountsprofile_master
  SET isdeleted = true
  WHERE id = $1
  `;

  try {
    pool.query(query, [id], (error, results) => {
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

// ------------------------------------------Accounts Profile DELETE

// ------------------DELETE---------------------------

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

// ------------------DELETE END---------------------------

// ---------------------EDIT------------------------------

router.post("/CurrencyMasterEdit", authenticate, async (req, res) => {
  const {
    currencyid,
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
  UPDATE currencymaster
  SET currency_code = $2, currency_name = $3, priority = $4, rateper = $5, defaultminrate = $6, defaultmaxrate = $7, calculationmethod = $8, openratepremium =$9, gulfdiscfactor = $10, isactive = $11
  WHERE currencyid = $1
  `;

  try {
    pool.query(
      query,
      [
        currencyid,
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
          console.error("Error Editing:", error);
          res.status(500).json({ error: "Error Editing data" });
        }
        console.log("Data Edited successfully");
        res.status(201).json({ message: "Data Edited successfully" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ---------------------EDIT END------------------------------

// CURRENCY MASTER TESTT---------------------

// router.get('/api/countries', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT id, name FROM countries');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.get("/api/currencies", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM currencymaster WHERE isdeleted=false order by currencyid"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CRUD operations for currencies
router.post("/api/currencies", authenticate, async (req, res) => {
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
    )
  `;

  try {
    await pool.query(query, [
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
    ]);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/api/currencies", authenticate, async (req, res) => {
  const {
    currencyid,
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
  UPDATE currencymaster
  SET currency_code = $2, currency_name = $3, priority = $4, rateper = $5, defaultminrate = $6, defaultmaxrate = $7, calculationmethod = $8, openratepremium =$9, gulfdiscfactor = $10, isactive = $11
  WHERE currencyid = $1
  `;

  try {
    pool.query(
      query,
      [
        currencyid,
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
          console.error("Error Editing:", error);
          res.status(500).json({ error: "Error Editing data" });
        }
        console.log("Data Edited successfully");
        res.status(201).json({ message: "Data Edited successfully" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/api/currencies/delete", authenticate, async (req, res) => {
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

// CURRENCY MASTER TESTT---------------------
module.exports = router;
