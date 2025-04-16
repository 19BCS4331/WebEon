const express = require("express");
const router = express.Router();
const CurrencyOpeningBalanceModel = require("../../../../models/pages/Master/Miscellaneous/CurrencyOpeningBalanceModel");
const authMiddleware = require("../../../../middleware/authMiddleware");

//get counters
router.post("/counters", authMiddleware, async (req, res) => {
  try {
    const result = await CurrencyOpeningBalanceModel.getCounters(req.body.branch);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching counters:", error);
    res.status(500).json({ error: "Failed to fetch counters" });
  }
});

//Get all currencies
router.get("/currencies", authMiddleware, async (req, res) => {
  try {
    const result = await CurrencyOpeningBalanceModel.getAllCurrencies();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({ error: "Failed to fetch currencies" });
  }
});

router.get("/products", authMiddleware, async (req, res) => {
  try {
    const result = await CurrencyOpeningBalanceModel.getAllProducts();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get all currency opening balances with pagination
router.get("/currencyOpeningBalance", authMiddleware, async (req, res) => {
  try {
    const result = await CurrencyOpeningBalanceModel.getAllCurrencyOpeningBalances();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching currency opening balances:", error);
    res.status(500).json({ error: "Failed to fetch currency opening balances" });
  }
});

// Get currency opening balance by ID
router.get("/currencyOpeningBalance/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CurrencyOpeningBalanceModel.getCurrencyOpeningBalanceById(id);
    
    if (!result) {
      return res.status(404).json({ error: "Currency opening balance not found" });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching currency opening balance by ID:", error);
    res.status(500).json({ error: "Failed to fetch currency opening balance" });
  }
});

// Create new currency opening balance
router.post("/currencyOpeningBalance", authMiddleware, async (req, res) => {
  try {
    const result = await CurrencyOpeningBalanceModel.createCurrencyOpeningBalance(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating currency opening balance:", error);
    res.status(500).json({ error: "Failed to create currency opening balance" });
  }
});

// Update currency opening balance
router.put("/currencyOpeningBalance", authMiddleware, async (req, res) => {
  try {
    const result = await CurrencyOpeningBalanceModel.updateCurrencyOpeningBalance(req.body);
    
    if (!result) {
      return res.status(404).json({ error: "Currency opening balance not found" });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating currency opening balance:", error);
    res.status(500).json({ error: "Failed to update currency opening balance" });
  }
});

// Delete currency opening balance
router.post("/currencyOpeningBalance/delete", authMiddleware, async (req, res) => {
  try {
    const { idToDelete } = req.body;
    const result = await CurrencyOpeningBalanceModel.deleteCurrencyOpeningBalance(idToDelete);
    
    if (!result) {
      return res.status(404).json({ error: "Currency opening balance not found" });
    }
    
    res.status(200).json({ message: "Currency opening balance deleted successfully" });
  } catch (error) {
    console.error("Error deleting currency opening balance:", error);
    res.status(500).json({ error: "Failed to delete currency opening balance" });
  }
});

// Bulk import currency opening balances from CSV
router.post("/bulk-import", authMiddleware, async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid records provided for import" 
      });
    }
    
    const result = await CurrencyOpeningBalanceModel.bulkImportCurrencyOpeningBalances(records);
    
    res.status(200).json({
      success: true,
      message: `Successfully imported ${result.count} currency opening balance records`,
      data: result
    });
  } catch (error) {
    console.error("Error bulk importing currency opening balances:", error);
    
    // Extract the most specific error message, handling nested errors
    let errorMessage = "Failed to import currency opening balances";
    
    // Check for nested errors (can be deeply nested)
    let currentError = error;
    while (currentError) {
      // If we find a message about invalid currency codes, use it
      if (currentError.message && currentError.message.includes("Invalid currency codes")) {
        errorMessage = currentError.message;
        break;
      }
      
      // Move to the next nested error if it exists
      currentError = currentError.originalError;
    }
    
    // Return appropriate status code based on error type
    const statusCode = errorMessage.includes("Invalid currency codes") ? 400 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage
    });
  }
});

module.exports = router;
