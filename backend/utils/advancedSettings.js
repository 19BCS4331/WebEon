/**
 * Utility functions for retrieving advanced settings from the database
 * These functions help with getting configuration values that affect accounting entries
 * and other system behaviors
 */

const { BaseModel } = require("../models/base/BaseModel");

/**
 * Utility class for fetching and managing advanced settings
 */
class AdvancedSettingsUtil {
  /**
   * Get an advanced setting from the database
   * @param {string} dataCode - The setting code to retrieve
   * @param {number} branchId - The branch ID (optional, defaults to 0 for global settings)
   * @param {string} defaultValue - Default value to return if setting not found
   * @returns {Promise<string>} - The setting value
   */
  static async getSetting(dataCode, branchId = 0, defaultValue = "") {
    try {
      // First try to get branch-specific setting
      if (branchId && branchId > 0) {
        const branchQuery = `
          SELECT "DATAVALUE" 
          FROM "advsettings" 
          WHERE "DATACODE" = $1 
          AND "nBranchID" = $2
          LIMIT 1
        `;
        
        const branchResult = await BaseModel.executeQuery(branchQuery, [dataCode, branchId]);
        
        if (branchResult && branchResult.length > 0) {
          return branchResult[0].DATAVALUE;
        }
      }
      
      // If no branch-specific setting or branchId not provided, try global setting
      const globalQuery = `
        SELECT "DATAVALUE" 
        FROM "advsettings" 
        WHERE "DATACODE" = $1 
        AND ("nBranchID" = 0 OR "vBranchCode" = 'ALL')
        LIMIT 1
      `;
      
      const globalResult = await BaseModel.executeQuery(globalQuery, [dataCode]);
      
      if (globalResult && globalResult.length > 0) {
        return globalResult[0].DATAVALUE;
      }
      
      // If still not found, return default value
      return defaultValue;
    } catch (error) {
      console.error(`Error getting advanced setting ${dataCode}:`, error);
      return defaultValue;
    }
  }

  /**
   * Get the appropriate debtors control account code based on party type
   * @param {string} partyType - The type of party (IND, CORP, BR, FF, MS)
   * @param {number} branchId - The branch ID
   * @returns {Promise<string>} - The debtors control account code
   */
  static async getDebtorsControlAccount(partyType, branchId = 0) {
    let settingCode = "DEBCC"; // Default for IND/CORP
    
    // Map party type to appropriate setting code
    if (partyType === "BR" || partyType === "FR") {
      settingCode = "DEBBR"; // For branches/franchisee
    } else if (partyType === "FF" || partyType === "ADS") {
      settingCode = "DEBFF"; // For FFMCs/ADS
    } else if (partyType === "MS") {
      settingCode = "DEBMS"; // For Misc Suppliers
    } else if (partyType === "RM") {
      settingCode = "DEBRM"; // For RMCs
    }
    
    // Get the setting value
    return await this.getSetting(settingCode, branchId, "DEBCTR");
  }
  
  /**
   * Get the appropriate creditors control account code based on party type
   * @param {string} partyType - The type of party (IND, CORP, BR, FF, MS)
   * @param {number} branchId - The branch ID
   * @returns {Promise<string>} - The creditors control account code
   */
  static async getCreditorControlAccount(partyType, branchId = 0) {
    let settingCode = "CRDCC"; // Default for IND/CORP
    
    // Map party type to appropriate setting code
    if (partyType === "BR" || partyType === "FR") {
      settingCode = "CRDFR"; // For branches/franchisee
    } else if (partyType === "FF" || partyType === "ADS") {
      settingCode = "CRDFF"; // For FFMCs/ADS
    } else if (partyType === "RM") {
      settingCode = "CRDRM"; // For RMCs
    }
    
    // Get the setting value
    return await this.getSetting(settingCode, branchId, "CRDCNT");
  }

  /**
 * Get the settlement account code and ID for transactions
 * @param {string} transactionType - The type of transaction (B for Buy, S for Sell)
 * @param {string} partyType - The type of party
 * @param {number} branchId - The branch ID
 * @returns {Promise<Object>} - Object containing the settlement account code and ID
 */
static async getSettlementAccount(transactionType, partyType, branchId = 0) {
  let accountCode;
  
  // For receipt/payment settlement
  if (transactionType === "B") {
    // For Buy transactions, use Creditor Control Account based on party type
    accountCode = await this.getCreditorControlAccount(partyType, branchId);
  } else if (transactionType === "S") {
    // For Sell transactions, use Debtor Control Account based on party type
    accountCode = await this.getDebtorsControlAccount(partyType, branchId);
  } else {
    // If not a specific transaction type, use debtors control account as default
    accountCode = await this.getDebtorsControlAccount(partyType, branchId);
  }
  
  // Now fetch the ID for this account code
  try {
    const id = await this.getAccountIdByCode(accountCode);
return {
  code: accountCode,
  id
};
  } catch (error) {
    console.error(`Error getting account ID for ${accountCode}:`, error);
    return {
      code: accountCode,
      id: "0"
    };
  }
}

  /**
   * Check if a boolean setting is enabled
   * @param {string} dataCode - The setting code to check
   * @param {number} branchId - The branch ID
   * @returns {Promise<boolean>} - True if the setting is enabled, false otherwise
   */
  static async isSettingEnabled(dataCode, branchId = 0) {
    const value = await this.getSetting(dataCode, branchId, "No");
    return value === "Yes" || value === "yes" || value === "Y" || value === "y" || value === "1" || value === "true";
  }

  /**
 * Get Account ID for a given code.
 * Priority: AccountsProfile.nAccID for vCode, else mstCODES.nCodeID for vCode.
 * @param {string} code - The account or party code to look up
 * @returns {Promise<string>} - The ID as a string, or "0" if not found
 */
/**
 * Get Account ID for a given code, optionally specifying the table to fetch from.
 * @param {string} code - The account or party code to look up
 * @param {string} [table] - Optional: "AccountsProfile" or "mstCODES"
 * @returns {Promise<string>} - The ID as a string, or "0" if not found
 */
static async getAccountIdByCode(code, table) {
  if (!code) return "0";
  try {
    if (table === "AccountsProfile") {
      const accQuery = `
        SELECT "nAccID"
        FROM "AccountsProfile"
        WHERE "vCode" = $1
        LIMIT 1
      `;
      const accResult = await BaseModel.executeQuery(accQuery, [code]);
      return (accResult && accResult.length > 0 && accResult[0].nAccID)
        ? String(accResult[0].nAccID)
        : "0";
    }
    if (table === "mstCODES") {
      const codeQuery = `
        SELECT "nCodesID"
        FROM "mstCODES"
        WHERE "vCode" = $1
        LIMIT 1
      `;
      const codeResult = await BaseModel.executeQuery(codeQuery, [code]);
      return (codeResult && codeResult.length > 0 && codeResult[0].nCodesID)
        ? String(codeResult[0].nCodesID)
        : "0";
    }
    // Default: try AccountsProfile, then mstCODES
    const accQuery = `
      SELECT "nAccID"
      FROM "AccountsProfile"
      WHERE "vCode" = $1
      LIMIT 1
    `;
    const accResult = await BaseModel.executeQuery(accQuery, [code]);
    if (accResult && accResult.length > 0 && accResult[0].nAccID) {
      return String(accResult[0].nAccID);
    }
    const codeQuery = `
      SELECT "nCodesID"
      FROM "mstCODES"
      WHERE "vCode" = $1
      LIMIT 1
    `;
    const codeResult = await BaseModel.executeQuery(codeQuery, [code]);
    return (codeResult && codeResult.length > 0 && codeResult[0].nCodesID)
      ? String(codeResult[0].nCodesID)
      : "0";
  } catch (err) {
    console.error(`Error fetching ID for code ${code}:`, err);
    return "0";
  }
}

  /**
   * Get a numeric setting value
   * @param {string} dataCode - The setting code to retrieve
   * @param {number} branchId - The branch ID
   * @param {number} defaultValue - Default value if setting not found or not a number
   * @returns {Promise<number>} - The numeric setting value
   */
  static async getNumericSetting(dataCode, branchId = 0, defaultValue = 0) {
    const value = await this.getSetting(dataCode, branchId, defaultValue.toString());
    const numValue = parseFloat(value);
    return isNaN(numValue) ? defaultValue : numValue;
  }

  /**
   * Get the tax account code for a specific tax type
   * @param {string} taxCode - The tax code (e.g., TDS, GST)
   * @param {number} branchId - The branch ID
   * @returns {Promise<string>} - The tax account code
   */
  static async getTaxAccountCode(taxCode, branchId = 0) {
    try {
      if (!taxCode) return null;
      
      // First try to get the tax account ID from mstTax table
      try {
        const taxQuery = `
          SELECT "nAccID" 
          FROM "mstTax" 
          WHERE "CODE" = $1
          LIMIT 1
        `;
        
        const taxResult = await BaseModel.executeQuery(taxQuery, [taxCode]);
        
        if (taxResult && taxResult.length > 0 && taxResult[0].nAccID) {
          // Now get the account code from AccountsProfile using nAccID
          const accountQuery = `
            SELECT "vCode" 
            FROM "AccountsProfile" 
            WHERE "nAccID" = $1
            LIMIT 1
          `;
          
          const accountResult = await BaseModel.executeQuery(accountQuery, [taxResult[0].nAccID]);
          
          if (accountResult && accountResult.length > 0 && accountResult[0].vCode) {
            return accountResult[0].vCode;
          }
        }
      } catch (error) {
        console.log("Error fetching from mstTax or AccountsProfile:", error);
        // Continue to fallback methods
      }
      
      // If not found in mstTax, try the mapping and settings
      // Map common tax codes to their setting codes
      const taxSettingMap = {
        "TDS": "TDSPAYAC",
        "CGST": "CGSTAC",
        "SGST": "SGSTAC",
        "IGST": "IGSTAC",
        "TCS": "TCSAC",
        "HFEEIGST": "HFEEIGST"
      };
      
      const settingCode = taxSettingMap[taxCode] || taxCode;
      return await this.getSetting(settingCode, branchId, taxCode);
    } catch (error) {
      console.error(`Error fetching tax account code for ${taxCode}:`, error);
      return taxCode; // Return the tax code itself as fallback
    }
  }
  
  /**
   * Get account code from AccountsProfile table by ID
   * @param {number|string} accountId - The account ID to look up
   * @returns {Promise<Object>} - The account details including code
   */
  static async getAccountById(accountId) {
    try {
      if (!accountId) return { vCode: "", vName: "" };
      
      const query = `
        SELECT "vCode", "vName" 
        FROM "AccountsProfile" 
        WHERE "nAccID" = $1 AND "bIsDeleted" = false
        LIMIT 1
      `;
      
      const result = await BaseModel.executeQuery(query, [accountId]);
      
      if (result && result.length > 0) {
        return result[0];
      }
      
      return { vCode: "", vName: "" };
    } catch (error) {
      console.error(`Error getting account by ID ${accountId}:`, error);
      return { vCode: "", vName: "" };
    }
  }
  
  /**
   * Get product details by product code
   * @param {string} productCode - The product code (e.g., CN, DD, TC)
   * @returns {Promise<Object>} - The product details including account codes
   */
  static async getProductDetails(productCode) {
    try {
      if (!productCode) return null;
      
      // First try to get from MProductM table if it exists
      try {
        const query = `
          SELECT * 
          FROM "mProductM" 
          WHERE "PRODUCTCODE" = $1
          LIMIT 1
        `;
        
        const result = await BaseModel.executeQuery(query, [productCode]);
        
        if (result && result.length > 0) {
          return result[0];
        }
      } catch (error) {
        // Table might not exist, try alternative
        console.log("MProductM table not found, trying alternative...");
      }
      
      // If MProductM doesn't exist or product not found, try to get from settings
      const defaultCodes = {
        vPurchaseAccountCode: await this.getSetting(`${productCode}_PURCHASE_AC`, 0, `PUR${productCode}`),
        vSaleAccountCode: await this.getSetting(`${productCode}_SALE_AC`, 0, `SAL${productCode}`),
        vProfitAccountCode: await this.getSetting(`${productCode}_PROFIT_AC`, 0, `PRO${productCode}`),
        vBulkPurchaseAccountCode: await this.getSetting(`${productCode}_BULK_PURCHASE_AC`, 0, `PURB${productCode}`),
        vBulkSaleAccountCode: await this.getSetting(`${productCode}_BULK_SALE_AC`, 0, `SALB${productCode}`),
        vBulkProfitAccountCode: await this.getSetting(`${productCode}_BULK_PROFIT_AC`, 0, `PROB${productCode}`),
        vIssuerAccountCode: await this.getSetting(`${productCode}_ISSUER_AC`, 0, `ISS${productCode}`),
        vClosingAccountCode: await this.getSetting(`${productCode}_CLOSING_AC`, 0, `CLO${productCode}`),
        isSettlement: await this.isSettingEnabled(`${productCode}_IS_SETTLEMENT`, 0)
      };
      
      return defaultCodes;
    } catch (error) {
      console.error(`Error getting product details for ${productCode}:`, error);
      return {
        vPurchaseAccountCode: `PUR${productCode}`,
        vSaleAccountCode: `SAL${productCode}`,
        vProfitAccountCode: `PRO${productCode}`,
        vBulkPurchaseAccountCode: `PURB${productCode}`,
        vBulkSaleAccountCode: `SALB${productCode}`,
        vBulkProfitAccountCode: `PROB${productCode}`,
        vIssuerAccountCode: `ISS${productCode}`,
        vClosingAccountCode: `CLO${productCode}`,
        isSettlement: false
      };
    }
  }


   /**
   * Get account code from AccountsProfile table by ID
   * @param {number|string} partyID - The account ID to look up
   * @returns {Promise<Object>} - The Party vCode
   */
   static async getPartyCodeById(partyID) {
    try {
      if (!partyID) return { vCode: "" };
      
      const query = `
        SELECT "vCode" 
        FROM "mstCODES"
        WHERE "nCodesID" = $1 AND "bActive" = true
        LIMIT 1
      `;
      
      const result = await BaseModel.executeQuery(query, [partyID]);
      
      if (result && result.length > 0) {
        return result[0];
      }
      
      return { vCode: "" };
    } catch (error) {
      console.error(`Error getting Party Code by ID ${partyID}:`, error);
      return { vCode: "" };
    }
  }
}

module.exports = AdvancedSettingsUtil;
