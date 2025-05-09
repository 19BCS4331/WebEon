const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/authMiddleware");
const { requirePermission, attachPermissions } = require("../../../middleware/permissionMiddleware");
const { getFrontendPathForEndpoint } = require("../../../utils/requestUtils");
const TransactionModel = require("../../../models/pages/Transactions/TransactionModel");

// Get transactions
router.get("/transactions", authMiddleware, requirePermission((req) => getFrontendPathForEndpoint(req), 'view'), async (req, res) => {
  try {
    const { vTrnwith, vTrntype, fromDate, toDate, branchId,counterID } = req.query;
    const result = await TransactionModel.getTransactions({
      vTrnwith,
      vTrntype,
      fromDate,
      toDate,
      branchId,
      counterID
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error fetching transactions" });
  }
});

// Create new transaction
// router.post("/transactions", authMiddleware, async (req, res) => {
//   try {
//     const result = await TransactionModel.createTransaction(req.body);
//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message || "Error creating transaction" });
//   }
// }); --- OBSELETE (save-transaction route is used at the end)

// Get next transaction number
router.get("/transactions/nextNumber", authMiddleware, async (req, res) => {
  try {
    const { vTrnwith, vTrntype, nBranchID } = req.query;
    const result = await TransactionModel.getNextTransactionNumber(vTrnwith, vTrntype, nBranchID);
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

// Get Party Type Options Based On EntityType
router.get('/party-type-options/:entityType', authMiddleware,async (req, res) => {
  try {
    const { entityType } = req.params;
    const { vTrnwith } = req.query;
    const options = await TransactionModel.getPartyTypeOptions(entityType, vTrnwith);
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

// PAX ROUTES START

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

// PAX ROUTES END

// Get agents
router.get("/agents", authMiddleware, async (req, res) => {
  try {
    const { branchId } = req.query;
    const agents = await TransactionModel.getAgents(branchId);
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: error.message || "Error fetching agents" });
  }
});

// Get marketing references
router.get("/marketing-refs", authMiddleware, async (req, res) => {
  try {
    const { branchId } = req.query;
    const marketingRefs = await TransactionModel.getMarketingRefs(branchId);
    res.json(marketingRefs);
  } catch (error) {
    console.error("Error fetching marketing refs:", error);
    res.status(500).json({ error: error.message || "Error fetching marketing references" });
  }
});

// Get delivery persons
router.get("/delivery-persons", authMiddleware, async (req, res) => {
  try {
    const { branchId } = req.query;
    const deliveryPersons = await TransactionModel.getDeliveryPersons(branchId);
    res.json(deliveryPersons);
  } catch (error) {
    console.error("Error fetching delivery persons:", error);
    res.status(500).json({ error: error.message || "Error fetching delivery persons" });
  }
});

// Get currency options
router.get('/getCurrencies', authMiddleware, async (req, res) => {
  try {
    const currencies = await TransactionModel.getCurrencies();
    res.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch currencies' });
  }
});

// Get product types
router.get('/getProductTypes', authMiddleware, async (req, res) => {
  try {
    const {vTrnType} = req.query;
    const types = await TransactionModel.getProductTypes(vTrnType);
    res.json(types);
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch product types' });
  }
});

// Get issuers based on product type
router.get('/getIssuers', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;
    const issuers = await TransactionModel.getIssuers(type);
    res.json(issuers);
  } catch (error) {
    console.error('Error fetching issuers:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch issuers' });
  }
});

// Get rate for currency
router.get('/getRate', authMiddleware, async (req, res) => {
  try {
    const { currencyCode } = req.query;
    const rate = await TransactionModel.getRate(currencyCode);
    res.json(rate);
  } catch (error) {
    console.error('Error fetching rate:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch rate' });
  }
});

// Get rate with margin
router.get('/getRateWithMargin', async (req, res) => {
  try {
    const { currencyCode, productType, branchId, issCode, trnType } = req.query;
    
    if (!currencyCode || !productType || !branchId || !trnType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const rateInfo = await TransactionModel.getRateWithMargin(
      currencyCode,
      productType,
      parseInt(branchId),
      issCode || '',
      trnType
    );

    res.json({
      success: true,
      data: rateInfo
    });

  } catch (error) {
    console.error('Error in getRateWithMargin:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get exchange data for a transaction
router.get("/getExchangeData", authMiddleware, async (req, res) => {
  try {
    const { vNo, vTrnwith, vTrntype } = req.query;
    const result = await TransactionModel.getExchangeData(vNo, vTrnwith, vTrntype);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching exchange data:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Error fetching exchange data" 
    });
  }
});

// Get other charge accounts
router.get('/getOtherChargeAccounts', authMiddleware, async (req, res) => {
  try {
    const accounts = await TransactionModel.getOtherChargeAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching other charge accounts:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get tax data for transaction
router.get("/getTaxData", authMiddleware, async (req, res) => {
  try {
    const { vTrntype } = req.query;
    const result = await TransactionModel.getTaxData(vTrntype);
    res.json(result);
  } catch (error) {
    console.error("Error fetching tax data:", error);
    res.status(500).json({ error: error.message || "Error fetching tax data" });
  }
});

// Get payment codes for transaction (BUY)
router.get('/getPaymentCodesBuy', authMiddleware, async (req, res) => {
  try {
    const codes = await TransactionModel.getPaymentCodesBuy();
    res.json(codes);
  } catch (error) {
    console.error('Error fetching payment codes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payment codes' });
  }
});

// Get payment codes for transaction (SELL)
router.get('/getPaymentCodesSell', authMiddleware, async (req, res) => {
  try {
    const codes = await TransactionModel.getPaymentCodesSell();
    res.json(codes);
  } catch (error) {
    console.error('Error fetching payment codes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payment codes' });
  }
});

// Get Cheque Options
router.get('/cheque-options/:bankCode', async (req, res) => {
  try {
    const { bankCode } = req.params;
    const chequeOptions = await TransactionModel.getChequeOptions(bankCode);
    
    if (!chequeOptions) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    res.json({
      success: true,
      data: chequeOptions.map(option => ({
        value: String(option.ChequeNo),  // Convert to string
        label: String(option.ChequeNo),  // Convert to string
        code: option.Code,
        recType: option.RecType,
        issued: option.Issued
      }))
    });
  } catch (error) {
    console.error('Error fetching cheque options:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cheque options',
      error: error.message
    });
  }
});

// Calculate Hold Cost for CN product
router.post('/calcHoldCostCN', async (req, res) => {
  try {
    const result = await TransactionModel.calcHoldCostCN(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check balance for a currency
router.get("/check-balance", authMiddleware, async (req, res) => {
  try {
    const { cncode, exchtype, counter, vBranchCode } = req.query;
    
    // Validate required parameters
    if (!cncode || !exchtype || !counter || !vBranchCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required parameters: cncode, exchtype, counter, and vBranchCode are required" 
      });
    }
    
    const result = await TransactionModel.checkBalance(
      cncode, 
      exchtype, 
      counter, 
      vBranchCode
    );
    
    res.json(result);
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check balance",
      error: error.message 
    });
  }
});

// Save new transaction with all related data
router.post("/save-transaction", authMiddleware, requirePermission((req) => getFrontendPathForEndpoint(req), 'add'), async (req, res) => {
  try {
    const result = await TransactionModel.saveTransaction(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ 
      error: error.message || "Error saving transaction",
      details: error.details || null
    });
  }
});

// Update existing transaction
router.put("/update-transaction/:id", authMiddleware, requirePermission((req) => getFrontendPathForEndpoint(req), 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TransactionModel.updateTransaction(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ 
      error: error.message || "Error updating transaction",
      details: error.details || null
    });
  }
});

// Update rates every 15 minutes
const updateRatesInterval = 15 * 60 * 1000; // 15 minutes in milliseconds
setInterval(async () => {
  try {
    await TransactionModel.updateExchangeRates();
    console.log('Exchange rates updated successfully at:', new Date().toISOString());
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
  }
}, updateRatesInterval);

// Initial update when server starts
TransactionModel.updateExchangeRates()
  .then(() => console.log('Initial exchange rates update completed at:', new Date().toISOString()))
  .catch(error => console.error('Failed initial exchange rates update:', error));

module.exports = router;
