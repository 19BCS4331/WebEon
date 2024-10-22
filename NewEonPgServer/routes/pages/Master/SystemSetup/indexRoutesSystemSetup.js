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

router.post("/BranchCounterLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;
  try {
    const result = await pool.query(
      `SELECT "bIsActive","nCounterID","vBranchCode","nBranchID" FROM "mstBranchCounterLink" WHERE "nBranchID" = $1 ORDER BY "nCounterID"`,
      [nBranchID]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/BranchCounterLink", authMiddleware, async (req, res) => {
  const { nCounterID, nBranchID, bIsActive } = req.body;

  const query = `
    UPDATE "mstBranchCounterLink" SET "bIsActive" = $3 WHERE "nBranchID"= $2 AND "nCounterID" = $1
    `;

  try {
    pool.query(query, [nCounterID, nBranchID, bIsActive], (error, results) => {
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

// --------------------------------------------------------------BRANCH COUNTER LINK END-----------------------------------------

// --------------------------------------------------------------BRANCH PRODUCT LINK-----------------------------------------
router.post("/BranchProductLink", authMiddleware, async (req, res) => {
  const { nBranchID } = req.body;
  try {
    const result = await pool.query(
      `SELECT "nBranchProductLinkID","bActive","vProductCode","bRevEffect","vBranchCode","nBranchID" FROM "mstBranchProductLink" WHERE "nBranchID" = $1 `,
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

// --------------------------****-----ADV SETTINGS START-----****-----------------------------------------------------

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

// ---------------------------***----ADV SETTINGS END---------***----------------------------------------------------

module.exports = router;
