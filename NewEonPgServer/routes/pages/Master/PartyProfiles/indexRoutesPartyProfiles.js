const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../../middleware/authMiddleware");
const PartyProfileModel = require("../../../../models/pages/Master/PartyProfiles/PartyProfileModel");

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
    const profiles = await PartyProfileModel.getPartyProfiles(vType);
    res.json(profiles);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Create a new party profile
router.post("/PartyProfiles", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await PartyProfileModel.createPartyProfile(data);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating data:", error);
    if (error.message === "Invalid nBranchID") {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("Error creating data");
    }
  }
});

// Update an existing party profile
router.put("/PartyProfiles", authMiddleware, async (req, res) => {
  try {
    const { nCodesID, ...data } = transformEmptyToNull(req.body);
    const result = await PartyProfileModel.updatePartyProfile(nCodesID, data);
    res.json(result);
  } catch (error) {
    console.error("Error updating data:", error);
    if (error.message === "Invalid nBranchID") {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("Error updating data");
    }
  }
});

router.post("/PartyProfileDelete", authMiddleware, async (req, res) => {
  const { nCodesID } = req.body;

  try {
    await PartyProfileModel.deletePartyProfile(nCodesID);
    res.status(201).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send("Error deleting data");
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
    const options = await PartyProfileModel.getGroupOptions(vType);
    res.json(options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/EntityOptions", authMiddleware, async (req, res) => {
  try {
    const options = await PartyProfileModel.getEntityOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});


router.get("/EntityOptions/AD", authMiddleware, async (req, res) => {
  try {
    const options = await PartyProfileModel.getEntityOptionsAD();
    res.json(options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});


router.get("/BankNatureOptions", authMiddleware, async (req, res) => {
  try {
    const options = await PartyProfileModel.getBankNatureOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/stateOptions", authMiddleware, async (req, res) => {
  try {
    const options = await PartyProfileModel.getStateOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/MrktExecOptions", authMiddleware, async (req, res) => {
  try {
    const options = await PartyProfileModel.getMarketExecutiveOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

router.get("/BranchOptions", authMiddleware, async (req, res) => {
  try {
    const options = await PartyProfileModel.getBranchOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// -------------------------------------------------------------------------OPTIONS------------------------------------------------

//   ------------------------------------------------Party Profile Common Page-------------------------------------------------------------------

module.exports = router;
