const express = require("express");
const router = express.Router();
const pool = require("../../../../config/db");
const authMiddleware = require("../../../../middleware/authMiddleware");

const transformEmptyToNull = (data) => {
  const transformedData = {};
  for (const key in data) {
    if (data[key] === "") {
      transformedData[key] = null;
    } else {
      transformedData[key] = data[key];
    }
  }
  return transformedData;
};

//   ------------------------------------------------CURRENCY PROFILE-------------------------------------------------------------------

router.get("/currencyProfile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "mCurrency" WHERE "bIsDeleted"=false order by "nCurrencyID"'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/currencyProfile/countries", authMiddleware, async (req, res) => {
  const query = `select "vCode" from "MMASTERS" WHERE "vType" = 'CTRY' ORDER BY "vCode" ASC`;
  try {
    const { rows } = await pool.query(query);

    // Map the rows to extract just the values of "vFinCode"
    const Countries = rows.map((row) => row.vCode);

    console.log("Data Fetched successfully");
    res.json(Countries);
    // const result = await pool.query(
    //   `select "vCode" from "MMASTERS" WHERE "vType" = 'CTRY' ORDER BY "vCode" ASC`
    // );

    // res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CRUD
router.post("/currencyProfile", authMiddleware, async (req, res) => {
  const {
    vCncode,
    vCnName,
    nPriority,
    nRatePer,
    nDefaultMinRate,
    nDefaultMaxRate,
    vCalculationMethod,
    nOpenRatePremium,
    nGulfDiscFactor,
    bIsActive,
    vAmexCode,
    vCountryName,
  } = req.body;

  const parseInput = (input) => (input === "" ? null : input);

  const query = `
      INSERT INTO "mCurrency" (
"vCncode",
"vCnName",
"nPriority",
"nRatePer",
"nDefaultMinRate",
"nDefaultMaxRate",
"vCalculationMethod",
"nOpenRatePremium",
"nGulfDiscFactor",
"bIsActive",
"vAmexCode",
"vCountryName"
      )
      VALUES (
        $1, $2, $3, $4 , $5, $6, $7, $8, $9, $10,$11,$12
      )
    `;

  try {
    await pool.query(query, [
      parseInput(vCncode),
      parseInput(vCnName),
      parseInput(nPriority),
      parseInput(nRatePer),
      parseInput(nDefaultMinRate),
      parseInput(nDefaultMaxRate),
      parseInput(vCalculationMethod),
      parseInput(nOpenRatePremium),
      parseInput(nGulfDiscFactor),
      parseInput(bIsActive),
      parseInput(vAmexCode),
      parseInput(vCountryName),
    ]);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/currencyProfile", authMiddleware, async (req, res) => {
  const {
    nCurrencyID,
    vCncode,
    vCnName,
    nPriority,
    nRatePer,
    nDefaultMinRate,
    nDefaultMaxRate,
    vCalculationMethod,
    nOpenRatePremium,
    nGulfDiscFactor,
    bIsActive,
    vAmexCode,
    vCountryName,
  } = req.body;

  const query = `
    UPDATE "mCurrency"
    SET "vCncode" = $2, "vCnName" = $3, "nPriority" = $4, "nRatePer" = $5, "nDefaultMinRate" = $6, "nDefaultMaxRate" = $7, "vCalculationMethod" = $8, "nOpenRatePremium" =$9, "nGulfDiscFactor" = $10, "bIsActive" = $11,"vAmexCode"=$12,"vCountryName"=$13
    WHERE "nCurrencyID" = $1
    `;

  try {
    pool.query(
      query,
      [
        nCurrencyID,
        vCncode,
        vCnName,
        nPriority,
        nRatePer,
        nDefaultMinRate,
        nDefaultMaxRate,
        vCalculationMethod,
        nOpenRatePremium,
        nGulfDiscFactor,
        bIsActive,
        vAmexCode,
        vCountryName,
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

router.post("/currencyProfile/delete", authMiddleware, async (req, res) => {
  const { idToDelete } = req.body;

  const query = `
    UPDATE "mCurrency"
    SET "bIsDeleted" = true
    WHERE "nCurrencyID" = $1
    `;

  try {
    pool.query(query, [idToDelete], (error, results) => {
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
// CRUD

//   ------------------------------------------------CURRENCY PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------FINANCIAL PROFILE-------------------------------------------------------------------

router.get("/financialProfile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "FinancialProfile" WHERE "bIsDeleted"=false order by "nFID"'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CRUD
router.post("/financialProfile", authMiddleware, async (req, res) => {
  const { vFinType, vFinCode, vFinName, vDefaultSign, nPriority } = req.body;

  const parseInput = (input) => (input === "" ? null : input);

  const query = `
      INSERT INTO "FinancialProfile" (
"vFinType",
    "vFinCode",
    "vFinName",
    "vDefaultSign",
    "nPriority"
      )
      VALUES (
        $1, $2, $3, $4 , $5
      )
    `;

  try {
    await pool.query(query, [
      parseInput(vFinType),
      parseInput(vFinCode),
      parseInput(vFinName),
      parseInput(vDefaultSign),
      parseInput(nPriority),
    ]);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/financialProfile", authMiddleware, async (req, res) => {
  const { nFID, vFinType, vFinCode, vFinName, vDefaultSign, nPriority } =
    req.body;

  const query = `
    UPDATE "FinancialProfile"
    SET "vFinType" = $2, "vFinCode" = $3, "vFinName" = $4, "vDefaultSign" = $5, "nPriority" = $6
    WHERE "nFID" = $1
    `;

  try {
    pool.query(
      query,
      [nFID, vFinType, vFinCode, vFinName, vDefaultSign, nPriority],
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

router.post("/financialProfile/delete", authMiddleware, async (req, res) => {
  const { idToDelete } = req.body;

  const query = `
    UPDATE "FinancialProfile"
    SET "bIsDeleted" = true
    WHERE "nFID" = $1
    `;

  try {
    pool.query(query, [idToDelete], (error, results) => {
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
// CRUD

//   ------------------------------------------------FINANCIAL PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------FINANCIAL SUBPROFILE-------------------------------------------------------------------

router.get("/financialSubProfile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      //       `SELECT
      // 	fsp."nSFID",
      //     fp."nFID",
      //     fp."vFinType",
      //     fp."vFinCode",
      //     fsp."vSubFinCode",
      //     fsp."vSubFinName",
      // 	fsp."nPriority"
      // FROM
      //     public."FinancialProfile" fp
      // JOIN
      //     public."FinancialSubProfile" fsp ON fp."nFID" = fsp."nFID" WHERE fsp."bIsDeleted" = false

      // `
      `SELECT * FROM public."FinancialSubProfile" WHERE "bIsDeleted" = false`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------options--------------
router.post(
  "/financialSubProfile/finCode",
  authMiddleware,
  async (req, res) => {
    const { vFinType } = req.body;

    const query = `
      SELECT DISTINCT fp."vFinCode"
      FROM public."FinancialProfile" fp
      JOIN public."FinancialSubProfile" fsp ON fp."nFID" = fsp."nFID"
      WHERE fp."vFinType" = $1;
    `;

    try {
      const { rows } = await pool.query(query, [vFinType]);

      // Map the rows to extract just the values of "vFinCode"
      const finCodes = rows.map((row) => row.vFinCode);

      console.log("Data Fetched successfully");
      res.json(finCodes);
    } catch (err) {
      console.error("Error Fetching:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ------options--------------

// CRUD
router.post("/financialSubProfile", authMiddleware, async (req, res) => {
  const { vFinCode, vSubFinCode, vSubFinName, nPriority, vFinType } = req.body;

  const parseInput = (input) => (input === "" ? null : input);

  // Query to retrieve nFID based on vFinCode
  const findNFIDQuery = `
    SELECT "nFID" FROM "FinancialProfile" WHERE "vFinCode" = $1;
  `;

  const insertQuery = `
    INSERT INTO "FinancialSubProfile" (
      "vFinCode", "nFID", "vSubFinCode", "vSubFinName", "nPriority","vFinType"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6
    );
  `;

  try {
    // Fetch nFID based on vFinCode
    const { rows } = await pool.query(findNFIDQuery, [vFinCode]);

    // If no rows are returned or if nFID is not found, handle the error
    if (rows.length === 0) {
      throw new Error(`nFID not found for vFinCode: ${vFinCode}`);
    }

    // Extract nFID from the result
    const nFID = rows[0].nFID;

    // Execute the insertion query
    await pool.query(insertQuery, [
      parseInput(vFinCode),
      nFID, // Insert the retrieved nFID value
      parseInput(vSubFinCode),
      parseInput(vSubFinName),
      parseInput(nPriority),
      parseInput(vFinType),
    ]);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

// router.put("/financialSubProfile", authMiddleware, async (req, res) => {
//   const { nSFID, vFinCode, vSubFinCode, vSubFinName, nPriority, vFinType } =
//     req.body;

//   const query = `
//     UPDATE "FinancialSubProfile"
//     SET "vFinCode" = $2, "vSubFinCode" = $3, "vSubFinName" = $4, "nPriority" = $5, "vFinType" = $6
//     WHERE "nSFID" = $1
//     `;

//   try {
//     pool.query(
//       query,
//       [nSFID, vFinCode, vSubFinCode, vSubFinName, nPriority, vFinType],
//       (error, results) => {
//         if (error) {
//           console.error("Error Editing:", error);
//           res.status(500).json({ error: "Error Editing data" });
//         }
//         console.log("Data Edited successfully");
//         res.status(201).json({ message: "Data Edited successfully" });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

router.put("/financialSubProfile", authMiddleware, async (req, res) => {
  const { nSFID, vFinCode, vSubFinCode, vSubFinName, nPriority, vFinType } =
    req.body;

  const getNFIDQuery = `
    SELECT "nFID" FROM "FinancialProfile" WHERE "vFinType" = $1
  `;

  const updateQuery = `
    UPDATE "FinancialSubProfile"
    SET "vFinCode" = $2, "vSubFinCode" = $3, "vSubFinName" = $4, "nPriority" = $5, "vFinType" = $6, "nFID" = $7
    WHERE "nSFID" = $1
  `;

  try {
    // Get nFID from FinancialProfile based on vFinType
    const nFIDResult = await pool.query(getNFIDQuery, [vFinType]);
    if (nFIDResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "vFinType not found in FinancialProfile" });
    }
    const nFID = nFIDResult.rows[0].nFID;

    // Update FinancialSubProfile with the retrieved nFID and other fields
    await pool.query(updateQuery, [
      nSFID,
      vFinCode,
      vSubFinCode,
      vSubFinName,
      nPriority,
      vFinType,
      nFID,
    ]);

    console.log("Data Edited successfully");
    res.status(201).json({ message: "Data Edited successfully" });
  } catch (error) {
    console.error("Error Editing:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/financialSubProfile/delete", authMiddleware, async (req, res) => {
  const { idToDelete } = req.body;

  const query = `
    UPDATE "FinancialSubProfile"
    SET "bIsDeleted" = true
    WHERE "nSFID" = $1
    `;

  try {
    pool.query(query, [idToDelete], (error, results) => {
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
// CRUD

//   ------------------------------------------------FINANCIAL SUBPROFILE END-------------------------------------------------------------------

//   ------------------------------------------------DIVISION PROFILE-------------------------------------------------------------------

router.get("/divisionProfile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "DivisionProfile" WHERE "bIsDeleted" = false`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------options--------------
router.get("/divisionProfile/branch", authMiddleware, async (req, res) => {
  const query = `select "vBranchCode" from "mstCompany" where "bIsdeleted" = false AND "bActive" = true`;

  try {
    const { rows } = await pool.query(query);

    // Map the rows to extract just the values of "vFinCode"
    const branchCodes = rows.map((row) => row.vBranchCode);

    console.log("Data Fetched successfully");
    res.json(branchCodes);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------options--------------

// CRUD
router.post("/divisionProfile", authMiddleware, async (req, res) => {
  const { vDivCode, vDivName, vBranchCode } = req.body;

  const parseInput = (input) => (input === "" ? null : input);

  const insertQuery = `
    INSERT INTO "DivisionProfile" (
      "vDivCode", "vDivName", "vBranchCode"
    )
    VALUES (
      $1, $2, $3
    );
  `;

  try {
    await pool.query(insertQuery, [
      parseInput(vDivCode),
      parseInput(vDivName),
      parseInput(vBranchCode),
    ]);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/divisionProfile", authMiddleware, async (req, res) => {
  const { nDivisionID, vDivCode, vDivName, vBranchCode } = req.body;

  const query = `
    UPDATE "DivisionProfile"
    SET "vDivCode" = $2, "vDivName" = $3, "vBranchCode" = $4
    WHERE "nDivisionID" = $1
    `;

  try {
    pool.query(
      query,
      [nDivisionID, vDivCode, vDivName, vBranchCode],
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

router.post("/divisionProfile/delete", authMiddleware, async (req, res) => {
  const { idToDelete } = req.body;

  const query = `
    UPDATE "DivisionProfile"
    SET "bIsDeleted" = true
    WHERE "nDivisionID" = $1
    `;

  try {
    pool.query(query, [idToDelete], (error, results) => {
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
// CRUD

//   ------------------------------------------------DIVISION PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------DIVISION Details-------------------------------------------------------------------

router.get("/divisionDetails", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      //       `SELECT
      // 	dpd."nDivProDtlID",
      //     dpd."nDivisionID",
      // 	dp."vDivCode",
      //     dpd."nNo_of_Emp",
      //     dpd."vHeadDept",
      // 	dpd."vContactH",
      // 	dpd."vContactAM",
      // 	dpd."nAreaManagerID"
      // FROM
      //     public."DivisionProfile" dp
      // JOIN
      //     public."DivisionProfileDetails" dpd ON dp."nDivisionID" = dpd."nDivisionID" WHERE dpd."bIsDeleted" = false

      // `
      `SELECT * FROM "DivisionProfileDetails" WHERE "bIsDeleted" = false`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------options--------------
router.get("/divisionDetails/divCode", authMiddleware, async (req, res) => {
  const query = `select "vDivCode" from "DivisionProfile" where "bIsDeleted" = false `;

  try {
    const { rows } = await pool.query(query);

    // Map the rows to extract just the values of "vFinCode"
    const branchCodes = rows.map((row) => row.vDivCode);

    console.log("Data Fetched successfully");
    res.json(branchCodes);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// INSERT

router.post("/divisionDetails", authMiddleware, async (req, res) => {
  const {
    vDivCode,
    nNo_of_Emp,
    vHeadDept,
    vContactH,
    nAreaManagerID,
    vContactAM,
  } = req.body;

  const parseInput = (input) => (input === "" ? null : input);

  const insertQuery = `
    INSERT INTO "DivisionProfileDetails" (
      "vDivCode", "nNo_of_Emp","vHeadDept","vContactH","nAreaManagerID","vContactAM"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6
    );
  `;

  try {
    await pool.query(insertQuery, [
      parseInput(vDivCode),
      parseInput(nNo_of_Emp),
      parseInput(vHeadDept),
      parseInput(vContactH),
      parseInput(nAreaManagerID),
      parseInput(vContactAM),
    ]);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/divisionDetails/", authMiddleware, async (req, res) => {
  const {
    vDivCode,
    nNo_of_Emp,
    vHeadDept,
    vContactH,
    nAreaManagerID,
    vContactAM,
    nDivProDtlID,
  } = req.body;

  const parseInput = (input) => (input === "" ? null : input);

  // Query to retrieve nDivisionID based on vDivCode
  const findnDivisionIDQuery = `
    SELECT "nDivisionID" FROM "DivisionProfile" WHERE "vDivCode" = $1;
  `;

  const updateQuery = `
    UPDATE "DivisionProfileDetails"
    SET
      "nDivisionID" = $1,
      "nNo_of_Emp" = $2,
      "vHeadDept" = $3,
      "vContactH" = $4,
      "nAreaManagerID" = $5,
      "vContactAM" = $6,
      "vDivCode" = $8
    WHERE
      "nDivProDtlID" = $7;
  `;

  try {
    // Fetch nDivisionID based on vDivCode
    const { rows } = await pool.query(findnDivisionIDQuery, [vDivCode]);

    // If no rows are returned or if nDivisionID is not found, handle the error
    if (rows.length === 0) {
      throw new Error(`nDivisionID not found for vDivCode: ${vDivCode}`);
    }

    // Extract nDivisionID from the result
    const nDivisionID = rows[0].nDivisionID;

    // Execute the update query
    await pool.query(updateQuery, [
      nDivisionID,
      parseInput(nNo_of_Emp),
      parseInput(vHeadDept),
      parseInput(vContactH),
      parseInput(nAreaManagerID),
      parseInput(vContactAM),
      parseInput(nDivProDtlID),
      parseInput(vDivCode),
      // Assuming id is passed as a route parameter
    ]);

    console.log("Data updated successfully");
    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// router.put("/divisionDetails", authMiddleware, async (req, res) => {
//   const {
//     nDivProDtlID,
//     vDivCode,
//     nNo_of_Emp,
//     vHeadDept,
//     vContactH,
//     nAreaManagerID,
//     vContactAM,
//   } = req.body;

//   const findnDivisionIDQuery = `
//     SELECT "nDivisionID" FROM "DivisionProfile" WHERE "vDivCode" = $2;
//   `;

//   const query = `
//     UPDATE "DivisionProfileDetails"
//     SET "nDivisionID" = $2, "nNo_of_Emp" = $3, "vHeadDept" = $4, "vContactH"=$5,"nAreaManagerID"=$6,"vContactAM"=$7
//     WHERE "nDivProDtlID" = $1
//     `;

//   try {
//     const { rows } = await pool.query(findnDivisionIDQuery, [vDivCode]);

//     // If no rows are returned or if nDivisionID is not found, handle the error
//     if (rows.length === 0) {
//       throw new Error(`nDivisionID not found for vDivCode: ${vDivCode}`);
//     }

//     // Extract nDivisionID from the result
//     const nDivisionID = rows[0].nDivisionID;

//     pool.query(
//       query,
//       [
//         nDivProDtlID,
//         nDivisionID,
//         nNo_of_Emp,
//         vHeadDept,
//         vContactH,
//         nAreaManagerID,
//         vContactAM,
//       ],
//       (error, results) => {
//         if (error) {
//           console.error("Error Editing:", error);
//           res.status(500).json({ error: "Error Editing data" });
//         }
//         console.log("Data Edited successfully");
//         res.status(201).json({ message: "Data Edited successfully" });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

router.post("/divisionDetails/delete", authMiddleware, async (req, res) => {
  const { idToDelete } = req.body;

  const query = `
    UPDATE "DivisionProfileDetails"
    SET "bIsDeleted" = true
    WHERE "nDivProDtlID" = $1
    `;

  try {
    pool.query(query, [idToDelete], (error, results) => {
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
// CRUD

//   ------------------------------------------------DIVISION Details END-------------------------------------------------------------------

//   ------------------------------------------------ACCOUNTS PROFILE-------------------------------------------------------------------

router.get("/accountsProfile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "AccountsProfile" WHERE "bIsDeleted" = false ORDER BY "nAccID" ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------options--------------
router.get("/accountsProfile/division", authMiddleware, async (req, res) => {
  const query = `select "nDivisionID", "vDivCode", "vDivName" from "DivisionProfile" where "bIsDeleted" = false`;

  try {
    const { rows } = await pool.query(query);

    // Map the rows to extract the values and labels
    const divCode = rows.map((row) => ({
      value: row.nDivisionID,
      label: row.vDivName,
    }));

    console.log("Data Fetched successfully");
    res.json(divCode);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/accountsProfile/accType", authMiddleware, async (req, res) => {
  const query = `select distinct "vCode","vDescription","order" from "MMASTERS" where "vType" = 'AN' ORDER BY "order" ASC`;

  try {
    const { rows } = await pool.query(query);

    // Map the rows to extract the values and labels
    const accType = rows.map((row) => ({
      value: row.vCode,
      label: row.vDescription,
    }));

    console.log("Data Fetched successfully");
    res.json(accType);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(
  "/accountsProfile/subLedgerType",
  authMiddleware,
  async (req, res) => {
    const query = `select distinct "vCode","vDescription","order" from "MMASTERS" where "vType" = 'EN' ORDER BY "order" ASC`;

    try {
      const { rows } = await pool.query(query);

      // Map the rows to extract the values and labels
      const subLedgerType = rows.map((row) => ({
        value: row.vCode,
        label: row.vDescription,
      }));

      console.log("Data Fetched successfully");
      res.json(subLedgerType);
    } catch (err) {
      console.error("Error Fetching:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/accountsProfile/currency", authMiddleware, async (req, res) => {
  const query = `select "nCurrencyID","vCncode","vCnName" from "mCurrency" WHERE "bIsDeleted" = false ORDER BY "nCurrencyID" `;

  try {
    const { rows } = await pool.query(query);

    // Map the rows to extract just the values of "vFinCode"
    const currency = rows.map((row) => ({
      value: row.nCurrencyID,
      label: `${row.vCncode} - ${row.vCnName}`,
    }));

    console.log("Data Fetched successfully");
    res.json(currency);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/accountsProfile/finCode", authMiddleware, async (req, res) => {
  const { vFinType } = req.body;

  const query = `
      SELECT DISTINCT "vFinCode","vFinName"
      FROM "FinancialProfile" WHERE "vFinType" = $1;
    `;

  try {
    const { rows } = await pool.query(query, [vFinType]);

    const finCodes = rows.map((row) => ({
      value: row.vFinCode,
      label: `${row.vFinCode} - ${row.vFinName}`,
    }));
    // Map the rows to extract just the values of "vFinCode"
    // const finCodes = rows.map((row) => row.vFinCode);

    console.log("Data Fetched successfully");
    res.json(finCodes);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/accountsProfile/subfinCode", authMiddleware, async (req, res) => {
  const { vFinCode } = req.body;

  const query = `
      SELECT DISTINCT "vSubFinCode","vSubFinName"
      FROM "FinancialSubProfile" WHERE "vFinCode" = $1;
    `;

  try {
    const { rows } = await pool.query(query, [vFinCode]);

    const subfinCodes = rows.map((row) => ({
      value: row.vSubFinCode,
      label: row.vSubFinCode,
    }));
    // Map the rows to extract just the values of "vFinCode"
    // const finCodes = rows.map((row) => row.vFinCode);

    console.log("Data Fetched successfully");
    res.json(subfinCodes);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --------options-------------------

router.post("/accountsProfile", authMiddleware, async (req, res) => {
  const {
    nDivisionID,
    vCode,
    vName,
    vNature,
    vSblnat,
    vBankType,
    nCurrencyID,
    vFinType,
    vFinCode,
    vSubFinCode,
    nPCColID,
    bZeroBalatEOD,
    nBranchIDtoTransfer,
    bDoPurchase,
    bDoSales,
    bDoReceipts,
    bDoPayments,
    bActive,
    bCMSBank,
    bDirectRemit,
  } = transformEmptyToNull(req.body);

  const parseInput = (input) => (input === "" ? null : input);

  const insertQuery = `
    INSERT INTO "AccountsProfile" (
      "nDivisionID",
"vCode",
"vName",
"vNature",
"vSblnat",
"vBankType",
"nCurrencyID",
"vFinType",
"vFinCode",
"vSubFinCode",
"nPCColID",
"bZeroBalatEOD",
"nBranchIDtoTransfer",
"bDoPurchase",
"bDoSales",
"bDoReceipts",
"bDoPayments",
"bActive",
"bCMSBank",
"bDirectRemit"
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
$20
    ) RETURNING *
  `;

  try {
    await pool.query(insertQuery, [
      parseInput(nDivisionID),
      parseInput(vCode),
      parseInput(vName),
      parseInput(vNature),
      parseInput(vSblnat),
      parseInput(vBankType),
      parseInput(nCurrencyID),
      parseInput(vFinType),
      parseInput(vFinCode),
      parseInput(vSubFinCode),
      parseInput(nPCColID),
      parseInput(bZeroBalatEOD),
      parseInput(nBranchIDtoTransfer),
      parseInput(bDoPurchase),
      parseInput(bDoSales),
      parseInput(bDoReceipts),
      parseInput(bDoPayments),
      parseInput(bActive),
      parseInput(bCMSBank),
      parseInput(bDirectRemit),
    ]);

    console.log("Data inserted successfully");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/accountsProfile", authMiddleware, async (req, res) => {
  const {
    nDivisionID,
    vCode,
    vName,
    vNature,
    vSblnat,
    vBankType,
    nCurrencyID,
    vFinType,
    vFinCode,
    vSubFinCode,
    nPCColID,
    bZeroBalatEOD,
    nBranchIDtoTransfer,
    bDoPurchase,
    bDoSales,
    bDoReceipts,
    bDoPayments,
    bActive,
    bCMSBank,
    bDirectRemit,
    nAccID,
  } = transformEmptyToNull(req.body);

  const query = `UPDATE "AccountsProfile" SET "nDivisionID"=$1,
"vCode"=$2,
"vName"=$3,
"vNature"=$4,
"vSblnat"=$5,
"vBankType"=$6,
"nCurrencyID"=$7,
"vFinType"=$8,
"vFinCode"=$9,
"vSubFinCode"=$10,
"nPCColID"=$11,
"bZeroBalatEOD"=$12,
"nBranchIDtoTransfer"=$13,
"bDoPurchase"=$14,
"bDoSales"=$15,
"bDoReceipts"=$16,
"bDoPayments"=$17,
"bActive"=$18,
"bCMSBank"=$19,
"bDirectRemit"=$20 WHERE "nAccID" = $21 RETURNING *`;

  try {
    const result = await pool.query(query, [
      nDivisionID,
      vCode,
      vName,
      vNature,
      vSblnat,
      vBankType,
      nCurrencyID,
      vFinType,
      vFinCode,
      vSubFinCode,
      nPCColID,
      bZeroBalatEOD,
      nBranchIDtoTransfer,
      bDoPurchase,
      bDoSales,
      bDoReceipts,
      bDoPayments,
      bActive,
      bCMSBank,
      bDirectRemit,
      nAccID,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("Profile not found");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send("Error updating data");
  }
});

router.post("/accountsProfile/delete", authMiddleware, async (req, res) => {
  const { nAccID } = req.body;

  const query = `
    UPDATE "AccountsProfile"
    SET "bIsDeleted" = true
    WHERE "nAccID" = $1
    `;

  try {
    pool.query(query, [nAccID], (error, results) => {
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
// CRUD

//   ------------------------------------------------ACCOUNTS PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------AD1 Master-------------------------------------------------------------------

router.get("/ad1Master", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "ADIProviderMast" WHERE "bIsDeleted" = false ORDER BY "id"`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/ad1Master", authMiddleware, async (req, res) => {
  const {
    vCode,
    dIntdate,
    vName,
    vAddress1,
    vLocation,
    vPhone,
    vFax,
    vEmail,
    vWebsite,
    vCommRcvbl,
    vCommAccount,
    vStaxAccount,
    divfactor,
    ADType,
    vServiceChargeAcc,
    bLvalue,
  } = req.body;

  const parseInput = (input) => (input === "" ? null : input);

  const insertQuery = `
    INSERT INTO "ADIProviderMast" (
      "vCode",
    "dIntdate",
    "vName",
    "vAddress1",
    "vLocation",
    "vPhone",
    "vFax",
    "vEmail",
    "vWebsite",
    "vCommRcvbl",
    "vCommAccount",
    "vStaxAccount",
    "divfactor",
    "ADType",
    "vServiceChargeAcc",
    "bLvalue"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    );
  `;

  try {
    await pool.query(insertQuery, [
      parseInput(vCode),
      parseInput(dIntdate),
      parseInput(vName),
      parseInput(vAddress1),
      parseInput(vLocation),
      parseInput(vPhone),
      parseInput(vFax),
      parseInput(vEmail),
      parseInput(vWebsite),
      parseInput(vCommRcvbl),
      parseInput(vCommAccount),
      parseInput(vStaxAccount),
      parseInput(divfactor),
      parseInput(ADType),
      parseInput(vServiceChargeAcc),
      parseInput(bLvalue),
    ]);

    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/ad1Master", authMiddleware, async (req, res) => {
  const {
    id,
    vCode,
    dIntdate,
    vName,
    vAddress1,
    vLocation,
    vPhone,
    vFax,
    vEmail,
    vWebsite,
    vCommRcvbl,
    vCommAccount,
    vStaxAccount,
    divfactor,
    ADType,
    vServiceChargeAcc,
    bLvalue,
  } = req.body;

  const query = `
    UPDATE "ADIProviderMast"
    SET "vCode" = $2, "dIntdate" = $3, "vName" = $4, "vAddress1"=$5,"vLocation"=$6,"vPhone"=$7,"vFax"=$8,"vEmail"=$9,"vWebsite"=$10,"vCommRcvbl"=$11,"vCommAccount"=$12,"vStaxAccount"=$13,"divfactor"=$14,"ADType"=$15,"vServiceChargeAcc"=$16,"bLvalue"=$17
    WHERE "id" = $1
    `;

  try {
    pool.query(
      query,
      [
        id,
        vCode,
        dIntdate,
        vName,
        vAddress1,
        vLocation,
        vPhone,
        vFax,
        vEmail,
        vWebsite,
        vCommRcvbl,
        vCommAccount,
        vStaxAccount,
        divfactor,
        ADType,
        vServiceChargeAcc,
        bLvalue,
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

router.post("/ad1Master/delete", authMiddleware, async (req, res) => {
  const { id } = req.body;

  const query = `
    UPDATE "ADIProviderMast"
    SET "bIsDeleted" = true
    WHERE "id" = $1
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
// CRUD

//   ------------------------------------------------AD1 Master END-------------------------------------------------------------------

module.exports = router;
