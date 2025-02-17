const { BaseModel, DatabaseError } = require("../../base/BaseModel");

class TransactionModel extends BaseModel {
  // Get transactions based on type and filters
  static async getTransactions({
    vTrnwith,
    vTrntype,
    fromDate,
    toDate,
    branchId,
    ...filters
  }) {
    try {
      const query = `
        SELECT t.*, 
               COALESCE(p."vPaxname", '') as "PartyName",
               COALESCE(mp."Description", '') as "PurposeDescription",
               COALESCE(sp."SubDescription", '') as "SubPurposeDescription"
        FROM "Transact" t
        LEFT JOIN "mstpax" p ON t."PaxCode" = p."nPaxcode"
        LEFT JOIN "MstPurpose" mp ON NULLIF(t."Purpose", '')::INTEGER = mp."nPurposeID"
        LEFT JOIN "SubPurpose" sp ON NULLIF(t."SubPurpose", '')::INTEGER = sp."SubPurposeID"
        WHERE t."vTrnwith" = $1
        AND t."vTrntype" = $2
        AND t."vNo" <> ''
        AND t."vNo" IS NOT NULL
        AND (t."bIsDeleted" = false OR t."bIsDeleted" IS NULL)
        AND t."date" BETWEEN $3 AND $4
        AND t."nBranchID" = $5
        ORDER BY t."date" DESC, t."vNo" DESC
      `;

      const values = [vTrnwith, vTrntype, fromDate, toDate, branchId];
      return await this.executeQuery(query, values);
    } catch (error) {
      throw new DatabaseError("Failed to fetch transactions", error);
    }
  }

  // Get next transaction number
  static async getNextTransactionNumber(vTrnwith, vTrntype) {
    try {
      const query = `
        SELECT COALESCE(MAX(CAST("vNo" AS INTEGER)), 0) + 1 as "nextNo"
        FROM "Transact"
        WHERE "vTrnwith" = $1 AND "vTrntype" = $2
      `;
      const result = await this.executeQuery(query, [vTrnwith, vTrntype]);
      return result[0]?.nextNo || 1;
    } catch (error) {
      throw new DatabaseError("Failed to get next transaction number", error);
    }
  }

  // Validate transaction before save
  static async validateTransaction(data) {
    try {
      // Basic validation checks
      const validations = [];

      // Check if party exists
      if (data.PartyID) {
        const partyQuery = `
          SELECT "PartyID" FROM "PartyMaster"
          WHERE "PartyID" = $1 AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        `;
        const partyResult = await this.executeQuery(partyQuery, [data.PartyID]);
        if (!partyResult.length) {
          validations.push("Invalid Party selected");
        }
      }

      // Check if Purpose and SubPurpose exist and are valid
      if (data.Purpose) {
        const purposeQuery = `
          SELECT "nPurposeID" FROM "MstPurpose"
          WHERE "nPurposeID" = $1 AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        `;
        const purposeResult = await this.executeQuery(purposeQuery, [
          data.Purpose,
        ]);
        if (!purposeResult.length) {
          validations.push("Invalid Purpose selected");
        }
      }

      if (data.SubPurpose) {
        const subPurposeQuery = `
          SELECT "SubPurposeID" FROM "SubPurpose"
          WHERE "SubPurposeID" = $1 AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        `;
        const subPurposeResult = await this.executeQuery(subPurposeQuery, [
          data.SubPurpose,
        ]);
        if (!subPurposeResult.length) {
          validations.push("Invalid Sub Purpose selected");
        }
      }

      // Amount validations
      const amount = parseFloat(data.Amount) || 0;
      const netamt = parseFloat(data.Netamt) || 0;
      const byCash = parseFloat(data.byCash) || 0;
      const byChq = parseFloat(data.byChq) || 0;
      const byCard = parseFloat(data.byCard) || 0;
      const byTransfer = parseFloat(data.byTransfer) || 0;
      const byOth = parseFloat(data.byOth) || 0;

      // Check if payment methods sum up to net amount
      const totalPayment = byCash + byChq + byCard + byTransfer + byOth;
      if (Math.abs(totalPayment - netamt) > 0.01) {
        validations.push("Total payment methods do not match net amount");
      }

      return {
        isValid: validations.length === 0,
        errors: validations,
      };
    } catch (error) {
      throw new DatabaseError("Failed to validate transaction", error);
    }
  }

  // Create new transaction
  static async createTransaction(data) {
    try {
      // First validate the transaction
      const validation = await this.validateTransaction(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Get next transaction number
      const nextNo = await this.getNextTransactionNumber(
        data.vTrnwith,
        data.vTrntype
      );

      const query = `
        INSERT INTO "Transact" (
          "vTrnwith", "vTrntype", "vNo", "date", "counterID", "ShiftID",
          "Purpose", "SubPurpose", "PartyType", "PartyID", "Amount", "TaxAmt",
          "Netamt", "byCash", "byChq", "byCard", "byTransfer", "byOth",
          "userID", "tdate", "bIsDeleted"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, false
        ) RETURNING *
      `;

      const values = [
        data.vTrnwith,
        data.vTrntype,
        nextNo,
        data.date,
        data.counterID,
        data.ShiftID,
        data.Purpose,
        data.SubPurpose,
        data.PartyType,
        data.PartyID,
        data.Amount,
        data.TaxAmt,
        data.Netamt,
        data.byCash,
        data.byChq,
        data.byCard,
        data.byTransfer,
        data.byOth,
        data.userID,
      ];

      return await this.executeQuery(query, values);
    } catch (error) {
      throw new DatabaseError("Failed to create transaction", error);
    }
  }

  static async getPurposeOptions(vTrnWith, vTrnType, TrnSubType) {
    try {
      const query = `
        SELECT "nPurposeID" as value, "Description" as label 
        FROM "MstPurpose"
        WHERE "vTrnWith" = $1
          AND "vTrnType" = $2
          AND "TrnSubType" = $3
          AND "isActive" = true 
          AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        ORDER BY "Description"
      `;
      const result = await this.executeQuery(query, [
        vTrnWith,
        vTrnType,
        TrnSubType,
      ]);
      return result;
    } catch (error) {
      throw new DatabaseError("Failed to get purpose options", error);
    }
  }

  static async getCategoryOptions() {
    try {
      const query = `
        SELECT "DATAVALUE" AS value, "DATADISPLAY" AS label 
        FROM "advsettings" 
        WHERE "DATACODE" = 'FCMCatagory'
      `;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      throw new DatabaseError("Failed to get category options", error);
    }
  }

  // Get Party Type Options
  static async getPartyTypeOptions() {
    try {
      const query = `SELECT "nCodesID" AS "value", "vName" AS "label" FROM "mstCODES" WHERE "bIsDeleted" = false AND "bIND" = true AND "bActive" = true`;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get Party Type Options based on Entity Type
  static async getPartyTypeOptions(entityType) {
    try {
      const query = `
        SELECT 
          "nCodesID" as value,
          "vName" as label,
          "vCode"
        FROM "mstCODES" 
        WHERE "bIND" = $1 
        AND "vType" = 'CC' 
        AND "bIsDeleted" = false 
        AND "bActive" = true
        ORDER BY "vName"
      `;
      const result = await this.executeQuery(query, [entityType === "I"]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get Nationality Options
  static async getNationalityOptions() {
    try {
      const query = `select "vCode" as "value", "vDescription" as "label" from "MMASTERS" where "vType" = 'CTRY'`;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get City Options
  static async getCityOptions() {
    try {
      const query = `SELECT "vDescription" as value, "vDescription" as label FROM "MMASTERS" WHERE "vType" = 'CT'`;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get State Options
  static async getStateOptions() {
    try {
      const query = `SELECT "vCode" as value, "vDescription" as label FROM "MMASTERS" WHERE "vType" = 'ST'`;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get Country Options
  static async getCountryOptions() {
    try {
      const query = `select "vCode" as "value", "vDescription" as "label" from "MMASTERS" where "vType" = 'CTRY'`;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get ID Type Options
  static async getIDTypeOptions() {
    try {
      const query = `SELECT "vCode" as value, "vDescription" as label FROM "MMASTERS" WHERE "vType" = 'ID'`;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get All PAX List
  static async getPaxList(partyType = null) {
    try {
      let query = `
        SELECT *
        FROM "mstpax"
        WHERE "bIsdeleted" = false
        AND "vPaxname" != ''
      `;

      const params = [];

      if (partyType) {
        query += ` AND "vCodeID" = $1`;
        params.push(partyType);
      }

      query += ` ORDER BY "vPaxname"`;

      const result = await this.executeQuery(query, params);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get PAX Details by Code
  static async getPaxDetails(paxCode) {
    try {
      const query = `
        SELECT *
        FROM "mstpax"
        WHERE "nPaxcode" = $1
        AND "bIsdeleted" = false
      `;
      const result = await this.executeQuery(query, [paxCode]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Check if PAX Name exists
  static async checkPaxNameExists(paxName, excludePaxCode = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM "mstpax"
        WHERE LOWER("vPaxname") = LOWER($1)
        AND "bIsdeleted" = false
      `;
      const params = [paxName];

      if (excludePaxCode) {
        query += ` AND "nPaxcode" != $2`;
        params.push(excludePaxCode);
      }

      const result = await this.executeQuery(query, params);
      return result[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Save PAX Details
  static async savePaxDetails(paxDetails, userId) {
    try {
      if (paxDetails.nPaxcode) {
        // Update existing PAX
        const updateQuery = `
          UPDATE "mstpax"
          SET
            "vPaxname" = $1,
            "vEmail" = $2,
            "vPan" = $3,
            "vPanHolderName" = $4,
            "dDOB" = $5,
            "vPhoneno" = $6,
            "vNation" = $7,
            "vDesig" = $8,
            "vPost" = $9,
            "vBldgFlat" = $10,
            "vStreetName" = $11,
            "vLocation" = $12,
            "vCity" = $13,
            "vState" = $14,
            "vCountry" = $15,
            "vRelationWithPanHolder" = $16,
            "UIN" = $17,
            "vPaidByPan" = $18,
            "vPaidByName" = $19,
            "bTourOperator" = $20,
            "bIsroprietorShip" = $21,
            "GSTIN" = $22,
            "vGSTSTATE" = $23,
            "vPassport" = $24,
            "dIssuedon" = $25,
            "dExpdt" = $26,
            "vIDREF1" = $27,
            "vIDREF1NO" = $28,
            "dIDREF1EXPDT" = $29,
            "dUpdateDate" = CURRENT_TIMESTAMP,
            "nUpdateBy" = $30,
            "vCodeID" = $31,
            "dBdate" = $33,
            "vCellno" = $6,
            "vAddress" = $34,
            "vIssuedat" = $35
          WHERE "nPaxcode" = $32
          AND "bIsdeleted" = false
          RETURNING "nPaxcode","vPaxname"
        `;

        const result = await this.executeQuery(updateQuery, [
          paxDetails.vPaxname,
          paxDetails.vEmail,
          paxDetails.vPan,
          paxDetails.vPanHolderName,
          paxDetails.dDOB,
          paxDetails.vPhoneno,
          paxDetails.vNation,
          paxDetails.vDesig,
          paxDetails.vPost,
          paxDetails.vBldgFlat,
          paxDetails.vStreetName,
          paxDetails.vLocation,
          paxDetails.vCity,
          paxDetails.vState,
          paxDetails.vCountry,
          paxDetails.vRelationWithPanHolder,
          paxDetails.UIN,
          paxDetails.vPaidByPan,
          paxDetails.vPaidByName,
          paxDetails.bTourOperator,
          paxDetails.bIsroprietorShip,
          paxDetails.GSTIN,
          paxDetails.vGSTSTATE,
          paxDetails.vPassport,
          paxDetails.dIssuedon,
          paxDetails.dExpdt,
          paxDetails.vIDREF1,
          paxDetails.vIDREF1NO,
          paxDetails.dIDREF1EXPDT,
          userId,
          paxDetails.vCodeID,
          paxDetails.nPaxcode,
          paxDetails.dBdate,
          paxDetails.vAddress,
          paxDetails.vIssuedat,
        ]);

        return result[0];
      } else {
        // Get the next PAX ID and code
        const getLastIdsQuery = `
          SELECT 
            COALESCE(MAX("NPAXID"), 0) + 1 as next_id,
            COALESCE(MAX("nPaxcode"), 0) + 1 as next_code
          FROM "mstpax"
        `;
        const idsResult = await this.executeQuery(getLastIdsQuery);
        const newPaxId = idsResult[0].next_id;
        const newPaxCode = idsResult[0].next_code;

        // Insert new PAX
        const insertQuery = `
          INSERT INTO "mstpax" (
            "NPAXID", "nPaxcode", "vPaxname", "vEmail", "vPan", "vPanHolderName",
            "dDOB", "vPhoneno", "vNation", "vDesig", "vPost",
            "vBldgFlat", "vStreetName", "vLocation", "vCity", "vState",
            "vCountry", "vRelationWithPanHolder", "UIN", "vPaidByPan", "vPaidByName",
            "bTourOperator", "bIsroprietorShip", "GSTIN", "vGSTSTATE",
            "vPassport", "dIssuedon", "dExpdt",
            "vIDREF1", "vIDREF1NO", "dIDREF1EXPDT",
            "dCreationDate", "nCreatedBy", "bIsdeleted", "vCodeID", "dBdate", "vCellno",
            "vAddress","vIssuedat"
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, CURRENT_TIMESTAMP, $32, false, $33, $34, $8,
            $35, $36
          )
          RETURNING "nPaxcode","vPaxname"
        `;

        const result = await this.executeQuery(insertQuery, [
          newPaxId,
          newPaxCode,
          paxDetails.vPaxname,
          paxDetails.vEmail,
          paxDetails.vPan,
          paxDetails.vPanHolderName,
          paxDetails.dDOB,
          paxDetails.vPhoneno,
          paxDetails.vNation,
          paxDetails.vDesig,
          paxDetails.vPost,
          paxDetails.vBldgFlat,
          paxDetails.vStreetName,
          paxDetails.vLocation,
          paxDetails.vCity,
          paxDetails.vState,
          paxDetails.vCountry,
          paxDetails.vRelationWithPanHolder,
          paxDetails.UIN,
          paxDetails.vPaidByPan,
          paxDetails.vPaidByName,
          paxDetails.bTourOperator,
          paxDetails.bIsroprietorShip,
          paxDetails.GSTIN,
          paxDetails.vGSTSTATE,
          paxDetails.vPassport,
          paxDetails.dIssuedon,
          paxDetails.dExpdt,
          paxDetails.vIDREF1,
          paxDetails.vIDREF1NO,
          paxDetails.dIDREF1EXPDT,
          userId,
          paxDetails.vCodeID,
          paxDetails.dBdate,
          paxDetails.vAddress,
          paxDetails.vIssuedat,
        ]);

        return result[0];
      }
    } catch (error) {
      throw error;
    }
  }

  // Get Transaction Details by ID
  static async getTransactionById(transactionId) {
    try {
      const query = `
        SELECT t.*, 
          p."vPaxname" as "PartyName",
          c1."vName" as "PurposeDescription",
          c2."vName" as "SubPurposeDescription"
        FROM "trnHDR" t
        LEFT JOIN "mstpax" p ON p."nPaxcode" = t."PaxCode"
        LEFT JOIN "mstCODES" c1 ON c1."vCode" = t."Purpose"
        LEFT JOIN "mstCODES" c2 ON c2."vCode" = t."SubPurpose"
        WHERE t."nTrnID" = $1 AND t."bIsdeleted" = false
      `;
      const result = await this.executeQuery(query, [transactionId]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get agents for the branch
  static async getAgents(branchId) {
    try {
      const query = `
        SELECT * FROM "mstCODES" 
        WHERE "bIsForexagent" = true 
        AND "nBranchID" = $1 
        AND "bIsDeleted" = false 
        AND "bActive" = true 
        ORDER BY "vName"
      `;
      const result = await this.executeQuery(query, [branchId]);
      return result.map((item) => ({
        ...item,
        label: `${item.vCode}-${item.vName}`,
        value: item.nCodesID,
      }));
    } catch (error) {
      throw new DatabaseError("Failed to fetch agents", error);
    }
  }

  // Get marketing references for the branch
  static async getMarketingRefs(branchId) {
    try {
      const query = `
        SELECT * FROM "mstCODES" 
        WHERE "bIsMrktExecutive" = true 
        AND "nBranchID" = $1 
        AND "bIsDeleted" = false 
        AND "bActive" = true 
        ORDER BY "vName"
      `;
      const result = await this.executeQuery(query, [branchId]);
      return result.map((item) => ({
        ...item,
        label: item.vName,
        value: item.nCodesID,
      }));
    } catch (error) {
      throw new DatabaseError("Failed to fetch marketing references", error);
    }
  }

  // Get delivery persons for the branch
  static async getDeliveryPersons(branchId) {
    try {
      const query = `
        SELECT * FROM "mstCODES" 
        WHERE "bIsDeliveryPerson" = true 
        AND "nBranchID" = $1 
        AND "bIsDeleted" = false 
        AND "bActive" = true 
        ORDER BY "vName"
      `;
      const result = await this.executeQuery(query, [branchId]);
      return result.map((item) => ({
        ...item,
        label: `${item.vCode}-${item.vName}`,
        value: item.nCodesID,
      }));
    } catch (error) {
      throw new DatabaseError("Failed to fetch delivery persons", error);
    }
  }

  static async getCurrencies() {
    try {
      const query = `
         SELECT DISTINCT 
          "vCncode" as value,
          CONCAT("vCncode", ' - ', "vCnName") as label
        FROM "mCurrency" 
        WHERE "bIsDeleted" = false
		AND "bTradedCurrency" = false
        ORDER BY "vCncode"
      `;
      const result = await this.executeQuery(query);
      return result;
    } catch (error) {
      console.error("Error in getCurrencies:", error);
      throw error;
    }
  }

  static async getProductTypes(vTrnType) {
    try {
      const query = `
        SELECT "PRODUCTCODE" AS value, CONCAT("PRODUCTCODE", ' - ', "DESCRIPTION") AS label
FROM "mProductM"
WHERE 
  "bIsDeleted" = false
  AND (
        ($1 = 'B' AND "retailBuy" = true) OR
        ($1 = 'S' AND "retailSell" = true)
      )
ORDER BY "PRODUCTCODE" ASC
      `;
      const result = await this.executeQuery(query, [vTrnType]);
      return result;
    } catch (error) {
      console.error("Error in getProductTypes:", error);
      throw error;
    }
  }

  static async getIssuers(productType) {
    try {
      const query = `
        SELECT "vIssuerCode" AS value, "vIssuerCode" AS label 
        FROM "mProductIssuerLink" 
        WHERE "PRODUCTCODE" = $1 
        AND "bIsActive" = true 
        AND "vIssuerCode" NOTNULL
      `;
      const result = await this.executeQuery(query, [productType]);
      return result;
    } catch (error) {
      console.error("Error in getIssuers:", error);
      throw error;
    }
  }

  static async getRate(currencyCode) {
    try {
      const query = `
        SELECT 
          nBuyRate as rate,
          nMargin
        FROM mCurrencyRate 
        WHERE vCurrencyCode = $1 
        AND dDate = CURRENT_DATE
      `;
      const result = await this.executeQuery(query, [currencyCode]);

      if (result.rows.length === 0) {
        throw new Error("Rate not found for the selected currency");
      }

      const { rate, nMargin } = result.rows[0];
      const finalRate = rate + rate * (nMargin / 100);

      return { rate: finalRate };
    } catch (error) {
      console.error("Error in getRate:", error);
      throw error;
    }
  }

  static async getRateWithMargin(currencyCode, productType, branchId, issCode, trnType) {
    try {
      // Get base rate from APIrates
      const rateResult = await this.executeQuery(
        'SELECT "Rate" FROM "APIrates" WHERE "CnCode" = $1',
        [currencyCode]
      );

      if (!rateResult || rateResult.length === 0) {
        throw new Error(`No rate found for currency ${currencyCode}`);
      }

      const baseRate = Number(rateResult[0].Rate);

      // Get margin from MarginMaster
      const marginResult = await this.executeQuery(
        'SELECT * FROM "MarginMaster" WHERE "CurrencyCode" = $1 AND "PRODUCT" = $2 AND "nBranchID" = $3 AND "isscode" = $4',
        [currencyCode, productType, branchId, issCode || '']
      );

      if (!marginResult || marginResult.length === 0) {
        throw new Error(`No margin configuration found for currency ${currencyCode}`);
      }

      const margin = marginResult[0];
      
      // Apply margin based on transaction type and ensure it's a number
      const marginValue = Number(trnType === 'B' ? margin.BuyMargin : margin.SellMargin);
      
      // Calculate final rate by adding margin to base rate
      const finalRate = baseRate + marginValue;

      return {
        baseRate,
        marginValue,
        finalRate: Number(finalRate.toFixed(4))
      };

    } catch (error) {
      console.error('Error getting rate with margin:', error);
      throw error;
    }
  }

  static async updateExchangeRates() {
    try {
      const API_KEY = '29fb1e0ab32ce2068121d99f';
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/INR`);
      const data = await response.json();

      if (data.result === 'success') {
        const rates = data.conversion_rates;
        const values = [];
        
        // Convert rates to have each currency as base currency
        for (const [currencyCode, rateToINR] of Object.entries(rates)) {
          if (currencyCode === 'INR') continue;
          
          // Calculate rate as: 1 foreign currency = X INR
          const rateFromBase = 1 / rateToINR;
          
          values.push({
            currencyCode,
            rate: rateFromBase
          });
        }

        // Update rates in database using transaction
        await this.executeTransactionQuery(async (client) => {
          // Clear existing rates
          await client.query('DELETE FROM "APIrates"');
          
          // Insert new rates
          for (const {currencyCode, rate} of values) {
            await client.query(
              'INSERT INTO "APIrates" ("CnCode", "Rate") VALUES ($1, $2)',
              [currencyCode, rate]
            );
          }
        });
      }
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      throw error;
    
    }
  }

  // Get exchange data for a transaction
  static async getExchangeData(vNo, vTrnwith, vTrntype) {
    try {
      const query = `
        SELECT 
          "CNCodeID",
          "ExchType",
          "ISSCodeID",
          CAST("FEAmount" AS DECIMAL(18,5))::TEXT as "FEAmount",
          CAST("Rate" AS DECIMAL(18,6))::TEXT as "Rate",
          "Per",
          CAST("Amount" AS DECIMAL(18,2))::TEXT as "Amount",
          CAST("Round" AS DECIMAL(18,2))::TEXT as "Round",
          "CommType",
          CAST("CommRate" AS DECIMAL(18,2))::TEXT as "CommRate",
          CAST("CommAmt" AS DECIMAL(18,2))::TEXT as "CommAmt",
          "TDSRate",
          "TDSAmount",
          "HoldCost",
          "Profit",
          "ibrRate",
          "FWDID",
          "FWDSrno",
          "CancelLinkIDSrno",
          "bIsSettled",
          "nExchID"
        FROM "Exchange"
        WHERE "vNo" = $1
          AND "vTrnwith" = $2
          AND "vTrntype" = $3
        ORDER BY "sr_no"
      `;

      const result = await this.executeQuery(query, [vNo, vTrnwith, vTrntype]);
      return result;
    } catch (error) {
      throw new DatabaseError("Failed to fetch exchange data", error);
    }
  }

  // Get other charge accounts
  static async getOtherChargeAccounts() {
    try {
      const query = `
        SELECT * 
FROM "AccountsProfile" as ac 
INNER JOIN "OtherChargeAcc" as oa 
ON ac."vCode" = oa."OtherChargeAcc" 
WHERE "bDoPurchase" = true AND "vNature" = 'G' 
ORDER BY "vCode"
      `;

      const result = await this.executeQuery(query);
      return result.map(account => ({
        value: account.nAccID,
        label: `${account.vCode} - ${account.vName}`,
        code: account.vCode,
        name: account.vName,
        OtherChargeGST: account.OtherChargeGST
      }));
    } catch (error) {
      throw new DatabaseError("Failed to fetch other charge accounts", error);
    }
  }

  // Get tax data for transaction
  static async getTaxData(vTrntype) {
    try {
      // Get active taxes based on transaction type
      const taxQuery = `
        SELECT 
          "nTaxID", "CODE", "DESCRIPTION", "APPLYAS", "VALUE", 
          "SLABWISETAX", "RETAILBUYSIGN", "RETAILSELLSIGN"
        FROM "mstTax" 
        WHERE 
          "ISACTIVE" = true 
          AND CURRENT_TIMESTAMP BETWEEN "FROMDT" AND "TILLDT"
          AND (
            ($1 = 'B' AND "RETAILBUY" = true)
            OR
            ($1 = 'S' AND "RETAILSELL" = true)
          )
          AND "bIsDeleted" = false
        ORDER BY "CODE"
      `;
      const taxes = await this.executeQuery(taxQuery, [vTrntype]);

      // Get tax slabs for slab-wise taxes
      const slabWiseTaxIds = taxes
        .filter(tax => tax.SLABWISETAX)
        .map(tax => tax.nTaxID);

      let taxSlabs = {};
      if (slabWiseTaxIds.length > 0) {
        const slabQuery = `
          SELECT 
            "nTaxID", "nTaxIdD", "SRNO", "FROMAMT", "TOAMT", 
            "VALUE", "BASEVALUE"
          FROM "mstTaxd" 
          WHERE 
            "nTaxID" = ANY($1)
            AND "bIsDeleted" = false
          ORDER BY "nTaxID", "SRNO"
        `;
        const slabs = await this.executeQuery(slabQuery, [slabWiseTaxIds]);
        
        // Group slabs by tax ID
        taxSlabs = slabs.reduce((acc, slab) => {
          if (!acc[slab.nTaxID]) {
            acc[slab.nTaxID] = [];
          }
          acc[slab.nTaxID].push(slab);
          return acc;
        }, {});
      }

      return {
        taxes,
        taxSlabs
      };
    } catch (error) {
      throw new DatabaseError("Failed to fetch tax data", error);
    }
  }

  // Get payment codes for transaction
  static async getPaymentCodes() {
    try {
      const query = `
        SELECT "vCode", "vName", "vNature", "vBankType", 
               "nCurrencyID", "nDivisionID", "vFinType", "vFinCode" 
        FROM "AccountsProfile" 
        WHERE "bDoPurchase" = true 
          AND "vNature" NOT IN ('P') 
          AND ("vCode" = 'ICICI' OR "vCode" = 'CASH')
      `;
      
      return await this.executeQuery(query);
    } catch (error) {
      throw new DatabaseError("Failed to fetch payment codes", error);
    }
  }

  // Add this method to TransactionModel class
  static async getChequeOptions(bankCode) {
    try {
      const query = `
        SELECT 
          Bd."BillDtlID", 
          Ap."vCode" AS Code, 
          Bk."RecType", 
          Bd."BillNo" AS "ChequeNo", 
          Bd."Issued"
        FROM "BookD" AS Bd
        INNER JOIN "BookH" AS Bk
          ON Bd."BillID" = Bk."BillID"
        INNER JOIN "AccountsProfile" AS Ap
          ON Bk."nAccID" = Ap."nAccID"
        WHERE Bd."isCancelled" = false 
          AND Bd."Issued" = false 
          AND Bk."bIsDeleted" = false 
          AND Ap."bIsDeleted" = false
          AND Ap."vCode" = $1
      `;
  
      return await this.executeQuery(query,[bankCode]);
    } catch (error) {
      console.error('Error in getChequeOptions:', error);
      throw error;
    }
  }
}

module.exports = TransactionModel;
