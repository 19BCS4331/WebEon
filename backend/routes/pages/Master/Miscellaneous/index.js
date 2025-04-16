const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../../middleware/authMiddleware");
const CounterMasterModel = require("../../../../models/pages/Master/Miscellaneous/CounterMasterModel");
const MasterPurposeModel = require("../../../../models/pages/Master/Miscellaneous/MasterPurposeModel");
const SubPurposeModel = require("../../../../models/pages/Master/Miscellaneous/SubPurposeModel");
const { transformEmptyToNull } = require("../../../../utils/transformEmptyToNull");

// Counter Master Routes

// FETCH
router.get("/counterMaster", authMiddleware, async (req, res) => {
  try {
    const counters = await CounterMasterModel.getAllCounters();
    res.json(counters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// CREATE
router.post("/counterMaster", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await CounterMasterModel.createCounter(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error creating counter" });
  }
});

// UPDATE
router.put("/counterMaster", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await CounterMasterModel.updateCounter(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error updating counter" });
  }
});

// DELETE
router.post("/counterMaster/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete, nDeletedBy } = req.body;
    if (!idToDelete) {
      return res.status(400).json({ error: "Counter ID is required" });
    }
    const result = await CounterMasterModel.deleteCounter(idToDelete, nDeletedBy);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error deleting counter" });
  }
});

// Purpose Master Routes

// FETCH
router.get("/masterPurpose", authMiddleware, async (req, res) => {
  try {
    const result = await MasterPurposeModel.getAllPurposes();
    res.json(result || []);
  } catch (error) {
    res.status(500).json({ error: error.message || "Error fetching purposes" });
  }
});

// CREATE
router.post("/masterPurpose", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await MasterPurposeModel.createPurpose(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error creating purpose" });
  }
});

// UPDATE
router.put("/masterPurpose", authMiddleware, async (req, res) => {
  try {
    const data = transformEmptyToNull(req.body);
    const result = await MasterPurposeModel.updatePurpose(data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error updating purpose" });
  }
});

// DELETE
router.post("/masterPurpose/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete, nDeletedBy } = req.body;
    if (!idToDelete) {
      return res.status(400).json({ error: "Purpose ID is required" });
    }
    const result = await MasterPurposeModel.deletePurpose(idToDelete, nDeletedBy);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error deleting purpose" });
  }
});

// SubPurpose Routes
router.get("/subPurpose", authMiddleware, async (req, res) => {
  try {
    const result = await SubPurposeModel.getAllSubPurposes();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error fetching sub purposes" });
  }
});

router.get("/subPurpose/masterPurposeOptions", authMiddleware, async (req, res) => {
  try {
    const result = await SubPurposeModel.getMasterPurposeOptions();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error fetching master purpose options" });
  }
});

router.post("/subPurpose", authMiddleware, async (req, res) => {
  try {
    const result = await SubPurposeModel.createSubPurpose(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error creating sub purpose" });
  }
});

router.put("/subPurpose", authMiddleware, async (req, res) => {
  try {
    const result = await SubPurposeModel.updateSubPurpose(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error updating sub purpose" });
  }
});

router.post("/subPurpose/delete", authMiddleware, async (req, res) => {
  try {
    const result = await SubPurposeModel.deleteSubPurpose(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error deleting sub purpose" });
  }
});

module.exports = router;