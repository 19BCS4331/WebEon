const express = require("express");
const router = express.Router();
const pool = require("../../../../config/db");
const authMiddleware = require("../../../../middleware/authMiddleware");

//   ------------------------------------------------Party Profile Common Page-------------------------------------------------------------------

// -----------------------------------------------------------------------CRUD START----------------------------------------------
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

router.get("/PartyProfilesIndex", authMiddleware, async (req, res) => {
  const { vType } = req.query;
  if (!vType) {
    return res.status(400).send("vType query parameter is required");
  }

  try {
    const result = await pool.query(
      `SELECT * FROM "mstCODES" WHERE "vType" = $1 AND "bIsDeleted" = 'false' ORDER BY "nCodesID" ASC`,
      [vType]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Create a new party profile
router.post("/PartyProfiles", authMiddleware, async (req, res) => {
  const {
    vCode,
    vName,
    // vBranchCode,
    dIntdate,
    bActive,
    bIND,
    vAddress1,
    vAddress2,
    vAddress3,
    vPinCode,
    vPhone,
    vFax,
    vEmail,
    vDesign,
    vGrpcode,
    vEntityType,
    vBusinessNature,
    bSaleParty,
    bPurchaseParty,
    bEEFCClient,
    bPrintAddress,
    vLocation,
    vWebsite,
    vCreditPolicy,
    nCREDITLIM,
    nCREDITDAYS,
    nAddCreditLimit,
    nAddCreditDays,
    nTxnSaleLimit,
    nTxnPurLimit,
    nChqTxnlimt,
    vKYCApprovalNumber,
    vKYCRiskCategory,
    nHandlingCharges,
    bTDSDED,
    nTDSPER,
    vTDSGroup,
    bServiceTax,
    bIGSTOnly,
    cGSTNO,
    sGSTNO,
    iGSTNO,
    vState,
    AccHolderName,
    BankName,
    AccNumber,
    IFSCCode,
    BankAddress,
    CancelledChequecopy,
    vPanName,
    dPanDOB,
    vPan,
    nMrktExecutive,
    nBranchID,
    dBlockDate,
    dEstblishDate,
    Remarks,
    vRegno,
    dRegdate,
    bExportParty,
    bEnforcement,
    vType,
  } = transformEmptyToNull(req.body);

  try {
    const branchResult = await pool.query(
      'SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $1',
      [nBranchID]
    );

    if (branchResult.rows.length === 0) {
      return res.status(400).send("Invalid nBranchID");
    }

    const vBranchCode = branchResult.rows[0].vBranchCode;

    const result = await pool.query(
      `INSERT INTO "mstCODES" ("vCode",
"vName",
"vBranchCode",
"dIntdate",
"bActive",
"bIND",
"vAddress1",
"vAddress2",
"vAddress3",
"vPinCode",
"vPhone",
"vFax",
"vEmail",
"vDesign",
"vGrpcode",
"vEntityType",
"vBusinessNature",
"bSaleParty",
"bPurchaseParty",
"bEEFCClient",
"bPrintAddress",
"vLocation",
"vWebsite",
"vCreditPolicy",
"nCREDITLIM",
"nCREDITDAYS",
"nAddCreditLimit",
"nAddCreditDays",
"nTxnSaleLimit",
"nTxnPurLimit",
"nChqTxnlimt",
"vKYCApprovalNumber",
"vKYCRiskCategory",
"nHandlingCharges",
"bTDSDED",
"nTDSPER",
"vTDSGroup",
"bServiceTax",
"bIGSTOnly",
"cGSTNO",
"sGSTNO",
"iGSTNO",
"vState",
"AccHolderName",
"BankName",
"AccNumber",
"IFSCCode",
"BankAddress",
"CancelledChequecopy",
"vPanName",
"dPanDOB",
"vPan",
"nMrktExecutive",
"nBranchID",
"dBlockDate",
"dEstblishDate",
"Remarks",
"vRegno",
"dRegdate",
"bExportParty",
"bEnforcement",
"vType"
)
       VALUES ($1,
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
$36,
$37,
$38,
$39,
$40,
$41,
$42,
$43,
$44,
$45,
$46,
$47,
$48,
$49,
$50,
$51,
$52,
$53,
$54,
$55,
$56,
$57,
$58,
$59,
$60,
$61,
$62

) RETURNING *`,
      [
        vCode,
        vName,
        vBranchCode,
        dIntdate,
        bActive,
        bIND,
        vAddress1,
        vAddress2,
        vAddress3,
        vPinCode,
        vPhone,
        vFax,
        vEmail,
        vDesign,
        vGrpcode,
        vEntityType,
        vBusinessNature,
        bSaleParty,
        bPurchaseParty,
        bEEFCClient,
        bPrintAddress,
        vLocation,
        vWebsite,
        vCreditPolicy,
        nCREDITLIM,
        nCREDITDAYS,
        nAddCreditLimit,
        nAddCreditDays,
        nTxnSaleLimit,
        nTxnPurLimit,
        nChqTxnlimt,
        vKYCApprovalNumber,
        vKYCRiskCategory,
        nHandlingCharges,
        bTDSDED,
        nTDSPER,
        vTDSGroup,
        bServiceTax,
        bIGSTOnly,
        cGSTNO,
        sGSTNO,
        iGSTNO,
        vState,
        AccHolderName,
        BankName,
        AccNumber,
        IFSCCode,
        BankAddress,
        CancelledChequecopy,
        vPanName,
        dPanDOB,
        vPan,
        nMrktExecutive,
        nBranchID,
        dBlockDate,
        dEstblishDate,
        Remarks,
        vRegno,
        dRegdate,
        bExportParty,
        bEnforcement,
        vType,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating data:", error);
    res.status(500).send("Error creating data");
  }
});

// Update an existing party profile
router.put("/PartyProfiles", authMiddleware, async (req, res) => {
  const {
    vCode,
    vName,
    // vBranchCode,
    dIntdate,
    bActive,
    bIND,
    vAddress1,
    vAddress2,
    vAddress3,
    vPinCode,
    vPhone,
    vFax,
    vEmail,
    vDesign,
    vGrpcode,
    vEntityType,
    vBusinessNature,
    bSaleParty,
    bPurchaseParty,
    bEEFCClient,
    bPrintAddress,
    vLocation,
    vWebsite,
    vCreditPolicy,
    nCREDITLIM,
    nCREDITDAYS,
    nAddCreditLimit,
    nAddCreditDays,
    nTxnSaleLimit,
    nTxnPurLimit,
    nChqTxnlimt,
    vKYCApprovalNumber,
    vKYCRiskCategory,
    nHandlingCharges,
    bTDSDED,
    nTDSPER,
    vTDSGroup,
    bServiceTax,
    bIGSTOnly,
    cGSTNO,
    sGSTNO,
    iGSTNO,
    vState,
    AccHolderName,
    BankName,
    AccNumber,
    IFSCCode,
    BankAddress,
    CancelledChequecopy,
    vPanName,
    dPanDOB,
    vPan,
    nMrktExecutive,
    nBranchID,
    dBlockDate,
    dEstblishDate,
    Remarks,
    vRegno,
    dRegdate,
    bExportParty,
    bEnforcement,
    nCodesID,
  } = transformEmptyToNull(req.body);

  try {
    const branchResult = await pool.query(
      'SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $1',
      [nBranchID]
    );

    if (branchResult.rows.length === 0) {
      return res.status(400).send("Invalid nBranchID");
    }

    const vBranchCode = branchResult.rows[0].vBranchCode;
    const result = await pool.query(
      `UPDATE "mstCODES" SET "vCode"=$1,
"vName"=$2,
"vBranchCode"=$3,
"dIntdate"=$4,
"bActive"=$5,
"bIND"=$6,
"vAddress1"=$7,
"vAddress2"=$8,
"vAddress3"=$9,
"vPinCode"=$10,
"vPhone"=$11,
"vFax"=$12,
"vEmail"=$13,
"vDesign"=$14,
"vGrpcode"=$15,
"vEntityType"=$16,
"vBusinessNature"=$17,
"bSaleParty"=$18,
"bPurchaseParty"=$19,
"bEEFCClient"=$20,
"bPrintAddress"=$21,
"vLocation"=$22,
"vWebsite"=$23,
"vCreditPolicy"=$24,
"nCREDITLIM"=$25,
"nCREDITDAYS"=$26,
"nAddCreditLimit"=$27,
"nAddCreditDays"=$28,
"nTxnSaleLimit"=$29,
"nTxnPurLimit"=$30,
"nChqTxnlimt"=$31,
"vKYCApprovalNumber"=$32,
"vKYCRiskCategory"=$33,
"nHandlingCharges"=$34,
"bTDSDED"=$35,
"nTDSPER"=$36,
"vTDSGroup"=$37,
"bServiceTax"=$38,
"bIGSTOnly"=$39,
"cGSTNO"=$40,
"sGSTNO"=$41,
"iGSTNO"=$42,
"vState"=$43,
"AccHolderName"=$44,
"BankName"=$45,
"AccNumber"=$46,
"IFSCCode"=$47,
"BankAddress"=$48,
"CancelledChequecopy"=$49,
"vPanName"=$50,
"dPanDOB"=$51,
"vPan"=$52,
"nMrktExecutive"=$53,
"nBranchID"=$54,
"dBlockDate"=$55,
"dEstblishDate"=$56,
"Remarks"=$57,
"vRegno"=$58,
"dRegdate"=$59,
"bExportParty"=$60,
"bEnforcement"=$61 WHERE "nCodesID" = $62 RETURNING *`,
      [
        vCode,
        vName,
        vBranchCode,
        dIntdate,
        bActive,
        bIND,
        vAddress1,
        vAddress2,
        vAddress3,
        vPinCode,
        vPhone,
        vFax,
        vEmail,
        vDesign,
        vGrpcode,
        vEntityType,
        vBusinessNature,
        bSaleParty,
        bPurchaseParty,
        bEEFCClient,
        bPrintAddress,
        vLocation,
        vWebsite,
        vCreditPolicy,
        nCREDITLIM,
        nCREDITDAYS,
        nAddCreditLimit,
        nAddCreditDays,
        nTxnSaleLimit,
        nTxnPurLimit,
        nChqTxnlimt,
        vKYCApprovalNumber,
        vKYCRiskCategory,
        nHandlingCharges,
        bTDSDED,
        nTDSPER,
        vTDSGroup,
        bServiceTax,
        bIGSTOnly,
        cGSTNO,
        sGSTNO,
        iGSTNO,
        vState,
        AccHolderName,
        BankName,
        AccNumber,
        IFSCCode,
        BankAddress,
        CancelledChequecopy,
        vPanName,
        dPanDOB,
        vPan,
        nMrktExecutive,
        nBranchID,
        dBlockDate,
        dEstblishDate,
        Remarks,
        vRegno,
        dRegdate,
        bExportParty,
        bEnforcement,
        nCodesID,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Profile not found");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send("Error updating data");
  }
});

router.post("/PartyProfileDelete", authMiddleware, async (req, res) => {
  const { nCodesID } = req.body;

  const query = `
  UPDATE "mstCODES"
  SET "bIsDeleted" = true
  WHERE "nCodesID" = $1
  `;

  try {
    pool.query(query, [nCodesID], (error, results) => {
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

// -----------------------------------------------------------------------CRUD END----------------------------------------------

// -------------------------------------------------------------------------OPTIONS------------------------------------------------
router.get("/GroupOptions", authMiddleware, async (req, res) => {
  const { vType } = req.query;
  if (!vType) {
    return res.status(400).send("vType query parameter is required");
  }

  try {
    const { rows } = await pool.query(
      `select * from "MMASTERS" where "vType" = $1 ORDER BY "nMasterID" ASC`,
      [vType]
    );

    const GroupOptions = rows.map((row) => ({
      value: row.vCode,
      label: row.vDescription,
    }));

    res.json(GroupOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/EntityOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * from "MMASTERS" where "vType" = 'ES' ORDER BY "nMasterID" ASC`
    );

    const EntityOptions = rows.map((row) => ({
      value: row.vCode,
      label: row.vDescription,
    }));

    res.json(EntityOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/EntityOptions/AD", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * from "MMASTERS" where "vDescription" = 'PUBLIC SECTOR BANK' ORDER BY "nMasterID" ASC`
    );

    const EntityOptions = rows.map((row) => ({
      value: row.vCode,
      label: row.vDescription,
    }));

    res.json(EntityOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/BankNatureOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * from "MMASTERS" where "vType" = 'BN' ORDER BY "nMasterID" ASC`
    );

    const BNOptions = rows.map((row) => ({
      value: row.vCode,
      label: row.vDescription,
    }));

    res.json(BNOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/stateOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM "MMASTERS" WHERE "vType" = 'ST' AND "vCode" != 'ZZ' ORDER BY "nMasterID" ASC`
    );

    const BNOptions = rows.map((row) => ({
      value: row.vDescription,
      label: row.vDescription,
    }));

    res.json(BNOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/MrktExecOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      //       `SELECT "nCodesID", "vCode", "vName"
      // FROM "mstCODES" AS mc
      // WHERE "vType" = 'ME'
      //   AND "nCodesID" = (
      //       SELECT MIN("nCodesID")
      //       FROM "mstCODES"
      //       WHERE "vCode" = mc."vCode"
      //         AND "vType" = 'ME'
      //   )
      // ORDER BY "vName"
      // `
      `SELECT * FROM "mstCODES" WHERE "vType"='ME' AND "bActive" = true AND "bIsDeleted"=false  ORDER BY "nCodesID"`
    );

    const MrktExecOptions = rows.map((row) => ({
      value: row.nCodesID,
      label: ` ${row.vCode} - ${row.vName}`,
    }));

    res.json(MrktExecOptions);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/BranchOptions", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "nBranchID","vBranchCode" FROM "mstCompany" WHERE "bIsdeleted"= false`
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

// -------------------------------------------------------------------------OPTIONS------------------------------------------------

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
  const { nCurrencyID } = req.body;

  const query = `
    UPDATE "mCurrency"
    SET "bIsDeleted" = true
    WHERE "nCurrencyID" = $1
    `;

  try {
    pool.query(query, [nCurrencyID], (error, results) => {
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

//   ------------------------------------------------Party Profile Common Page-------------------------------------------------------------------

module.exports = router;
