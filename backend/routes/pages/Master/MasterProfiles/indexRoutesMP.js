const express = require("express");
const router = express.Router();
const pool = require("../../../../config/db");
const authMiddleware = require("../../../../middleware/authMiddleware");
const { CurrencyProfileModel } = require("../../../../models/pages/Master/MasterProfiles/CurrencyProfileModel");
const { FinancialProfileModel } = require("../../../../models/pages/Master/MasterProfiles/FinancialProfileModel");
const { FinancialSubProfileModel } = require("../../../../models/pages/Master/MasterProfiles/FinancialSubProfileModel");
const { DivisionProfileModel } = require("../../../../models/pages/Master/MasterProfiles/DivisionProfileModel");
const { DivisionDetailsModel } = require("../../../../models/pages/Master/MasterProfiles/DivisionDetailsModel");
const { AccountsProfileModel } = require("../../../../models/pages/Master/MasterProfiles/AccountsProfileModel");
const { AD1MasterModel } = require("../../../../models/pages/Master/MasterProfiles/AD1MasterModel");

const transformEmptyToNull = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    acc[key] = data[key] === "" ? null : data[key];
    return acc;
  }, {});
};

//   ------------------------------------------------CURRENCY PROFILE-------------------------------------------------------------------

router.get("/currencyProfile", authMiddleware, async (req, res) => {
  try {
    const currencies = await CurrencyProfileModel.getAllCurrencies();
    res.json(currencies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/currencyProfile/countries", authMiddleware, async (req, res) => {
  try {
    const countries = await CurrencyProfileModel.getCountries();
    console.log("Data Fetched successfully");
    res.json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CRUD
router.post("/currencyProfile", authMiddleware, async (req, res) => {
  try {
    await CurrencyProfileModel.createCurrency(req.body);
    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/currencyProfile", authMiddleware, async (req, res) => {
  try {
    await CurrencyProfileModel.updateCurrency(req.body);
    console.log("Data Edited successfully");
    res.status(201).json({ message: "Data Edited successfully" });
  } catch (error) {
    console.error("Error Editing:", error);
    res.status(500).json({ error: "Error Editing data" });
  }
});

router.post("/currencyProfile/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete } = req.body;
    await CurrencyProfileModel.deleteCurrency(idToDelete);
    console.log("Data deleted successfully");
    res.status(201).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting row:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});
// CRUD

//   ------------------------------------------------CURRENCY PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------FINANCIAL PROFILE-------------------------------------------------------------------

router.get("/financialProfile", authMiddleware, async (req, res) => {
  try {
    const profiles = await FinancialProfileModel.getAllFinancialProfiles();
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/financialProfile/:finCode", authMiddleware, async (req, res) => {
  try {
    const { finCode } = req.params;
    const result = await FinancialProfileModel.findByFinCode(finCode);
    if (!result) {
      return res.status(404).json({ error: "Financial profile not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error finding financial profile:", error);
    res.status(500).json({ error: "Error finding financial profile" });
  }
});

router.post("/financialProfile", authMiddleware, async (req, res) => {
  try {
    await FinancialProfileModel.createFinancialProfile(req.body);
    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/financialProfile", authMiddleware, async (req, res) => {
  try {
    await FinancialProfileModel.updateFinancialProfile(req.body);
    console.log("Data Edited successfully");
    res.status(201).json({ message: "Data Edited successfully" });
  } catch (error) {
    console.error("Error Editing:", error);
    res.status(500).json({ error: "Error Editing data" });
  }
});

router.post("/financialProfile/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete } = req.body;
    await FinancialProfileModel.deleteFinancialProfile(idToDelete);
    console.log("Data deleted successfully");
    res.status(201).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting row:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});
// CRUD

//   ------------------------------------------------FINANCIAL PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------FINANCIAL SUBPROFILE-------------------------------------------------------------------

router.get("/financialSubProfile", authMiddleware, async (req, res) => {
  try {
    const result = await FinancialSubProfileModel.getAllFinancialSubProfiles();
    res.json(result);
  } catch (error) {
    console.error("Error fetching financial sub profiles:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

router.post("/financialSubProfile/finCode", authMiddleware, async (req, res) => {
  try {
    const { vFinType } = req.body;
    const result = await FinancialSubProfileModel.findByFinCode(vFinType);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Financial sub profiles not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error finding financial sub profiles:", error);
    res.status(500).json({ error: "Error finding financial sub profiles" });
  }
});

router.post("/financialSubProfile", authMiddleware, async (req, res) => {
  try {
    const result = await FinancialSubProfileModel.createFinancialSubProfile(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating financial sub profile:", error);
    res.status(500).json({ error: "Error creating data" });
  }
});

router.put("/financialSubProfile", authMiddleware, async (req, res) => {
  try {
    const result = await FinancialSubProfileModel.updateFinancialSubProfile(req.body);
    if (!result) {
      return res.status(404).json({ error: "Financial sub profile not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating financial sub profile:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

router.post("/financialSubProfile/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete } = req.body;
    const result = await FinancialSubProfileModel.deleteFinancialSubProfile(idToDelete);
    if (!result) {
      return res.status(404).json({ error: "Financial sub profile not found" });
    }
    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting financial sub profile:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

//   ------------------------------------------------FINANCIAL SUBPROFILE END-------------------------------------------------------------------

//   ------------------------------------------------DIVISION PROFILE-------------------------------------------------------------------

router.get("/divisionProfile", authMiddleware, async (req, res) => {
  try {
    const result = await DivisionProfileModel.getAllDivisionProfiles();
    res.json(result);
  } catch (error) {
    console.error("Error fetching division profiles:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

router.get("/divisionProfile/branch", authMiddleware, async (req, res) => {
  try {
    const result = await DivisionProfileModel.getBranchCodes();
    res.json(result);
  } catch (error) {
    console.error("Error fetching branch codes:", error);
    res.status(500).json({ error: "Error fetching branch codes" });
  }
});

router.post("/divisionProfile", authMiddleware, async (req, res) => {
  try {
    const result = await DivisionProfileModel.createDivisionProfile(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating division profile:", error);
    res.status(500).json({ error: "Error creating data" });
  }
});

router.put("/divisionProfile", authMiddleware, async (req, res) => {
  try {
    const result = await DivisionProfileModel.updateDivisionProfile(req.body);
    if (!result) {
      return res.status(404).json({ error: "Division profile not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating division profile:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

router.post("/divisionProfile/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete } = req.body;
    const result = await DivisionProfileModel.deleteDivisionProfile(idToDelete);
    if (!result) {
      return res.status(404).json({ error: "Division profile not found" });
    }
    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting division profile:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

//   ------------------------------------------------DIVISION PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------DIVISION DETAILS-------------------------------------------------------------------

router.get("/divisionDetails", authMiddleware, async (req, res) => {
  try {
    const result = await DivisionDetailsModel.getAllDivisionDetails();
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/divisionDetails/divCode", authMiddleware, async (req, res) => {
  try {
    const result = await DivisionDetailsModel.getDivisionCodes();
    const divCodes = result.map((row) => row.value);
    console.log("Data Fetched successfully");
    res.json(divCodes);
  } catch (error) {
    console.error("Error Fetching:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/divisionDetails", authMiddleware, async (req, res) => {
  try {
    await DivisionDetailsModel.createDivisionDetails(req.body);
    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/divisionDetails", authMiddleware, async (req, res) => {
  try {
    await DivisionDetailsModel.updateDivisionDetails(req.body);
    console.log("Data updated successfully");
    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

router.post("/divisionDetails/delete", authMiddleware, async (req, res) => {
  const { idToDelete } = req.body;

  try {
    await DivisionDetailsModel.deleteDivisionDetails(idToDelete);
    console.log("Data deleted successfully");
    res.status(201).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting row:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

//   ------------------------------------------------DIVISION DETAILS END-------------------------------------------------------------------

//   ------------------------------------------------ACCOUNTS PROFILE-------------------------------------------------------------------

// OPTIONS
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
    console.log("Data Fetched successfully");
    res.json(subfinCodes);
  } catch (err) {
    console.error("Error Fetching:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(
  "/accountsProfile/branchTransfer",
  authMiddleware,
  async (req, res) => {
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
  }
);

// OPTIONS END

// CRUD START

router.get("/accountsProfile", authMiddleware, async (req, res) => {
  try {
    const result = await AccountsProfileModel.getAllAccountsProfiles();
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/accountsProfile", authMiddleware, async (req, res) => {
  try {
    const result = await AccountsProfileModel.createAccountsProfile(transformEmptyToNull(req.body));
    console.log("Data inserted successfully");
    res.status(201).json(result);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/accountsProfile", authMiddleware, async (req, res) => {
  try {
    const result = await AccountsProfileModel.updateAccountsProfile(transformEmptyToNull(req.body));
    if (!result) {
      return res.status(404).send("Profile not found");
    }
    console.log("Data updated successfully");
    res.json(result);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

router.post("/accountsProfile/delete", authMiddleware, async (req, res) => {
  const { idToDelete } = req.body;
  
  try {
    const result = await AccountsProfileModel.deleteAccountsProfile(idToDelete);
    if (!result) {
      return res.status(404).send("Profile not found");
    }
    console.log("Data deleted successfully");
    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// CRUD END

//   ------------------------------------------------ACCOUNTS PROFILE END-------------------------------------------------------------------

//   ------------------------------------------------AD1 Master-------------------------------------------------------------------

router.get("/ad1Master", authMiddleware, async (req, res) => {
  try {
    const result = await AD1MasterModel.getAllAD1Masters();
    console.log("Data Fetched successfully");
    res.json(result);
  } catch (error) {
    console.error("Error Fetching:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/ad1Master", authMiddleware, async (req, res) => {
  try {
    const result = await AD1MasterModel.createAD1Master(req.body);
    if (!result) {
      return res.status(404).send("Profile not found");
    }
    console.log("Data inserted successfully");
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error inserting data" });
  }
});

router.put("/ad1Master", authMiddleware, async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const result = await AD1MasterModel.updateAD1Master(id, data);
    if (!result) {
      return res.status(404).send("Profile not found");
    }
    console.log("Data Edited successfully");
    res.status(201).json({ message: "Data Edited successfully" });
  } catch (error) {
    console.error("Error Editing:", error);
    res.status(500).json({ error: "Error Editing data" });
  }
});

router.post("/ad1Master/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete } = req.body;
    const result = await AD1MasterModel.deleteAD1Master(idToDelete);
    if (!result) {
      return res.status(404).send("Profile not found");
    }
    console.log("Data deleted successfully");
    res.status(201).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting row:", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

//   ------------------------------------------------AD1 Master END-------------------------------------------------------------------

module.exports = router;
