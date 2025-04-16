const { BaseModel, DatabaseError } = require("../../../base/BaseModel");

class CurrencyOpeningBalanceModel extends BaseModel {

  static async getCounters(branch){
    try {
      const query = `SELECT * FROM "mstBranchCounterLink" WHERE "vBranchCode" = $1 ORDER BY "nCounterID"`;
      const result = await this.executeQuery(query, [branch.vBranchCode]);
      return result.map(row => ({
        value: row.nCounterID.toString(),
        label: row.nCounterID.toString()
      }));
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch counters", error);
      }
      throw error;
    }
  }

  static async getAllCurrencies() {
    try {
      const query = `SELECT "vCncode", "vCnName" FROM "mCurrency" WHERE "bIsDeleted" = false ORDER BY "nCurrencyID"`;
      const result = await this.executeQuery(query);
      return result.map(row => ({
        value: row.vCncode,
        label: row.vCnName
      }));
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch currencies", error);
      }
      throw error;
    }
  }

  static async getAllProducts() {
    try {
      const query = `SELECT * FROM "mProductM" WHERE "bIsDeleted" = false`;
      const result = await this.executeQuery(query);
      return result.map(row => ({
        value: row.PRODUCTCODE,
        label: row.DESCRIPTION
      }));
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch products", error);
      }
      throw error;
    }
  }
  
  // Get all currency opening balances with pagination
  static async getAllCurrencyOpeningBalances(page = 1, pageSize = 10, searchTerm = "") {
    try {
      // Build the search condition if searchTerm is provided
      let searchCondition = "";
      let params = [];
      
      if (searchTerm) {
        searchCondition = `
          AND (
            counter ILIKE $1 OR
            cncode ILIKE $1 OR
            exchtype ILIKE $1 OR
            "vBranchCode" ILIKE $1
          )
        `;
        params.push(`%${searchTerm}%`);
      }

      // Get all data for MainFormComponent compatibility
      const dataQuery = `
        SELECT *
        FROM curropn
        WHERE 1=1 ${searchCondition}
        ORDER BY curropnid DESC
      `;
      
      const data = await this.executeQuery(dataQuery, params);
      
      // Return data in a format that MainFormComponent can directly use
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch currency opening balances", error);
      }
      throw error;
    }
  }

  // Get currency opening balance by ID
  static async getCurrencyOpeningBalanceById(curropnid) {
    try {
      const query = `
        SELECT * FROM curropn 
        WHERE curropnid = $1
      `;
      
      const result = await this.executeQuery(query, [curropnid]);
      return result[0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch currency opening balance by ID", error);
      }
      throw error;
    }
  }

  // Create new currency opening balance
  static async createCurrencyOpeningBalance(data) {
    try {
      const insertCurrOpnQuery = `
        INSERT INTO curropn (
          counter, cncode, exchtype, isscode, date, series, series_, transit,
          "FESETTLED", "IBRRATE", feamount, amount, no_from, no_to,
          denominat, brate, "nBranchID", "vBranchCode"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;

      const params = [
        data.counter,
        data.cncode,
        data.exchtype,
        data.isscode || null,
        data.date || new Date(),
        data.series || null,
        data.series_ || false,
        data.transit || false,
        data.FESETTLED || 0,
        data.IBRRATE || 0,
        data.feamount,
        data.amount,
        data.no_from || null,
        data.no_to || null,
        data.denominat || 0,
        data.brate || 0,
        data.nBranchID || null,
        data.vBranchCode
      ];

      // Insert into balcntc table with opening balance
      const insertBalcntcQuery = `
        INSERT INTO balcntc (
          date, counter, "shiftID", cncode, isscode, exchtype, 
          opbal, opbalrs, clbal, clbalrs, 
          "nBranchID", "vBranchCode"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      // For balcntc, we set the opening balance and closing balance to the same value initially
      const balcntcParams = [
        data.date || new Date(),
        data.counter,
        data.shiftID || 1,  // Default to shift 1 if not provided
        data.cncode,
        data.isscode || null,
        data.exchtype,
        data.feamount,  // Opening balance in foreign currency
        data.amount,    // Opening balance in INR
        data.feamount,  // Closing balance starts same as opening balance
        data.amount,    // Closing balance in INR starts same as opening balance
        data.nBranchID || null,
        data.vBranchCode
      ];

      // Execute both queries in a single transaction
      const result = await this.executeTransactionQuery([
        { query: insertCurrOpnQuery, params },
        { query: insertBalcntcQuery, params: balcntcParams }
      ]);
      
      // Return both results
      return {
        currencyOpeningBalance: result[0][0],
        balanceEntry: result[1][0]
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to create currency opening balance", error);
      }
      throw error;
    }
  }

  // Update currency opening balance
  static async updateCurrencyOpeningBalance(data) {
    try {
      const updateQuery = `
        UPDATE curropn
        SET 
          counter = $2,
          cncode = $3,
          exchtype = $4,
          isscode = $5,
          date = $6,
          series = $7,
          series_ = $8,
          transit = $9,
          "FESETTLED" = $10,
          "IBRRATE" = $11,
          feamount = $12,
          amount = $13,
          no_from = $14,
          no_to = $15,
          denominat = $16,
          brate = $17,
          "nBranchID" = $18,
          "vBranchCode" = $19
        WHERE curropnid = $1
        RETURNING *
      `;

      const params = [
        data.curropnid,
        data.counter,
        data.cncode,
        data.exchtype,
        data.isscode || null,
        data.date,
        data.series || null,
        data.series_ || false,
        data.transit || false,
        data.FESETTLED || 0,
        data.IBRRATE || 0,
        data.feamount,
        data.amount,
        data.no_from || null,
        data.no_to || null,
        data.denominat || 0,
        data.brate || 0,
        data.nBranchID || null,
        data.vBranchCode
      ];

      const result = await this.executeTransactionQuery([
        { query: updateQuery, params }
      ]);
      
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update currency opening balance", error);
      }
      throw error;
    }
  }

  // Delete currency opening balance
  static async deleteCurrencyOpeningBalance(curropnid) {
    try {
      const deleteQuery = `
        DELETE FROM curropn
        WHERE curropnid = $1
        RETURNING *
      `;

      const result = await this.executeTransactionQuery([
        { query: deleteQuery, params: [curropnid] }
      ]);
      
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to delete currency opening balance", error);
      }
      throw error;
    }
  }

  // Bulk import currency opening balances from CSV
  static async bulkImportCurrencyOpeningBalances(records) {
    try {
      // Use a transaction to ensure all records are inserted or none
      return await this.executeTransactionQuery(async (client) => {
        const results = [];

        // Extract all unique currency codes for validation
        const uniqueCurrencyCodes = [...new Set(records.map(record => record.cncode))];
        
        // Validate that each currency code exists before proceeding
        const validationQuery = `
          SELECT "vCncode" 
          FROM "mCurrency" 
          WHERE "vCncode" IN (${uniqueCurrencyCodes.map((_, idx) => `$${idx + 1}`).join(',')})
          AND "bIsDeleted" = false
        `;
        
        const validCurrencies = await client.query(validationQuery, uniqueCurrencyCodes);
        const validCurrencyCodes = validCurrencies.rows.map(row => row.vCncode);
        
        // Find invalid currency codes
        const invalidCurrencyCodes = uniqueCurrencyCodes.filter(
          code => !validCurrencyCodes.includes(code)
        );
        
        // Check if any currency codes are invalid
        if (invalidCurrencyCodes.length > 0) {
          throw new DatabaseError(`Invalid currency codes: ${invalidCurrencyCodes.join(', ')}`);
        }

        // Delete all existing records from both tables
        // First delete from curropn table
        const deleteCurrOpnQuery = `DELETE FROM curropn`;
        await client.query(deleteCurrOpnQuery);
        
        // Then delete from balcntc table
        const deleteBalcntcQuery = `DELETE FROM balcntc`;
        await client.query(deleteBalcntcQuery);
        
        // Now insert the new records
        for (const record of records) {
          // Insert into curropn table
          const insertCurrOpnQuery = `
            INSERT INTO curropn (
              counter, cncode, exchtype, isscode, date, series, series_, transit,
              "FESETTLED", "IBRRATE", feamount, amount, no_from, no_to,
              denominat, brate, "nBranchID", "vBranchCode"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
          `;

          const params = [
            record.counter,
            record.cncode,
            record.exchtype,
            record.isscode || null,
            record.date || new Date(),
            record.series || null,
            record.series_ || false,
            record.transit || false,
            record.FESETTLED || 0,
            record.IBRRATE || 0,
            record.feamount,
            record.amount,
            record.no_from || null,
            record.no_to || null,
            record.denominat || 0,
            record.brate || 0,
            record.nBranchID || null,
            record.vBranchCode
          ];

          const currOpnResult = await client.query(insertCurrOpnQuery, params);
          
          // Insert into balcntc table with opening balance
          const insertBalcntcQuery = `
            INSERT INTO balcntc (
              date, counter, "shiftID", cncode, isscode, exchtype, 
              opbal, opbalrs, clbal, clbalrs, 
              "nBranchID", "vBranchCode"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
          `;
          
          const balcntcParams = [
            record.date || new Date(),
            record.counter,
            1, // Default shift ID
            record.cncode,
            record.isscode || null,
            record.exchtype,
            record.feamount,
            record.amount,
            record.feamount, // closing balance same as opening for new entries
            record.amount,   // closing balance in RS same as opening for new entries
            record.nBranchID || null,
            record.vBranchCode
          ];
          
          const balcntcResult = await client.query(insertBalcntcQuery, balcntcParams);
          
          results.push({
            curropn: currOpnResult.rows[0],
            balcntc: balcntcResult.rows[0]
          });
        }
        
        return {
          success: true,
          count: results.length,
          results
        };
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to bulk import currency opening balances", error);
      }
      throw error;
    }
  }
}

module.exports = CurrencyOpeningBalanceModel;
