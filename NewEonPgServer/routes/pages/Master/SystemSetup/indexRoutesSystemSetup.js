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

// --------------------------COMPANY RECORD------------------------------

router.get("/companyRecord", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "mstCompanyRecord" WHERE "bIsdeleted"=false'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --------------------------COMPANY RECORD------------------------------

// ---------------------------------BRANCH/LOCATION PROFILE------------------------------------------------------------

// Options

router.get("/CompanyRecordOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nCompID","vCompanyName" FROM "mstCompanyRecord" WHERE "bIsdeleted"=false`
    );

    const CompanyOptions = rows.map((row) => ({
      value: row.nCompID,
      label: row.vCompanyName,
    }));

    res.json(CompanyOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/LocationOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "vDescription" FROM "MMASTERS" WHERE "vType" = 'ST' ORDER BY "vDescription"`
    );

    const LocationOptions = rows.map((row) => ({
      value: row.vDescription,
      label: row.vDescription,
    }));

    res.json(LocationOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/CityOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "vDescription","nMasterID" FROM "MMASTERS" WHERE "vType" = 'CT' ORDER BY "vDescription"`
    );

    const CityOptions = rows.map((row) => ({
      value: row.vDescription,
      label: row.vDescription,
      key: row.nMasterID,
    }));

    res.json(CityOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/LocationTypeOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nLocationTypeID", "vDescription" FROM "mstLocationType"`
    );

    const LocationTypeOptions = rows.map((row) => ({
      value: row.nLocationTypeID,
      label: row.vDescription,
    }));

    res.json(LocationTypeOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/UserOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nUserID","vName" FROM "mstUser" where "bActive" = true AND "bIsDeleted" = false AND "bIsGroup"=false ORDER BY "vName"`
    );

    const UserOptions = rows.map((row) => ({
      value: row.nUserID,
      label: row.vName,
    }));

    res.json(UserOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/BranchOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nBranchID","vBranchCode" FROM "mstCompany" WHERE "bIsdeleted"=false AND "bActive"= true`
    );

    const BranchOptions = rows.map((row) => ({
      value: row.nBranchID,
      label: row.vBranchCode,
    }));

    res.json(BranchOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Options END

// LINKING EDNPOINTS

// --------------------------------------------------------------BRANCH COUNTER LINK-----------------------------------------

// router.post("/BranchCounterLink", authMiddleware, async (req, res) => {
//   const { nBranchID } = req.body;
//   try {
//     const result = await pool.query(
//       `SELECT "bIsActive","nCounterID","vBranchCode","nBranchID" FROM "mstBranchCounterLink" WHERE "nBranchID" = $1 ORDER BY "nCounterID"`,
//       [nBranchID]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// router.put("/BranchCounterLink", authMiddleware, async (req, res) => {
//   const { nCounterID, nBranchID, bIsActive } = req.body;

//   const query = `
//     UPDATE "mstBranchCounterLink" SET "bIsActive" = $3 WHERE "nBranchID"= $2 AND "nCounterID" = $1
//     `;

//   try {
//     pool.query(query, [nCounterID, nBranchID, bIsActive], (error, results) => {
//       if (error) {
//         console.error("Error Editing:", error);
//         res.status(500).json({ error: "Error Editing data" });
//       }
//       console.log("Data Edited successfully");
//       res.status(201).json({ message: "Data Edited successfully" });
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// Fetch all counters and branch-counter links
router.post("/BranchCounterLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;

  try {
    // Fetch all counters
    const countersResult = await pool.query(
      `SELECT * FROM "mstCounter" WHERE "bIsDeleted" = false`
    );
    const counters = countersResult.rows;

    // Fetch existing branch-counter links
    const branchCounterResult = await pool.query(
      `SELECT * FROM "mstBranchCounterLink" WHERE "nBranchID" = $1`,
      [nBranchID]
    );
    const branchCounters = branchCounterResult.rows;

    // Merge data to indicate which counters are linked
    const mergedData = counters.map((counter) => {
      const link = branchCounters.find(
        (bc) => bc.nCounterID === counter.nCounterID
      );
      return {
        ...counter,
        bIsActive: link ? link.bIsActive : false,
      };
    });

    res.json(mergedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Insert/Update branch-counter links
router.put("/BranchCounterLink", authMiddleware, async (req, res) => {
  const { nCounterID, nBranchID, bIsActive } = req.body;

  const query = `
    INSERT INTO "mstBranchCounterLink" ("nCounterID", "nBranchID", "bIsActive","vBranchCode")
    VALUES ($1, $2, $3,(SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2)
    )
    ON CONFLICT ("nCounterID", "nBranchID")
    DO UPDATE SET "bIsActive" = EXCLUDED."bIsActive",
    "vBranchCode" = (SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2)
  `;

  try {
    await pool.query(query, [nCounterID, nBranchID, bIsActive]);
    res.status(201).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// --------------------------------------------------------------BRANCH COUNTER LINK END-----------------------------------------

// --------------------------------------------------------------BRANCH PRODUCT LINK-----------------------------------------
router.post("/BranchProductLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;
  try {
    const result = await pool.query(
      `SELECT "nBranchProductLinkID","bActive","vProductCode","bRevEffect","vBranchCode","nBranchID" FROM "mstBranchProductLink" WHERE "nBranchID" = $1 ORDER BY "nBranchProductLinkID" ASC `,
      [nBranchID]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/BranchProductLink", authMiddleware, async (req, res) => {
  const { nBranchProductLinkID, bActive, bRevEffect } = req.body;

  const query = `
    UPDATE "mstBranchProductLink" SET "bActive" = $2, "bRevEffect" = $3 WHERE "nBranchProductLinkID"= $1
  `;

  try {
    const result = await pool.query(query, [
      nBranchProductLinkID,
      bActive,
      bRevEffect,
    ]);
    res.status(200).json({ message: "Data Edited successfully" });
  } catch (error) {
    console.error("Error Editing:", error);
    res.status(500).json({ error: "Error Editing data" });
  }
});

router.put("/BranchProductLink/Rev", authMiddleware, async (req, res) => {
  const { nBranchProductLinkID, bActive, bRevEffect } = req.body;

  const query = `
    UPDATE "mstBranchProductLink" SET "bActive" = $2, "bRevEffect" = $3 WHERE "nBranchProductLinkID"= $1
  `;

  try {
    const result = await pool.query(query, [
      nBranchProductLinkID,
      bActive,
      bRevEffect,
    ]);
    res.status(200).json({ message: "Data Edited successfully" });
  } catch (error) {
    console.error("Error Editing:", error);
    res.status(500).json({ error: "Error Editing data" });
  }
});

// --------------------------------------------------------------BRANCH PRODUCT LINK END-----------------------------------------

// --------------------------------------------------------------BRANCH DIVISION LINK-----------------------------------------

router.post("/BranchDivisionLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;
  try {
    const result = await pool.query(
      `SELECT "nDivID","vDivCode","bActive","nBranchID","vBranchCode" FROM "DivisionProfileDetailsLink" WHERE "nBranchID"= $1`,
      [nBranchID]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/BranchDivisionLink", authMiddleware, async (req, res) => {
  const { nDivID, bActive } = req.body;

  const query = `
    UPDATE "DivisionProfileDetailsLink" SET "bActive" = $2 WHERE "nDivID" = $1
    `;

  try {
    pool.query(query, [nDivID, bActive], (error, results) => {
      if (error) {
        console.error("Error Editing:", error);
        res.status(500).json({ error: "Error Editing data" });
      }
      console.log("Data Edited successfully");
      res.status(201).json({ message: "Data Edited successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// --------------------------------------------------------------BRANCH DIVISION LINK END-----------------------------------------

// LINKING EDNPOINTS END

//  CRUD

// -----------------------------------------FETCH------------------------------------

router.get("/branchProfile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "mstCompany" WHERE "bIsdeleted" = false ORDER BY "nBranchID" ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -----------------------------------------FETCH END------------------------------------

// -----------------------------------------CREATE------------------------------------

router.post("/branchProfile", authMiddleware, async (req, res) => {
  const {
    nCompID,
    vBranchCode,
    vAddress1,
    vAddress2,
    vAddress3,
    vOperationalGrp,
    vLocation,
    vCity,
    vPinCode,
    STDCode,
    vTelNo1,
    vTelNo2,
    vFaxNo1,
    vFaxNo2,
    vEmailID,
    nLocationType,
    vContactPerson,
    vContactPersonNo,
    nOperationalUserID,
    nAccountUSERID,
    vAIINO,
    vWUAIINo,
    bServiceTaxApplicable,
    vServiceTaxRegNo,
    vRBILicenseNo,
    dRBIRegDate,
    vAuthorizedSignatory,
    nReportingBranchID,
    nWUBranchID,
    nCashLimit,
    vIBMNo1,
    vIBMNo2,
    bActive,
    nBranchIBMID,
    bHasShifts,
    nLastTCSettRefNo,
    nCurrencyLimit,
    ntempCashLimit,
    ntempCurrencyLimit,
  } = transformEmptyToNull(req.body);

  const vCityValue = vCity?.value || null;

  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO "mstCompany" (
        "nCompID",
        "vBranchCode",
        "vAddress1",
        "vAddress2",
        "vAddress3",
        "vOperationalGrp",
        "vLocation",
        "vCity",
        "vPinCode",
        "STDCode",
        "vTelNo1",
        "vTelNo2",
        "vFaxNo1",
        "vFaxNo2",
        "vEmailID",
        "nLocationType",
        "vContactPerson",
        "vContactPersonNo",
        "nOperationalUserID",
        "nAccountUSERID",
        "vAIINO",
        "vWUAIINo",
        "bServiceTaxApplicable",
        "vServiceTaxRegNo",
        "vRBILicenseNo",
        "dRBIRegDate",
        "vAuthorizedSignatory",
        "nReportingBranchID",
        "nWUBranchID",
        "nCashLimit",
        "vIBMNo1",
        "vIBMNo2",
        "bActive",
        "nBranchIBMID",
        "bHasShifts",
        "nLastTCSettRefNo",
        "nCurrencyLimit",
        "ntempCashLimit",
        "ntempCurrencyLimit"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39
      )
      RETURNING *
      `,
      [
        nCompID,
        vBranchCode,
        vAddress1,
        vAddress2,
        vAddress3,
        vOperationalGrp,
        vLocation,
        vCityValue,
        vPinCode,
        STDCode,
        vTelNo1,
        vTelNo2,
        vFaxNo1,
        vFaxNo2,
        vEmailID,
        nLocationType,
        vContactPerson,
        vContactPersonNo,
        nOperationalUserID,
        nAccountUSERID,
        vAIINO,
        vWUAIINo,
        bServiceTaxApplicable,
        vServiceTaxRegNo,
        vRBILicenseNo,
        dRBIRegDate,
        vAuthorizedSignatory,
        nReportingBranchID,
        nWUBranchID,
        nCashLimit,
        vIBMNo1,
        vIBMNo2,
        bActive,
        nBranchIBMID,
        bHasShifts,
        nLastTCSettRefNo,
        nCurrencyLimit,
        ntempCashLimit,
        ntempCurrencyLimit,
      ]
    );

    // Commit transaction
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Rollback transaction in case of error
    await client.query("ROLLBACK");
    console.error("Error creating data:", error);
    res.status(500).send("Error creating data");
  } finally {
    client.release();
  }
});

// -----------------------------------------CREATE END------------------------------------

// -----------------------------------------UPDATE------------------------------------

// Update branch profile
router.put("/branchProfile", authMiddleware, async (req, res) => {
  const {
    nBranchID,
    vBranchCode,
    vAddress1,
    vAddress2,
    vAddress3,
    vOperationalGrp,
    vLocation,
    vCity,
    vPinCode,
    STDCode,
    vTelNo1,
    vTelNo2,
    vFaxNo1,
    vFaxNo2,
    vEmailID,
    nLocationType,
    vContactPerson,
    vContactPersonNo,
    nOperationalUserID,
    nAccountUSERID,
    vAIINO,
    vWUAIINo,
    bServiceTaxApplicable,
    vServiceTaxRegNo,
    vRBILicenseNo,
    dRBIRegDate,
    vAuthorizedSignatory,
    nReportingBranchID,
    nWUBranchID,
    nCashLimit,
    vIBMNo1,
    vIBMNo2,
    bActive,
    nBranchIBMID,
    bHasShifts,
    nLastTCSettRefNo,
    nCurrencyLimit,
    ntempCashLimit,
    ntempCurrencyLimit,
  } = transformEmptyToNull(req.body);

  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query("BEGIN");

    const vCityValue = vCity?.value || null;

    const result = await client.query(
      `UPDATE "mstCompany"
      SET 
        "vBranchCode"=$2,
        "vAddress1"=$3,
        "vAddress2"=$4,
        "vAddress3"=$5,
        "vOperationalGrp"=$6,
        "vLocation"=$7,
        "vCity"=$8,
        "vPinCode"=$9,
        "STDCode"=$10,
        "vTelNo1"=$11,
        "vTelNo2"=$12,
        "vFaxNo1"=$13,
        "vFaxNo2"=$14,
        "vEmailID"=$15,
        "nLocationType"=$16,
        "vContactPerson"=$17,
        "vContactPersonNo"=$18,
        "nOperationalUserID"=$19,
        "nAccountUSERID"=$20,
        "vAIINO"=$21,
        "vWUAIINo"=$22,
        "bServiceTaxApplicable"=$23,
        "vServiceTaxRegNo"=$24,
        "vRBILicenseNo"=$25,
        "dRBIRegDate"=$26,
        "vAuthorizedSignatory"=$27,
        "nReportingBranchID"=$28,
        "nWUBranchID"=$29,
        "nCashLimit"=$30,
        "vIBMNo1"=$31,
        "vIBMNo2"=$32,
        "bActive"=$33,
        "nBranchIBMID"=$34,
        "bHasShifts"=$35,
        "nLastTCSettRefNo"=$36,
        "nCurrencyLimit"=$37,
        "ntempCashLimit"=$38,
        "ntempCurrencyLimit"=$39
      WHERE "nBranchID" = $1 
      RETURNING *`,
      [
        nBranchID,
        vBranchCode,
        vAddress1,
        vAddress2,
        vAddress3,
        vOperationalGrp,
        vLocation,
        vCityValue,
        vPinCode,
        STDCode,
        vTelNo1,
        vTelNo2,
        vFaxNo1,
        vFaxNo2,
        vEmailID,
        nLocationType,
        vContactPerson,
        vContactPersonNo,
        nOperationalUserID,
        nAccountUSERID,
        vAIINO,
        vWUAIINo,
        bServiceTaxApplicable,
        vServiceTaxRegNo,
        vRBILicenseNo,
        dRBIRegDate,
        vAuthorizedSignatory,
        nReportingBranchID,
        nWUBranchID,
        nCashLimit,
        vIBMNo1,
        vIBMNo2,
        bActive,
        nBranchIBMID,
        bHasShifts,
        nLastTCSettRefNo,
        nCurrencyLimit,
        ntempCashLimit,
        ntempCurrencyLimit,
      ]
    );

    if (result.rows.length === 0) {
      // Rollback transaction if no rows were affected
      await client.query("ROLLBACK");
      return res.status(404).send("Profile not found");
    }

    // Commit transaction
    await client.query("COMMIT");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    // Rollback transaction in case of error
    await client.query("ROLLBACK");
    console.error("Error updating branch profile:", error);
    res.status(500).send("Error updating branch profile");
  } finally {
    client.release();
  }
});

// -----------------------------------------UPDATE END------------------------------------

// -----------------------------------------DELETE------------------------------------
router.post("/branchProfileDelete", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;

  const query = `
  UPDATE "mstCompany"
  SET "bIsdeleted" = true
  WHERE "nBranchID" = $1
  `;

  try {
    pool.query(query, [nBranchID], (error, results) => {
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
// -----------------------------------------DELETE END------------------------------------

//  CRUD END

// ------------------------****-------BRANCH/LOCATION PROFILE END------****---------------------------------------------------

// --------------------------****-----ADV SETTINGS (GLOBAL AND BRANCH) START-----****-----------------------------------------------------

// -----------------------------------------FETCH START------------------------------------

router.post("/advSettings", authMiddleware, async (req, res) => {
  const { nBranchID } = transformEmptyToNull(req.body);

  try {
    const result = await pool.query(
      `SELECT * FROM "advsettings" WHERE "nBranchID" = $1 AND "SETTINGCATEGORY"!='' ORDER BY "DATACODE"`,
      [nBranchID]
    );
    res.status(201).json(result.rows);
  } catch (error) {
    console.error("Error creating data:", error);
    res.status(500).send("Error creating data");
  }
});

// -----------------------------------------FETCH END------------------------------------

// -----------------------------------------UPDATE START------------------------------------

// Update settings
router.post("/advUpdate", authMiddleware, async (req, res) => {
  const { nBranchID, settings } = req.body;

  // Ensure that settings is an array
  if (!Array.isArray(settings) || settings.length === 0) {
    return res.status(400).send("No settings to update.");
  }

  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query("BEGIN");

    // Update each setting
    for (const setting of settings) {
      const { DATACODE, DATAVALUE } = setting;
      await client.query(
        `UPDATE "advsettings" SET "DATAVALUE" = $1 WHERE "DATACODE" = $2 AND "nBranchID" = $3`,
        [DATAVALUE, DATACODE, nBranchID]
      );
    }

    // Commit transaction
    await client.query("COMMIT");
    res.status(200).send("Settings updated successfully.");
  } catch (error) {
    // Rollback transaction in case of error
    await client.query("ROLLBACK");
    console.error("Error updating settings:", error);
    res.status(500).send("Error updating settings.");
  } finally {
    client.release();
  }
});

// -----------------------------------------UPDATE END------------------------------------

// ---------------------------***----USER GROUP SETTINGS START---------***----------------------------------------------------

// Fetch
router.get("/userProfile", authMiddleware, async (req, res) => {
  const { isGroup } = req.query;
  if (isGroup === undefined) {
    return res.status(400).send("isGroup query parameter is required");
  }

  try {
    const result = await pool.query(
      `SELECT 
    "nUserID","nGroupID","vUID", "vName", "vCellNo", "vMailID", "bActive", "dValidTill", "bIsGroup", "nGroupPriority", "nBranchID", "bIsAdministrator", "bCanClearCounter", "bComplianceAuthorization", "bDataEntryAuthorization", "bCreditLimitAuthorization", "bMiscLimitAuthorization", "nCreatedBy", "dCreationDate", "nLastUpdateBy", "dLastUpdateDate", "nTrackingID", "nAPID", "bCanOptCentralM", "BDATAENTRYPRIVILEGE", "bSpecialRights", "nSanctionLimit", "bIsVerified", "nVerifyedby", "dVerifiedDate", "nDeletedby", "bIsDeleted", "dDeleteddate", "isCorporate", "CrpCode", "ref_branchlogin", "ref_finyearlogin", "bIsOrderCreation", "bIsOrderAllotment", "Permission", "Ref_BranchCode", "Ref_finyear", "Otausername", "biskeyuser", "OktaUserName", "DBName"
FROM "mstUser"
WHERE "bIsGroup" = $1;`,
      [isGroup]
    );
    res.status(201).json(result.rows);
  } catch (error) {
    console.error("Error Fetching data:", error);
    res.status(500).send("Error Fetching data");
  }
});

// Check for vUID availability
router.post("/checkCode", authMiddleware, async (req, res) => {
  const { vUID } = req.body;
  if (!vUID) return res.status(400).json({ error: "vUID is required" });

  try {
    const result = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM "mstUser" WHERE LOWER("vUID") = LOWER($1)) AS "exists"`,
      [vUID]
    );
    res.json({ exists: result.rows[0].exists });
  } catch (error) {
    console.error("Error checking code:", error);
    res.status(500).json({ error: "Error checking code" });
  }
});

// Check for vName availability
router.post("/checkName", authMiddleware, async (req, res) => {
  const { vName } = req.body;
  if (!vName) return res.status(400).json({ error: "vName is required" });

  try {
    const result = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM "mstUser" WHERE LOWER("vName") = LOWER($1)) AS "exists"`,
      [vName]
    );
    res.json({ exists: result.rows[0].exists });
  } catch (error) {
    console.error("Error checking name:", error);
    res.status(500).json({ error: "Error checking name" });
  }
});

// Options

router.get("/userProfile/BranchOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nBranchID","vBranchCode" FROM "mstCompany" WHERE "bIsdeleted"=false AND "bActive"= true`
    );

    const BranchOptions = rows.map((row) => ({
      value: row.nBranchID,
      label: row.vBranchCode,
    }));

    res.json(BranchOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/userProfile/GroupOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nUserID","vName" FROM "mstUser" WHERE "bIsGroup" = true AND "bActive" = true`
    );

    const GroupOptions = rows.map((row) => ({
      value: row.nUserID,
      label: row.vName,
    }));

    res.json(GroupOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Get ALL Navigation Items
router.get("/all-navigation", authMiddleware, async (req, res) => {
  try {
    // Fetch all navigation items
    const navQuery = `
      SELECT *
      FROM "mstNavigation"
      WHERE "bIsdeleted" = FALSE
      ORDER BY "order"
    `;
    const navItems = (await pool.query(navQuery)).rows;

    // Build hierarchical structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter((item) => item.parent_id === parentId)
        .map((item) => ({
          ...item,
          subItems: buildTree(items, item.id),
        }));
    };

    const navTree = buildTree(navItems);
    res.json(navTree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get User Rights
router.get("/UserProfile/user-rights", authMiddleware, async (req, res) => {
  const { parentId, userID } = req.query;

  if (!parentId || !userID) {
    return res
      .status(400)
      .send("parentId and userID query parameters are required");
  }

  try {
    // Query to fetch user rights
    const userRightsQuery = `
      SELECT gr."nUserID", gr."nMenuID", gr."bAddRights" AS "add", gr."bModifyRights" AS "modify",
             gr."bDeleteRights" AS "delete", gr."bViewRights" AS "view", gr."bExportRights" AS "export",
             n."id", n."name", n."parent_id"
      FROM "mstUserRights" gr
      JOIN "mstNavigation" n ON gr."nMenuID" = n."id"
      WHERE gr."nUserID" = $1 AND n."parent_id" = $2
    `;
    const userRightsResult = await pool.query(userRightsQuery, [
      userID,
      parentId,
    ]);

    if (userRightsResult.rows.length === 0) {
      // If no user rights, fetch the user's group ID
      const userGroupQuery = `
        SELECT "nGroupID" FROM "mstUser" WHERE "nUserID" = $1
      `;
      const userGroupResult = await pool.query(userGroupQuery, [userID]);

      if (userGroupResult.rows.length === 0) {
        return res.status(404).send("User not found");
      }

      const groupId = userGroupResult.rows[0].nGroupID;

      // Query to fetch group rights
      const groupRightsQuery = `
        SELECT gr."nGroupID", gr."nMenuID", gr."bAddRights" AS "add", gr."bModifyRights" AS "modify",
               gr."bDeleteRights" AS "delete", gr."bViewRights" AS "view", gr."bExportRights" AS "export",
               n."id", n."name", n."parent_id"
        FROM "mstGroupRights" gr
        JOIN "mstNavigation" n ON gr."nMenuID" = n."id"
        WHERE gr."nGroupID" = $1 AND n."parent_id" = $2
      `;
      const groupRightsResult = await pool.query(groupRightsQuery, [
        groupId,
        parentId,
      ]);

      res.json(groupRightsResult.rows);
    } else {
      res.json(userRightsResult.rows);
    }
  } catch (error) {
    console.error("Error fetching User rights:", error);
    res.status(500).send("Error fetching User rights");
  }
});

//Get Group Rights
router.get("/UserProfile/group-rights", authMiddleware, async (req, res) => {
  const { parentId, groupId } = req.query;

  if (!parentId || !groupId) {
    return res
      .status(400)
      .send("parentId and groupId query parameters are required");
  }

  try {
    const query = `
      SELECT gr."nGroupID", gr."nMenuID", gr."bAddRights" AS "add", gr."bModifyRights" AS "modify",
             gr."bDeleteRights" AS "delete", gr."bViewRights" AS "view", gr."bExportRights" AS "export",
             n."id", n."name", n."parent_id"
      FROM "mstGroupRights" gr
      JOIN "mstNavigation" n ON gr."nMenuID" = n."id"
      WHERE gr."nGroupID" = $1 AND n."parent_id" = $2
    `;
    const result = await pool.query(query, [groupId, parentId]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching group rights:", error);
    res.status(500).send("Error fetching group rights");
  }
});

// Update Group Rights
router.post(
  "/UserProfile/update-group-rights",
  authMiddleware,
  async (req, res) => {
    const { parentId, groupId, rights } = req.body;

    if (!parentId || !groupId || !rights) {
      return res
        .status(400)
        .send("parentId, groupId, and rights body parameters are required");
    }

    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const query = `
      INSERT INTO "mstGroupRights" ("nGroupID", "nMenuID", "bAddRights", "bModifyRights", "bDeleteRights", "bViewRights", "bExportRights")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT ("nGroupID", "nMenuID")
      DO UPDATE SET
        "bAddRights" = EXCLUDED."bAddRights",
        "bModifyRights" = EXCLUDED."bModifyRights",
        "bDeleteRights" = EXCLUDED."bDeleteRights",
        "bViewRights" = EXCLUDED."bViewRights",
        "bExportRights" = EXCLUDED."bExportRights"
    `;

      for (const menuId in rights) {
        const currentRights = rights[menuId];
        await client.query(query, [
          groupId,
          menuId,
          currentRights.add,
          currentRights.modify,
          currentRights.delete,
          currentRights.view,
          currentRights.export,
        ]);
      }

      await client.query("COMMIT");
      res.status(200).send("Group rights updated successfully");
    } catch (error) {
      console.error("Error updating group rights:", error);
      if (client) {
        await client.query("ROLLBACK");
        client.release();
      }
      res.status(500).send("Error updating group rights");
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

// Update User Rights
router.post(
  "/UserProfile/update-user-rights",
  authMiddleware,
  async (req, res) => {
    const { parentId, userID, rights } = req.body;

    if (!parentId || !userID || !rights) {
      return res
        .status(400)
        .send("parentId, userID, and rights body parameters are required");
    }

    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const query = `
      INSERT INTO "mstUserRights" ("nUserID", "nMenuID", "bAddRights", "bModifyRights", "bDeleteRights", "bViewRights", "bExportRights")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT ("nUserID", "nMenuID")
      DO UPDATE SET
        "bAddRights" = EXCLUDED."bAddRights",
        "bModifyRights" = EXCLUDED."bModifyRights",
        "bDeleteRights" = EXCLUDED."bDeleteRights",
        "bViewRights" = EXCLUDED."bViewRights",
        "bExportRights" = EXCLUDED."bExportRights"
    `;

      for (const menuId in rights) {
        const currentRights = rights[menuId];
        await client.query(query, [
          userID,
          menuId,
          currentRights.add,
          currentRights.modify,
          currentRights.delete,
          currentRights.view,
          currentRights.export,
        ]);
      }

      await client.query("COMMIT");
      res.status(200).send("User rights updated successfully");
    } catch (error) {
      console.error("Error updating user rights:", error);
      if (client) {
        await client.query("ROLLBACK");
        client.release();
      }
      res.status(500).send("Error updating user rights");
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

// Fetch counters for a user
router.get("/UserProfile/counters", authMiddleware, async (req, res) => {
  const { userId } = req.query;

  try {
    const result = await pool.query(
      `SELECT b."nBranchID",
              b."nCounterID",
              b."vBranchCode",
              COALESCE(u."bIsActive", false) AS "bIsActive"
       FROM "mstBranchCounterLink" b
       LEFT JOIN "mstCounterUserLink" u
         ON b."nBranchID" = u."nBranchID"
         AND b."nCounterID" = u."nCounterID"
         AND u."nUserID" = $1
       ORDER BY b."nBranchID" ASC, b."nCounterID" ASC;`,
      [userId]
    );

    const branches = result.rows.reduce((acc, row) => {
      const branch = acc.find((b) => b.nBranchID === row.nBranchID);
      if (branch) {
        branch.counters.push({
          nCounterID: row.nCounterID,
          bIsActive: row.bIsActive,
        });
      } else {
        acc.push({
          nBranchID: row.nBranchID,
          vBranchCode: row.vBranchCode,
          counters: [
            {
              nCounterID: row.nCounterID,
              bIsActive: row.bIsActive,
            },
          ],
        });
      }
      return acc;
    }, []);

    res.json(branches);
  } catch (error) {
    console.error("Error fetching counters", error);
    res.status(500).send("Server error");
  }
});

// Update counter access
router.post(
  "/UserProfile/updateCounterAccess",
  authMiddleware,
  async (req, res) => {
    const { userId, branchId, counterId, isActive } = req.body;

    try {
      await pool.query(
        `INSERT INTO "mstCounterUserLink" ("nUserID", "nBranchID", "nCounterID", "bIsActive", "vBranchCode", "vUID")
         VALUES (
           $1, 
           $2, 
           $3, 
           $4, 
           (SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2),
           (SELECT "vUID" FROM "mstUser" WHERE "nUserID" = $1)
         )
         ON CONFLICT ("nUserID", "nBranchID", "nCounterID")
         DO UPDATE SET 
           "bIsActive" = $4,
           "vBranchCode" = (SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2),
           "vUID" = (SELECT "vUID" FROM "mstUser" WHERE "nUserID" = $1);`,
        [userId, branchId, counterId, isActive]
      );

      res.send("Counter access updated");
    } catch (error) {
      console.error("Error updating counter access", error);
      res.status(500).send("Server error");
    }
  }
);

router.get("/UserProfile/branchesOnUser", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nBranchID","vBranchCode" FROM "mstCompany" WHERE "bIsdeleted" = false ORDER BY "nBranchID"`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).send("Error fetching branches");
  }
});

router.get("/UserProfile/userBranchLinks", authMiddleware, async (req, res) => {
  const { userId } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT "nBranchID", "bIsActive" FROM "mstBranchUserLink" WHERE "nUserID" = $1`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching user branch links:", error);
    res.status(500).send("Error fetching user branch links");
  }
});

router.post(
  "/UserProfile/updateUserBranchLink",
  authMiddleware,
  async (req, res) => {
    const { userId, branchId, isActive } = req.body;

    // Check if any of the parameters are undefined or null
    if (userId == null || branchId == null || isActive == null) {
      console.error("Invalid parameters:", { userId, branchId, isActive });
      return res.status(400).send("Invalid parameters");
    }

    try {
      const query = `
      INSERT INTO "mstBranchUserLink" ("nUserID", "nBranchID", "vUID", "vBranchCode", "bIsActive")
      VALUES ($1, $2, (SELECT "vUID" FROM "mstUser" WHERE "nUserID" = $1), (SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2), $3)
      ON CONFLICT ("nUserID", "nBranchID")
      DO UPDATE SET "vUID" = EXCLUDED."vUID", "vBranchCode" = EXCLUDED."vBranchCode", "bIsActive" = EXCLUDED."bIsActive"
    `;
      const values = [userId, branchId, isActive];

      await pool.query(query, values);
      res.status(200).send("User branch link updated successfully");
    } catch (error) {
      console.error("Error updating user branch link", error);
      res.status(500).send("Error updating user branch link");
    }
  }
);

//Insert User Profile
router.post("/userProfile", authMiddleware, async (req, res) => {
  const data = transformEmptyToNull(req.body);
  const {
    nGroupID,
    vUID,
    vName,
    vCellNo,
    vMailID,
    bActive,
    dValidTill,
    bIsGroup,
    nGroupPriority,
    nBranchID,
    bIsAdministrator,
    bCanClearCounter,
    bComplianceAuthorization,
    bDataEntryAuthorization,
    bCreditLimitAuthorization,
    bMiscLimitAuthorization,
    nCreatedBy,
    dCreationDate,
    nLastUpdateBy,
    dLastUpdateDate,
    nTrackingID,
    nAPID,
    bCanOptCentralM,
    BDATAENTRYPRIVILEGE,
    bSpecialRights,
    nSanctionLimit,
    bIsVerified,
    nVerifyedby,
    dVerifiedDate,
    nDeletedby,
    bIsDeleted,
    dDeleteddate,
    isCorporate,
    CrpCode,
    ref_branchlogin,
    ref_finyearlogin,
    bIsOrderCreation,
    bIsOrderAllotment,
    Permission,
    Ref_BranchCode,
    Ref_finyear,
    Otausername,
    biskeyuser,
    OktaUserName,
    DBName,
  } = data;

  if (!vUID || !vName || !bIsGroup === undefined) {
    return res
      .status(400)
      .json({ error: "vUID, vName and bIsGroup are required" });
  }

  const insertQuery = `
  INSERT INTO "mstUser" (
    "nGroupID",
    "vUID",
    "vName",
    "vCellNo",
    "vMailID",
    "bActive",
    "dValidTill",
    "bIsGroup",
    "nGroupPriority",
    "nBranchID",
    "bIsAdministrator",
    "bCanClearCounter",
    "bComplianceAuthorization",
    "bDataEntryAuthorization",
    "bCreditLimitAuthorization",
    "bMiscLimitAuthorization",
    "nCreatedBy",
    "dCreationDate",
    "nLastUpdateBy",
    "dLastUpdateDate",
    "nTrackingID",
    "nAPID",
    "bCanOptCentralM",
    "BDATAENTRYPRIVILEGE",
    "bSpecialRights",
    "nSanctionLimit",
    "bIsVerified",
    "nVerifyedby",
    "dVerifiedDate",
    "nDeletedby",
    "bIsDeleted",
    "dDeleteddate",
    "isCorporate",
    "CrpCode",
    "ref_branchlogin",
    "ref_finyearlogin",
    "bIsOrderCreation",
    "bIsOrderAllotment",
    "Permission",
    "Ref_BranchCode",
    "Ref_finyear",
    "Otausername",
    "biskeyuser",
    "OktaUserName",
    "DBName"
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, 
    $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, 
    $41, $42, $43, $44, $45
  ) RETURNING *
`;

  try {
    const { rows } = await pool.query(insertQuery, [
      nGroupID,
      vUID,
      vName,
      vCellNo,
      vMailID,
      bActive,
      dValidTill,
      bIsGroup,
      nGroupPriority,
      nBranchID,
      bIsAdministrator,
      bCanClearCounter,
      bComplianceAuthorization,
      bDataEntryAuthorization,
      bCreditLimitAuthorization,
      bMiscLimitAuthorization,
      nCreatedBy,
      dCreationDate,
      nLastUpdateBy,
      dLastUpdateDate,
      nTrackingID,
      nAPID,
      bCanOptCentralM,
      BDATAENTRYPRIVILEGE,
      bSpecialRights,
      nSanctionLimit,
      bIsVerified,
      nVerifyedby,
      dVerifiedDate,
      nDeletedby,
      bIsDeleted,
      dDeleteddate,
      isCorporate,
      CrpCode,
      ref_branchlogin,
      ref_finyearlogin,
      bIsOrderCreation,
      bIsOrderAllotment,
      Permission,
      Ref_BranchCode,
      Ref_finyear,
      Otausername,
      biskeyuser,
      OktaUserName,
      DBName,
    ]);

    res.json(rows[0]);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

//Update User Group
router.put("/userProfile", authMiddleware, async (req, res) => {
  const {
    nUserID,
    nGroupID,
    vUID,
    vName,
    vCellNo,
    vMailID,
    bActive,
    dValidTill,
    bIsGroup,
    nGroupPriority,
    nBranchID,
    bIsAdministrator,
    bCanClearCounter,
    bComplianceAuthorization,
    bDataEntryAuthorization,
    bCreditLimitAuthorization,
    bMiscLimitAuthorization,
    nCreatedBy,
    dCreationDate,
    nLastUpdateBy,
    dLastUpdateDate,
    nTrackingID,
    nAPID,
    bCanOptCentralM,
    BDATAENTRYPRIVILEGE,
    bSpecialRights,
    nSanctionLimit,
    bIsVerified,
    nVerifyedby,
    dVerifiedDate,
    nDeletedby,
    bIsDeleted,
    dDeleteddate,
    isCorporate,
    CrpCode,
    ref_branchlogin,
    ref_finyearlogin,
    bIsOrderCreation,
    bIsOrderAllotment,
    Permission,
    Ref_BranchCode,
    Ref_finyear,
    Otausername,
    biskeyuser,
    OktaUserName,
    DBName,
  } = transformEmptyToNull(req.body);

  if (!nUserID || !vUID || !vName || !nGroupID) {
    return res.status(400).json({
      error: "nUserID, vUID, vName, nGroupID are required",
    });
  }

  const updateQuery = `
    UPDATE "mstUser"
    SET
      "nGroupID" = $2,
      "vUID" = $3,
      "vName" = $4,
      "vCellNo" = $5,
      "vMailID" = $6,
      "bActive" = $7,
      "dValidTill" = $8,
      "bIsGroup" = $9,
      "nGroupPriority" = $10,
      "nBranchID" = $11,
      "bIsAdministrator" = $12,
      "bCanClearCounter" = $13,
      "bComplianceAuthorization" = $14,
      "bDataEntryAuthorization" = $15,
      "bCreditLimitAuthorization" = $16,
      "bMiscLimitAuthorization" = $17,
      "nCreatedBy" = $18,
      "dCreationDate" = $19,
      "nLastUpdateBy" = $20,
      "dLastUpdateDate" = $21,
      "nTrackingID" = $22,
      "nAPID" = $23,
      "bCanOptCentralM" = $24,
      "BDATAENTRYPRIVILEGE" = $25,
      "bSpecialRights" = $26,
      "nSanctionLimit" = $27,
      "bIsVerified" = $28,
      "nVerifyedby" = $29,
      "dVerifiedDate" = $30,
      "nDeletedby" = $31,
      "bIsDeleted" = $32,
      "dDeleteddate" = $33,
      "isCorporate" = $34,
      "CrpCode" = $35,
      "ref_branchlogin" = $36,
      "ref_finyearlogin" = $37,
      "bIsOrderCreation" = $38,
      "bIsOrderAllotment" = $39,
      "Permission" = $40,
      "Ref_BranchCode" = $41,
      "Ref_finyear" = $42,
      "Otausername" = $43,
      "biskeyuser" = $44,
      "OktaUserName" = $45,
      "DBName" = $46
    WHERE "nUserID" = $1 RETURNING *
  `;

  try {
    const { rows } = await pool.query(updateQuery, [
      nUserID,
      nGroupID,
      vUID,
      vName,
      vCellNo,
      vMailID,
      bActive,
      dValidTill,
      bIsGroup,
      nGroupPriority,
      nBranchID,
      bIsAdministrator,
      bCanClearCounter,
      bComplianceAuthorization,
      bDataEntryAuthorization,
      bCreditLimitAuthorization,
      bMiscLimitAuthorization,
      nCreatedBy,
      dCreationDate,
      nLastUpdateBy,
      dLastUpdateDate,
      nTrackingID,
      nAPID,
      bCanOptCentralM,
      BDATAENTRYPRIVILEGE,
      bSpecialRights,
      nSanctionLimit,
      bIsVerified,
      nVerifyedby,
      dVerifiedDate,
      nDeletedby,
      bIsDeleted,
      dDeleteddate,
      isCorporate,
      CrpCode,
      ref_branchlogin,
      ref_finyearlogin,
      bIsOrderCreation,
      bIsOrderAllotment,
      Permission,
      Ref_BranchCode,
      Ref_finyear,
      Otausername,
      biskeyuser,
      OktaUserName,
      DBName,
    ]);

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

//Delete User Group
router.post("/userGroup/delete", authMiddleware, async (req, res) => {
  const { nUserID } = req.body;

  if (!nUserID) return res.status(400).json({ error: "nUserID is required" });

  if (!req.user.bIsAdministrator)
    return res.status(403).json({ error: "Only an admin user can delete" });

  const deleteQuery = `
    UPDATE "mstUser"
    SET "bIsDeleted" = true
    WHERE "nUserID" = $1 RETURNING *
  `;

  try {
    const { rows } = await pool.query(deleteQuery, [nUserID]);

    res.json(rows[0]);
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// ---------------------------***----USER GROUP SETTINGS END---------***------------------------------------------------------

// ---------------------------***----PRODUCT PROFILE START---------***------------------------------------------------------

// ISSUER LINK

router.post("/ProductIssuerLink", authMiddleware, async (req, res) => {
  const { PRODUCTCODE } = req.body;

  try {
    // Fetch all issuers
    const IssuersResult = await pool.query(
      `SELECT * FROM "mstCODES" WHERE "vType" = 'TC' ORDER BY "vCode"`
    );
    const issuers = IssuersResult.rows;

    // Fetch existing product-issuer links
    const productIssuerResult = await pool.query(
      `SELECT * FROM "mProductIssuerLink" WHERE "PRODUCTCODE"= $1`,
      [PRODUCTCODE]
    );
    const productIssuers = productIssuerResult.rows;

    // Merge data to indicate which issuers are linked
    const mergedData = issuers.map((item) => {
      const link = productIssuers.find(
        (issuer) => issuer.nIssuerID === item.nCodesID
      );
      return {
        ...item,
        bIsActive: link ? link.bIsActive : false,
      };
    });

    res.json(mergedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Insert/Update product-issuer links
router.put("/ProductIssuerLink", authMiddleware, async (req, res) => {
  const { PRODUCTCODE, nIssuerID, bIsActive } = req.body;

  const query = `
    INSERT INTO "mProductIssuerLink" ("PRODUCTCODE", "nIssuerID", "bIsActive","vIssuerCode")
    VALUES ($1, $2, $3,(SELECT "vCode" FROM "mstCODES" WHERE "nCodesID" = $2))
    ON CONFLICT ("PRODUCTCODE","nIssuerID")
    DO UPDATE SET "bIsActive" = EXCLUDED."bIsActive",
    "vIssuerCode" = (SELECT "vCode" FROM "mstCODES" WHERE "nCodesID" = $2)
  `;

  try {
    await pool.query(query, [PRODUCTCODE, nIssuerID, bIsActive]);
    res.status(201).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

//--------CRUD---------

//FETCH

router.get("/productProfile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "mProductM" WHERE "bIsDeleted" = false ORDER BY "nProductID" ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CREATE
router.post("/productProfile", authMiddleware, async (req, res) => {
  const data = transformEmptyToNull(req.body);
  const {
    PRODUCTCODE,
    DESCRIPTION,
    retailBuy,
    retailBuySeries,
    retailSell,
    retailSellSeries,
    bulkBuy,
    bulkBuySeries,
    bulkSell,
    bulkSellSeries,
    IssuerRequire,
    blankStock,
    blankStockDeno,
    isSettlement,
    vProfitAccountCode,
    vIssuerAccountCode,
    vCommAccountCode,
    vOpeningAccountCode,
    vClosingAccountCode,
    vExportAccountCode,
    vPurchaseAccountCode,
    vSaleAccountCode,
    vFakeAccountcode,
    isActive,
    Priority,
    vBulkPurchaseAccountCode,
    vBulkSaleAccountCode,
    vBulkProfitAccountCode,
    vPurRetCanAccountCode,
    vPurBlkCanAccountCode,
    vSaleRetCanAccountCode,
    vSaleBlkCanAccountCode,
    vPurchaseBranchAccountCode,
    vSaleBranchAccountCode,
    reverseProfit,
    vBrnProfitAccountCode,
    AUTOSTOCK,
    allowFractions,
    AllowMultiCard,
    RetailFees,
    COMMPERCENT,
    COMMAMT,
    AUTOSETTRATE,
    passSeparateSett,
    saleAvgSett,
    BulkFees,
    stockSplit,
    stockDenoChange,
    bReload,
    AllAddOn,
    bAskReference,
    IsAllowCancellation,
  } = data;

  const insertQuery = `
    INSERT INTO "mProductM" (
      "PRODUCTCODE",
      "DESCRIPTION",
      "retailBuy",
      "retailBuySeries",
      "retailSell",
      "retailSellSeries",
      "bulkBuy",
      "bulkBuySeries",
      "bulkSell",
      "bulkSellSeries",
      "IssuerRequire",
      "blankStock",
      "blankStockDeno",
      "isSettlement",
      "vProfitAccountCode",
      "vIssuerAccountCode",
      "vCommAccountCode",
      "vOpeningAccountCode",
      "vClosingAccountCode",
      "vExportAccountCode",
      "vPurchaseAccountCode",
      "vSaleAccountCode",
      "vFakeAccountcode",
      "isActive",
      "Priority",
      "vBulkPurchaseAccountCode",
      "vBulkSaleAccountCode",
      "vBulkProfitAccountCode",
      "vPurRetCanAccountCode",
      "vPurBlkCanAccountCode",
      "vSaleRetCanAccountCode",
      "vSaleBlkCanAccountCode",
      "vPurchaseBranchAccountCode",
      "vSaleBranchAccountCode",
      "reverseProfit",
      "vBrnProfitAccountCode",
      "AUTOSTOCK",
      "allowFractions",
      "AllowMultiCard",
      "RetailFees",
      "COMMPERCENT",
      "COMMAMT",
      "AUTOSETTRATE",
      "passSeparateSett",
      "saleAvgSett",
      "BulkFees",
      "stockSplit",
      "stockDenoChange",
      "bReload",
      "AllAddOn",
      "bAskReference",
      "IsAllowCancellation"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45
    )
    RETURNING *
  `;

  try {
    const { rows } = await pool.query(insertQuery, [
      PRODUCTCODE,
      DESCRIPTION,
      retailBuy,
      retailBuySeries,
      retailSell,
      retailSellSeries,
      bulkBuy,
      bulkBuySeries,
      bulkSell,
      bulkSellSeries,
      IssuerRequire,
      blankStock,
      blankStockDeno,
      isSettlement,
      vProfitAccountCode,
      vIssuerAccountCode,
      vCommAccountCode,
      vOpeningAccountCode,
      vClosingAccountCode,
      vExportAccountCode,
      vPurchaseAccountCode,
      vSaleAccountCode,
      vFakeAccountcode,
      isActive,
      Priority,
      vBulkPurchaseAccountCode,
      vBulkSaleAccountCode,
      vBulkProfitAccountCode,
      vPurRetCanAccountCode,
      vPurBlkCanAccountCode,
      vSaleRetCanAccountCode,
      vSaleBlkCanAccountCode,
      vPurchaseBranchAccountCode,
      vSaleBranchAccountCode,
      reverseProfit,
      vBrnProfitAccountCode,
      AUTOSTOCK,
      allowFractions,
      AllowMultiCard,
      RetailFees,
      COMMPERCENT,
      COMMAMT,
      AUTOSETTRATE,
      passSeparateSett,
      saleAvgSett,
      BulkFees,
      stockSplit,
      stockDenoChange,
      bReload,
      AllAddOn,
      bAskReference,
      IsAllowCancellation,
    ]);

    res.json(rows[0]);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

// UPDATE
router.put("/productProfile", authMiddleware, async (req, res) => {
  const data = transformEmptyToNull(req.body);
  const {
    nProductID,
    PRODUCTCODE,
    DESCRIPTION,
    retailBuy,
    retailBuySeries,
    retailSell,
    retailSellSeries,
    bulkBuy,
    bulkBuySeries,
    bulkSell,
    bulkSellSeries,
    IssuerRequire,
    blankStock,
    blankStockDeno,
    isSettlement,
    vProfitAccountCode,
    vIssuerAccountCode,
    vCommAccountCode,
    vOpeningAccountCode,
    vClosingAccountCode,
    vExportAccountCode,
    vPurchaseAccountCode,
    vSaleAccountCode,
    vFakeAccountcode,
    isActive,
    Priority,
    vBulkPurchaseAccountCode,
    vBulkSaleAccountCode,
    vBulkProfitAccountCode,
    vPurRetCanAccountCode,
    vPurBlkCanAccountCode,
    vSaleRetCanAccountCode,
    vSaleBlkCanAccountCode,
    vPurchaseBranchAccountCode,
    vSaleBranchAccountCode,
    reverseProfit,
    vBrnProfitAccountCode,
    AUTOSTOCK,
    allowFractions,
    AllowMultiCard,
    RetailFees,
    COMMPERCENT,
    COMMAMT,
    AUTOSETTRATE,
    passSeparateSett,
    saleAvgSett,
    BulkFees,
    stockSplit,
    stockDenoChange,
    bReload,
    AllAddOn,
    bAskReference,
    IsAllowCancellation,
    nTrackingID,
    nCreatedBY,
    dCreatedDate,
    nLastUpdatedBy,
    dLastUpdatedDate,
    bIsDeleted,
    nDeletedBy,
    dDeletedDate,
    vSaleEEFCAccountCode,
    vSaleProfitEEFCAccountCode,
    vPurchaseEEFCAccountCode,
    vEEFCAccountCode,
  } = data;

  const updateQuery = `
    UPDATE "mProductM" SET 
      "PRODUCTCODE" = $2,
      "DESCRIPTION" = $3,
      "retailBuy" = $4,
      "retailBuySeries" = $5,
      "retailSell" = $6,
      "retailSellSeries" = $7,
      "bulkBuy" = $8,
      "bulkBuySeries" = $9,
      "bulkSell" = $10,
      "bulkSellSeries" = $11,
      "IssuerRequire" = $12,
      "blankStock" = $13,
      "blankStockDeno" = $14,
      "isSettlement" = $15,
      "vProfitAccountCode" = $16,
      "vIssuerAccountCode" = $17,
      "vCommAccountCode" = $18,
      "vOpeningAccountCode" = $19,
      "vClosingAccountCode" = $20,
      "vExportAccountCode" = $21,
      "vPurchaseAccountCode" = $22,
      "vSaleAccountCode" = $23,
      "vFakeAccountcode" = $24,
      "isActive" = $25,
      "Priority" = $26,
      "vBulkPurchaseAccountCode" = $27,
      "vBulkSaleAccountCode" = $28,
      "vBulkProfitAccountCode" = $29,
      "vPurRetCanAccountCode" = $30,
      "vPurBlkCanAccountCode" = $31,
      "vSaleRetCanAccountCode" = $32,
      "vSaleBlkCanAccountCode" = $33,
      "vPurchaseBranchAccountCode" = $34,
      "vSaleBranchAccountCode" = $35,
      "reverseProfit" = $36,
      "vBrnProfitAccountCode" = $37,
      "AUTOSTOCK" = $38,
      "allowFractions" = $39,
      "AllowMultiCard" = $40,
      "RetailFees" = $41,
      "COMMPERCENT" = $42,
      "COMMAMT" = $43,
      "AUTOSETTRATE" = $44,
      "passSeparateSett" = $45,
      "saleAvgSett" = $46,
      "BulkFees" = $47,
      "stockSplit" = $48,
      "stockDenoChange" = $49,
      "bReload" = $50,
      "AllAddOn" = $51,
      "bAskReference" = $52,
      "IsAllowCancellation" = $53,
      "nTrackingID" = $54,
      "nCreatedBY" = $55,
      "dCreatedDate" = $56,
      "nLastUpdatedBy" = $57,
      "dLastUpdatedDate" = $58,
      "bIsDeleted" = $59,
      "nDeletedBy" = $60,
      "dDeletedDate" = $61,
      "vSaleEEFCAccountCode" = $62,
      "vSaleProfitEEFCAccountCode" = $63,
      "vPurchaseEEFCAccountCode" = $64,
      "vEEFCAccountCode" = $65
    WHERE "nProductID" = $1
  `;

  try {
    const result = await pool.query(updateQuery, [
      nProductID,
      PRODUCTCODE,
      DESCRIPTION,
      retailBuy,
      retailBuySeries,
      retailSell,
      retailSellSeries,
      bulkBuy,
      bulkBuySeries,
      bulkSell,
      bulkSellSeries,
      IssuerRequire,
      blankStock,
      blankStockDeno,
      isSettlement,
      vProfitAccountCode,
      vIssuerAccountCode,
      vCommAccountCode,
      vOpeningAccountCode,
      vClosingAccountCode,
      vExportAccountCode,
      vPurchaseAccountCode,
      vSaleAccountCode,
      vFakeAccountcode,
      isActive,
      Priority,
      vBulkPurchaseAccountCode,
      vBulkSaleAccountCode,
      vBulkProfitAccountCode,
      vPurRetCanAccountCode,
      vPurBlkCanAccountCode,
      vSaleRetCanAccountCode,
      vSaleBlkCanAccountCode,
      vPurchaseBranchAccountCode,
      vSaleBranchAccountCode,
      reverseProfit,
      vBrnProfitAccountCode,
      AUTOSTOCK,
      allowFractions,
      AllowMultiCard,
      RetailFees,
      COMMPERCENT,
      COMMAMT,
      AUTOSETTRATE,
      passSeparateSett,
      saleAvgSett,
      BulkFees,
      stockSplit,
      stockDenoChange,
      bReload,
      AllAddOn,
      bAskReference,
      IsAllowCancellation,
      nTrackingID,
      nCreatedBY,
      dCreatedDate,
      nLastUpdatedBy,
      dLastUpdatedDate,
      bIsDeleted,
      nDeletedBy,
      dDeletedDate,
      vSaleEEFCAccountCode,
      vSaleProfitEEFCAccountCode,
      vPurchaseEEFCAccountCode,
      vEEFCAccountCode,
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// DELETE
router.post("/productProfile/delete", authMiddleware, async (req, res) => {
  const { nProductID } = req.body;

  if (!nProductID)
    return res.status(400).json({ error: "nProductID is required" });

  const query = `
    UPDATE "mProductM"
    SET "bIsDeleted" = true
    WHERE "nProductID" = $1
  `;

  try {
    await pool.query(query, [nProductID]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});
// ---------------------------***----PRODUCT PROFILE END---------***------------------------------------------------------

// ---------------------------***----TAX MASTER START---------***------------------------------------------------------

// Options

// Posting A/C

router.get("/taxMaster/postingAccOptions", authMiddleware, async (req, res) => {
  const query = `
    SELECT "nAccID", "vCode", "vName", "vFinCode"  
    FROM "AccountsProfile"  
    ORDER BY "nAccID" ASC
  `;

  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//--------CRUD---------

//FETCH

router.get("/taxMaster", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "mstTax" WHERE "bIsDeleted" = false ORDER BY "nTaxID" ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CREATE
router.post("/taxMaster", authMiddleware, async (req, res) => {
  const data = transformEmptyToNull(req.body);
  const {
    nTaxID,
    CODE,
    DESCRIPTION,
    APPLYAS,
    VALUE,
    RETAILBUY,
    RETAILSELL,
    BULKBUY,
    BULKSELL,
    EEFCPRD,
    EEFCCN,
    ISACTIVE,
    RETAILBUYSIGN,
    RETAILSELLSIGN,
    BULKBUYSIGN,
    BULKSELLSIGN,
    ROUNDOFF,
    BIFURCATE,
    FROMDT,
    TILLDT,
    TAXCHARGEDON,
    ONTAXCODE,
    tcSettlement,
    prdSettlement,
    tcSettlementSign,
    prdSettlementSign,
    SLABWISETAX,
    ISINSTRUMENTCHG,
    PRODUCTCODE,
    nAccID,
    RBIREFERENCERATE,
    TXNROUNDOFF,
    INVOICEAMT,
    IsFeeHead,
    nTrackingID,
    nCreatedBy,
    dCreatedDate,
    nLastUpdatedby,
    dLastUpdatedDate,
    bIsVerified,
    nVerifiedby,
    dVerifiedDate,
    bIsDeleted,
    nDeletedBy,
    dDeletedDate,
  } = data;

  const insertQuery = `
    INSERT INTO "mstTax" (
      "nTaxID",
      "CODE",
      "DESCRIPTION",
      "APPLYAS",
      "VALUE",
      "RETAILBUY",
      "RETAILSELL",
      "BULKBUY",
      "BULKSELL",
      "EEFCPRD",
      "EEFCCN",
      "ISACTIVE",
      "RETAILBUYSIGN",
      "RETAILSELLSIGN",
      "BULKBUYSIGN",
      "BULKSELLSIGN",
      "ROUNDOFF",
      "BIFURCATE",
      "FROMDT",
      "TILLDT",
      "TAXCHARGEDON",
      "ONTAXCODE",
      "tcSettlement",
      "prdSettlement",
      "tcSettlementSign",
      "prdSettlementSign",
      "SLABWISETAX",
      "ISINSTRUMENTCHG",
      "PRODUCTCODE",
      "nAccID",
      "RBIREFERENCERATE",
      "TXNROUNDOFF",
      "INVOICEAMT",
      "IsFeeHead",
      "nTrackingID",
      "nCreatedBy",
      "dCreatedDate",
      "nLastUpdatedby",
      "dLastUpdatedDate",
      "bIsVerified",
      "nVerifiedby",
      "dVerifiedDate",
      "bIsDeleted",
      "nDeletedBy",
      "dDeletedDate"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44
    )
    RETURNING *
  `;

  try {
    const { rows } = await pool.query(insertQuery, [
      nTaxID,
      CODE,
      DESCRIPTION,
      APPLYAS,
      VALUE,
      RETAILBUY,
      RETAILSELL,
      BULKBUY,
      BULKSELL,
      EEFCPRD,
      EEFCCN,
      ISACTIVE,
      RETAILBUYSIGN,
      RETAILSELLSIGN,
      BULKBUYSIGN,
      BULKSELLSIGN,
      ROUNDOFF,
      BIFURCATE,
      FROMDT,
      TILLDT,
      TAXCHARGEDON,
      ONTAXCODE,
      tcSettlement,
      prdSettlement,
      tcSettlementSign,
      prdSettlementSign,
      SLABWISETAX,
      ISINSTRUMENTCHG,
      PRODUCTCODE,
      nAccID,
      RBIREFERENCERATE,
      TXNROUNDOFF,
      INVOICEAMT,
      IsFeeHead,
      nTrackingID,
      nCreatedBy,
      dCreatedDate,
      nLastUpdatedby,
      dLastUpdatedDate,
      bIsVerified,
      nVerifiedby,
      dVerifiedDate,
      bIsDeleted,
      nDeletedBy,
      dDeletedDate,
    ]);

    res.json(rows[0]);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

// UPDATE
router.put("/taxMaster", authMiddleware, async (req, res) => {
  const data = transformEmptyToNull(req.body);
  const {
    nTaxID,
    CODE,
    DESCRIPTION,
    APPLYAS,
    VALUE,
    RETAILBUY,
    RETAILSELL,
    BULKBUY,
    BULKSELL,
    EEFCPRD,
    EEFCCN,
    ISACTIVE,
    RETAILBUYSIGN,
    RETAILSELLSIGN,
    BULKBUYSIGN,
    BULKSELLSIGN,
    ROUNDOFF,
    BIFURCATE,
    FROMDT,
    TILLDT,
    TAXCHARGEDON,
    ONTAXCODE,
    tcSettlement,
    prdSettlement,
    tcSettlementSign,
    prdSettlementSign,
    SLABWISETAX,
    ISINSTRUMENTCHG,
    PRODUCTCODE,
    nAccID,
    RBIREFERENCERATE,
    TXNROUNDOFF,
    INVOICEAMT,
    IsFeeHead,
    nTrackingID,
    nCreatedBy,
    dCreatedDate,
    nLastUpdatedby,
    dLastUpdatedDate,
    bIsVerified,
    nVerifiedby,
    dVerifiedDate,
    bIsDeleted,
    nDeletedBy,
    dDeletedDate,
  } = data;

  const updateQuery = `
    UPDATE "mTaxM" SET 
      "CODE" = $2,
      "DESCRIPTION" = $3,
      "APPLYAS" = $4,
      "VALUE" = $5,
      "RETAILBUY" = $6,
      "RETAILSELL" = $7,
      "BULKBUY" = $8,
      "BULKSELL" = $9,
      "EEFCPRD" = $10,
      "EEFCCN" = $11,
      "ISACTIVE" = $12,
      "RETAILBUYSIGN" = $13,
      "RETAILSELLSIGN" = $14,
      "BULKBUYSIGN" = $15,
      "BULKSELLSIGN" = $16,
      "ROUNDOFF" = $17,
      "BIFURCATE" = $18,
      "FROMDT" = $19,
      "TILLDT" = $20,
      "TAXCHARGEDON" = $21,
      "ONTAXCODE" = $22,
      "tcSettlement" = $23,
      "prdSettlement" = $24,
      "tcSettlementSign" = $25,
      "prdSettlementSign" = $26,
      "SLABWISETAX" = $27,
      "ISINSTRUMENTCHG" = $28,
      "PRODUCTCODE" = $29,
      "nAccID" = $30,
      "RBIREFERENCERATE" = $31,
      "TXNROUNDOFF" = $32,
      "INVOICEAMT" = $33,
      "IsFeeHead" = $34,
      "nTrackingID" = $35,
      "nCreatedBy" = $36,
      "dCreatedDate" = $37,
      "nLastUpdatedby" = $38,
      "dLastUpdatedDate" = $39,
      "bIsVerified" = $40,
      "nVerifiedby" = $41,
      "dVerifiedDate" = $42,
      "bIsDeleted" = $43,
      "nDeletedBy" = $44,
      "dDeletedDate" = $45
    WHERE "nTaxID" = $1
  `;

  try {
    const result = await pool.query(updateQuery, [
      nTaxID,
      CODE,
      DESCRIPTION,
      APPLYAS,
      VALUE,
      RETAILBUY,
      RETAILSELL,
      BULKBUY,
      BULKSELL,
      EEFCPRD,
      EEFCCN,
      ISACTIVE,
      RETAILBUYSIGN,
      RETAILSELLSIGN,
      BULKBUYSIGN,
      BULKSELLSIGN,
      ROUNDOFF,
      BIFURCATE,
      FROMDT,
      TILLDT,
      TAXCHARGEDON,
      ONTAXCODE,
      tcSettlement,
      prdSettlement,
      tcSettlementSign,
      prdSettlementSign,
      SLABWISETAX,
      ISINSTRUMENTCHG,
      PRODUCTCODE,
      nAccID,
      RBIREFERENCERATE,
      TXNROUNDOFF,
      INVOICEAMT,
      IsFeeHead,
      nTrackingID,
      nCreatedBy,
      dCreatedDate,
      nLastUpdatedby,
      dLastUpdatedDate,
      bIsVerified,
      nVerifiedby,
      dVerifiedDate,
      bIsDeleted,
      nDeletedBy,
      dDeletedDate,
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// DELETE
router.post("/taxMaster/delete", authMiddleware, async (req, res) => {
  const { nTaxID } = req.body;

  if (!nTaxID) return res.status(400).json({ error: "nTaxID is required" });

  const query = `
    UPDATE "mstTax"
    SET "bIsDeleted" = true
    WHERE "nTaxID" = $1
  `;

  try {
    await pool.query(query, [nTaxID]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});
// ---------------------------***----TAX MASTER END---------***------------------------------------------------------

module.exports = router;
