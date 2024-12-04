const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/authMiddleware");
const TransactionModel = require("../../../models/pages/Transactions/TransactionModel");

// Get transactions
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const { vTrnwith, vTrntype, fromDate, toDate } = req.query;
    const result = await TransactionModel.getTransactions({
      vTrnwith,
      vTrntype,
      fromDate,
      toDate
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error fetching transactions" });
  }
});

// Create new transaction
router.post("/transactions", authMiddleware, async (req, res) => {
  try {
    const result = await TransactionModel.createTransaction(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error creating transaction" });
  }
});

// Get next transaction number
router.get("/transactions/nextNumber", authMiddleware, async (req, res) => {
  try {
    const { vTrnwith, vTrntype } = req.query;
    const result = await TransactionModel.getNextTransactionNumber(vTrnwith, vTrntype);
    res.json(result);
  } catch (error) {
    console.error('Error getting next transaction number:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Purpose options based on parameters
router.get('/getPurposeOptions', authMiddleware, async (req, res) => {
  try {
    const { vTrnWith, vTrnType, TrnSubType } = req.query;
    const result = await TransactionModel.getPurposeOptions(vTrnWith, vTrnType, TrnSubType);
    res.json(result);
  } catch (error) {
    console.error('Error getting purpose options:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Category options
router.get('/getCategoryOptions', authMiddleware, async (req, res) => {
  try {
    const result = await TransactionModel.getCategoryOptions();
    res.json(result);
  } catch (error) {
    console.error('Error getting category options:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Party Type Options
router.get('/party-type-options',authMiddleware,async (req, res) => {
  try {
    const options = await TransactionModel.getPartyTypeOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching party type options:', error);
    res.status(500).json({ error: 'Failed to fetch party type options' });
  }
});

router.get('/party-type-options/:entityType', authMiddleware,async (req, res) => {
  try {
    const { entityType } = req.params;
    const options = await TransactionModel.getPartyTypeOptions(entityType);
    res.json({ success: true, data: options });
  } catch (error) {
    console.error('Error fetching party type options:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch party type options' });
  }
});

// Get Nationality Options
router.get('/nationality-options', authMiddleware,async (req, res) => {
  try {
    const options = await TransactionModel.getNationalityOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching nationality options:', error);
    res.status(500).json({ error: 'Failed to fetch nationality options' });
  }
});

// Get City Options
router.get('/city-options', authMiddleware,async (req, res) => {
  try {
    const options = await TransactionModel.getCityOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching city options:', error);
    res.status(500).json({ error: 'Failed to fetch city options' });
  }
});

// Get State Options
router.get('/state-options', authMiddleware,async (req, res) => {
  try {
    const options = await TransactionModel.getStateOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching state options:', error);
    res.status(500).json({ error: 'Failed to fetch state options' });
  }
});

// Get Country Options
router.get('/country-options', authMiddleware,async (req, res) => {
  try {
    const options = await TransactionModel.getCountryOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching country options:', error);
    res.status(500).json({ error: 'Failed to fetch country options' });
  }
});

// Get ID Type Options
router.get('/id-type-options', authMiddleware,async (req, res) => {
  try {
    const options = await TransactionModel.getIDTypeOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching ID type options:', error);
    res.status(500).json({ error: 'Failed to fetch ID type options' });
  }
});

// Get Transaction Details
router.get('/transaction/:id', authMiddleware,async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await TransactionModel.getTransactionById(id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction details' });
  }
});

// PAX Management Routes
router.get('/pax-list', authMiddleware,async (req, res) => {
  try {
    const { partyType } = req.query;
    const paxList = await TransactionModel.getPaxList(partyType);
    res.json({ success: true, data: paxList });
  } catch (error) {
    console.error('Error in /pax-list:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch PAX list' });
  }
});

router.get('/pax-details/:paxCode', authMiddleware,async (req, res) => {
  try {
    const { paxCode } = req.params;
    const paxDetails = await TransactionModel.getPaxDetails(paxCode);
    
    if (!paxDetails) {
      return res.status(404).json({ success: false, message: 'PAX not found' });
    }
    
    res.json({ success: true, data: paxDetails });
  } catch (error) {
    console.error('Error in /pax-details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch PAX details' });
  }
});

router.post('/check-pax-name',authMiddleware, async (req, res) => {
  try {
    const { paxName, excludePaxCode } = req.body;
    
    if (!paxName) {
      return res.status(400).json({ success: false, message: 'PAX name is required' });
    }
    
    const exists = await TransactionModel.checkPaxNameExists(paxName, excludePaxCode);
    res.json({ success: true, exists });
  } catch (error) {
    console.error('Error in /check-pax-name:', error);
    res.status(500).json({ success: false, message: 'Failed to check PAX name' });
  }
});

router.post('/save-pax', authMiddleware, async (req, res) => {
  try {
    const paxDetails = req.body;
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    if (!paxDetails.vPaxname) {
      return res.status(400).json({ success: false, message: 'PAX name is required' });
    }
    
    // Check for duplicate PAX name
    const exists = await TransactionModel.checkPaxNameExists(
      paxDetails.vPaxname,
      paxDetails.vPaxCode // Exclude current PAX code if editing
    );
    
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A PAX with this name already exists'
      });
    }
    
    const result = await TransactionModel.savePaxDetails(paxDetails, userId);
    res.json({
      success: true,
      data: result,
      message: `PAX ${paxDetails.vPaxCode ? 'updated' : 'created'} successfully`
    });
  } catch (error) {
    console.error('Error in /save-pax:', error);
    res.status(500).json({ success: false, message: 'Failed to save PAX details' });
  }
});

module.exports = router;
