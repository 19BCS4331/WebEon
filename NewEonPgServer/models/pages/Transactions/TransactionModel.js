const { BaseModel, DatabaseError } = require("../../base/BaseModel");
//TODO : Fix the saveTrn function.
// TODO 1. Add correct validation for all fields.
// TODO 2. check for the problem with duplicate vNo and UniqID when creating new transaction

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
          paxDetails.nPaxcode,
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

  static async getRateWithMargin(
    currencyCode,
    productType,
    branchId,
    issCode,
    trnType
  ) {
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
        [currencyCode, productType, branchId, issCode || ""]
      );

      if (!marginResult || marginResult.length === 0) {
        throw new Error(
          `No margin configuration found for currency ${currencyCode}`
        );
      }

      const margin = marginResult[0];

      // Apply margin based on transaction type and ensure it's a number
      const marginValue = Number(
        trnType === "B" ? margin.BuyMargin : margin.SellMargin
      );

      // Calculate final rate by adding margin to base rate
      const finalRate = baseRate + marginValue;

      return {
        baseRate,
        marginValue,
        finalRate: Number(finalRate.toFixed(4)),
      };
    } catch (error) {
      console.error("Error getting rate with margin:", error);
      throw error;
    }
  }

  static async updateExchangeRates() {
    try {
      const API_KEY = "29fb1e0ab32ce2068121d99f";
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/INR`
      );
      const data = await response.json();

      if (data.result === "success") {
        const rates = data.conversion_rates;
        const values = [];

        // Convert rates to have each currency as base currency
        for (const [currencyCode, rateToINR] of Object.entries(rates)) {
          if (currencyCode === "INR") continue;

          // Calculate rate as: 1 foreign currency = X INR
          const rateFromBase = 1 / rateToINR;

          values.push({
            currencyCode,
            rate: rateFromBase,
          });
        }

        // Update rates in database using transaction
        await this.executeTransactionQuery(async (client) => {
          // Clear existing rates
          await client.query('DELETE FROM "APIrates"');

          // Insert new rates
          for (const { currencyCode, rate } of values) {
            await client.query(
              'INSERT INTO "APIrates" ("CnCode", "Rate") VALUES ($1, $2)',
              [currencyCode, rate]
            );
          }
        });
      }
    } catch (error) {
      console.error("Error updating exchange rates:", error);
      throw error;
    }
  }

  // Get exchange data for a transaction
  static async getExchangeData(vNo, vTrnwith, vTrntype) {
    try {
      // Get exchange data
      const exchangeQuery = `
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

      // Get charges data from FXTRANSOTHERCHARG
      const chargesQuery = `
        SELECT 
          "Id",
          "vNo",
          "vTrntype",
          "dSrno" as "srno",
          "account",
          CAST("Value" AS DECIMAL(18,2))::TEXT as "value",
         "operation",
          "vAccCodeCgst" as "cgstCode",
          CAST("dCgstAmount" AS DECIMAL(18,2))::TEXT as "cgstAmount",
          "vAccCodeSgst" as "sgstCode",
          CAST("dSgstAmount" AS DECIMAL(18,2))::TEXT as "sgstAmount",
          "vAccCodeIgst" as "igstCode",
          CAST("dIgstAmount" AS DECIMAL(18,2))::TEXT as "igstAmount"
        FROM "FXTRANSOTHERCHARG"
        WHERE "vNo" = $1
          AND "vTrntype" = $2
        ORDER BY "dSrno"
      `;

      // Get tax data from TaxT
      const taxQuery = `
        SELECT 
          "UniqID",
          "vTrnwith",
          "vTrntype",
          "vNo",
          "sAdded",
          "sTaxCode" as "code",
          "sApplyAs" as "applyAs",
          CAST("nTaxValue" AS DECIMAL(18,2))::TEXT as "taxValue",
          CAST("nTaxAmt" AS DECIMAL(18,2))::TEXT as "amount",
          "sACCode" as "accountCode",
          "STAXID" as "taxId",
          "SACCID" as "accountId"
        FROM "TaxT"
        WHERE "vNo" = $1
          AND "vTrnwith" = $2
          AND "vTrntype" = $3
      `;

      // Get rec/pay data from RECPAY
      const recPayQuery = `
        SELECT 
          "nRPID" as "id",
          "vTrnwith",
          "vTrntype",
          "vNo",
          "vRp" as "type",
          "vCb" as "mode",
          "vCode" as "code",
          CAST("nAmount" AS DECIMAL(18,2))::TEXT as "amount",
          "vChqno" as "chequeNo",
          "dChqdt" as "chequeDate",
          "vDrawnon" as "drawnOn",
          "vBranch" as "branch",
          "adate" as "accountDate",
          "vPayinno" as "payinNo"
        FROM "RECPAY"
        WHERE "vNo" = $1
          AND "vTrnwith" = $2
          AND "vTrntype" = $3
        ORDER BY "nRPID"
      `;

      try {
        // Execute queries in parallel with better error handling
        const [exchangeData, chargesData, taxData, recPayData] =
          await Promise.all([
            this.executeQuery(exchangeQuery, [vNo, vTrnwith, vTrntype]).catch(
              (err) => {
                console.error("Error fetching exchange data:", err);
                return [];
              }
            ),
            this.executeQuery(chargesQuery, [vNo, vTrntype]).catch((err) => {
              console.error("Error fetching charges data:", err);
              return [];
            }),
            this.executeQuery(taxQuery, [vNo, vTrnwith, vTrntype]).catch(
              (err) => {
                console.error("Error fetching tax data:", err);
                return [];
              }
            ),
            this.executeQuery(recPayQuery, [vNo, vTrnwith, vTrntype]).catch(
              (err) => {
                console.error("Error fetching recpay data:", err);
                return [];
              }
            ),
          ]);

        // Format charges data with null checks
        const formattedCharges = (chargesData || []).map((charge) => ({
          account: charge.account,
          srno: charge.srno,
          value: charge.value,
          operation: charge.operation,
          othSGST: charge.sgstAmount,
          othCGST: charge.cgstAmount,
          othIGST: charge.igstAmount,
        }));

        // Format tax data with null checks
        const formattedTaxes = Object.values(
          (taxData || []).reduce((acc, tax) => {
            if (!acc[tax.code]) {
              acc[tax.code] = {
                code: tax.code,
                applyAs: tax.applyAs,
                taxValue: tax.taxValue,
                amount: 0,
                components: [],
              };
            }
            // Ensure tax amount is always positive by using Math.abs
            const taxAmount = Math.abs(parseFloat(tax.amount || 0));
            acc[tax.code].amount += taxAmount;
            acc[tax.code].components.push({
              accountCode: tax.accountCode,
              amount: taxAmount.toFixed(2).toString(), // Store as string to match the original format
            });
            return acc;
          }, {})
        );

        // Format RecPay data with null checks
        const formattedRecPay = (recPayData || []).map((rp) => ({
          srno: rp.id,
          code: rp.code,
          amount: rp.amount,
          chequeNo: rp.chequeNo || "",
          chequeDate:
            rp.chequeDate && rp.chequeDate !== "NULL" ? rp.chequeDate : null,
          drawnOn: rp.drawnOn || "",
          branch: rp.branch || "",
          accountDate: rp.accountDate
            ? new Date(rp.accountDate).toISOString().split("T")[0]
            : null,
          type: rp.type,
          mode: rp.mode,
        }));

        // Calculate totals from the formatted data
        const ChargesTotalAmount = formattedCharges
          .reduce((total, charge) => {
            // Parse all values with fallbacks to 0 if parsing fails
            const baseValue = parseFloat(charge.value || 0) || 0;
            const sgstValue = parseFloat(charge.othSGST || 0) || 0;
            const cgstValue = parseFloat(charge.othCGST || 0) || 0;
            const igstValue = parseFloat(charge.othIGST || 0) || 0;
            
            // Calculate the total for this charge (base + GST values)
            const gstTotal = sgstValue + cgstValue + igstValue;
            const chargeTotal = baseValue + gstTotal;
            
            // Apply the operation (+ or -) to determine how it affects the total
            const signMultiplier = charge.operation === "-" ? -1 : 1;
            
            return total + (chargeTotal * signMultiplier);
          }, 0)
          .toFixed(2);

        const TaxTotalAmount = formattedTaxes
          .reduce((total, tax) => total + parseFloat(tax.amount || 0), 0)
          .toFixed(2);

        const RecPayTotalAmount = formattedRecPay
          .reduce((total, rp) => total + parseFloat(rp.amount || 0), 0)
          .toFixed(2);

        // Return combined data with calculated totals
        return {
          exchangeData: exchangeData || [],
          Charges: formattedCharges,
          Taxes: formattedTaxes,
          RecPay: formattedRecPay,
          ChargesTotalAmount: ChargesTotalAmount.toString(),
          TaxTotalAmount: TaxTotalAmount.toString(),
          RecPayTotalAmount: RecPayTotalAmount.toString(),
        };
      } catch (error) {
        console.error("Error in getExchangeData:", error);
        throw new DatabaseError("Failed to fetch transaction data", error);
      }
    } catch (error) {
      throw new DatabaseError("Failed to fetch transaction data", error);
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
      return result.map((account) => ({
        value: account.nAccID,
        label: `${account.vCode} - ${account.vName}`,
        code: account.vCode,
        name: account.vName,
        OtherChargeGST: account.OtherChargeGST,
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
        .filter((tax) => tax.SLABWISETAX)
        .map((tax) => tax.nTaxID);

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
        taxSlabs,
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

      return await this.executeQuery(query, [bankCode]);
    } catch (error) {
      console.error("Error in getChequeOptions:", error);
      throw error;
    }
  }

  // Save complete transaction with all related data
  static async saveTransaction(data) {
    try {
      return await this.executeTransactionQuery(async (client) => {
        console.log("\n=== Starting Transaction Save ===");
        console.log("Incoming Data:", JSON.stringify(data, null, 2));

        // Calculate other charges from data.Charges
        let otherCharges = {
          OthChgID1: "0",
          OthAmt1: 0,
          OthChgID2: "0",
          OthAmt2: 0,
          OthChgID3: "0",
          OthAmt3: 0,
          OthChgID4: "0",
          OthAmt4: 0,
          OthChgID5: "0",
          OthAmt5: 0,
        };

        // Ensure data.Charges is an array before processing
        if (Array.isArray(data.Charges) && data.Charges.length > 0) {
          data.Charges.forEach((charge, index) => {
            try {
              if (index < 5) {
                // We only have 5 other charge fields
                const fieldNum = index + 1;
                
                // Ensure charge is an object
                if (!charge || typeof charge !== "object") {
                  console.warn(`Invalid charge at index ${index}:`, charge);
                  return;
                }

                const chargeId = charge.account?.value || "0";

                // Safely parse all numeric values
                const gstAmount = [
                  parseFloat(charge.othCGST || 0),
                  parseFloat(charge.othSGST || 0),
                  parseFloat(charge.othIGST || 0)
                ].reduce((sum, val) => {
                  return sum + (isNaN(val) ? 0 : val);
                }, 0);

                const baseAmount = parseFloat(charge.value || 0);
                if (isNaN(baseAmount)) {
                  console.warn(`Invalid base amount for charge ${index}:`, charge.value);
                  return;
                }

                const totalAmount = gstAmount + baseAmount;

                // Apply operation (+ or -) to the total amount
                const finalAmount = charge.operation === "-" ? -totalAmount : totalAmount;

                otherCharges[`OthChgID${fieldNum}`] = chargeId;
                otherCharges[`OthAmt${fieldNum}`] = finalAmount;

                console.log(`Processed charge ${index + 1}:`, {
                  chargeId,
                  gstAmount,
                  baseAmount,
                  totalAmount,
                  finalAmount
                });
              }
            } catch (error) {
              console.error(`Error processing charge at index ${index}:`, error);
              // Continue processing other charges
            }
          });
        }

        // Calculate NetAmt
        const chargesTotal = Math.abs(parseFloat(data.ChargesTotalAmount || 0));
        const taxTotal = Math.abs(parseFloat(data.TaxTotalAmount || 0));
        const totalDeductions = chargesTotal + taxTotal;
        const netAmount = (parseFloat(data.Amount) || 0) - totalDeductions;

        // Calculate byCash and byChq from RecPay records
        let totalCash = 0;
        let totalCheque = 0;

        // Ensure data.RecPay is an array before processing
        if (Array.isArray(data.RecPay) && data.RecPay.length > 0) {
          data.RecPay.forEach((payment, index) => {
            try {
              // Ensure payment is a valid object
              if (!payment || typeof payment !== "object") {
                console.warn(`Invalid payment at index ${index}:`, payment);
                return;
              }

              const amount = parseFloat(payment.amount || 0);
              if (isNaN(amount)) {
                console.warn(`Invalid amount for payment ${index}:`, payment.amount);
                return;
              }

              if (payment.code === "CASH") {
                totalCash += amount;
              } else if (payment.chequeNo) {
                totalCheque += amount;
              }
              
              console.log(`Processed payment ${index + 1}:`, {
                code: payment.code,
                chequeNo: payment.chequeNo,
                amount,
                runningTotalCash: totalCash,
                runningTotalCheque: totalCheque,
              });
            } catch (error) {
              console.error(`Error processing payment at index ${index}:`, error);
              // Continue processing other payments
            }
          });
        }

        console.log("Final payment totals:", { totalCash, totalCheque });

        // 1. Insert main transaction
        const transactionQuery = `
          INSERT INTO "Transact" (
            "UniqID", "vTrnwith", "vTrntype", "vNo", "date",
            "counterID", "ShiftID", "Purpose", "SubPurpose", "PartyType",
            "PartyID", "PersonRef", "PaxCode", "SenderBRNID", "SenderUniqID",
            "SenderNo", "senderTxnDate", "notMyTxn", "EEFCSale", "EEFCAsOS",
            "EEFCSettled", "EEFCSettledWithBrnID", "Amount", "OthChgID1", "OthAmt1",
            "OthChgID2", "OthAmt2", "OthAmtMore", "TaxAmt", "round",
            "Netamt", "CancTaxAmt", "agentCode", "agentCommCN", "agentCommOth",
            "TDSRate", "TDSAmount", "byCash", "byChq", "byCard",
            "byTransfer", "byOth", "ManualBillRef", "WebDealRef", "MRKTREF",
            "OthRef", "OnBehalfClient", "settFromDate", "settTillDate", "NoOfPrints",
            "ExchReleased", "usdIBR", "userID", "tdate", "OthSWRefence1",
            "OthSWRefence2", "CancelLinkID", "OnBehalfBRNID", "Remark", "bAuthorized",
            "nAuthorizedBy", "dAuthorizedDate", "vAuthorizeRemark", "bRejected", "nRejectedBy",
            "dRejectedDate", "vRejectedRemark", "TRNWITHIC", "RiskCateg", "InvVendor",
            "bIsDeleted", "dDeletedDate", "nDeleedBY", "nDeliveryPersonID", "PRETCSAMT",
            "TCSAMT", "TCSPER", "TOTOLDBILLTOT", "TOTOLDTCSCOLLECTED", "TCSPERON",
            "TCSFixed", "TCSPenalty", "CardPaymentAmount", "CardPaymentPer", "CardPaymentCGST",
            "CardPaymentSGST", "OrgBranchId", "OrgVno", "OthChgID3", "OthAmt3",
            "OthChgID4", "OthAmt4", "OthChgID5", "OthAmt5", "DealNo",
            "nBranchID", "vBranchCode"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
            $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
            $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
            $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,
            $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,
            $81, $82, $83, $84, $85, $86, $87, $88, $89, $90,
            $91, $92, $93, $94, $95, $96, $97
          ) RETURNING *
        `;

        const transactionValues = [
          data.vNo, // $1 UniqID
          data.vTrnwith, // $2
          data.vTrntype, // $3
          data.vNo, // $4
          data.date, // $5
          data.counterID || "1", // $6
          data.ShiftID || "0", // $7
          data.Purpose, // $8
          data.SubPurpose || null, // $9
          "CC", // $10 PartyType
          data.PartyID || null, // $11
          data.PersonRef || "INDIVIDUAL", // $12
          data.PaxCode, // $13
          data.SenderBRNID || data.PartyID || null, // $14
          data.SenderUniqID || 0, // $15
          data.SenderNo || null, // $16
          data.senderTxnDate || data.date, // $17
          data.notMyTxn || false, // $18
          data.EEFCSale || false, // $19
          data.EEFCAsOS || 0.0, // $20
          data.EEFCSettled || false, // $21
          data.EEFCSettledWithBrnID || null, // $22
          data.Amount, // $23
          otherCharges.OthChgID1, // $24
          otherCharges.OthAmt1, // $25
          otherCharges.OthChgID2, // $26
          otherCharges.OthAmt2, // $27
          data.OthAmtMore || 0, // $28
          data.TaxTotalAmount || 0, // $29
          data.round || 0, // $30
          netAmount || data.Amount, // $31
          data.CancTaxAmt || null, // $32
          data.agentCode || null, // $33
          data.agentCommCN || 0, // $34
          data.agentCommOth || 0, // $35
          data.TDSRate || 5, // $36
          data.TDSAmount || 0, // $37
          totalCash, // $38 byCash
          totalCheque, // $39 byChq
          data.byCard || 0, // $40
          data.byTransfer || 0, // $41
          data.byOth || 0, // $42
          data.ManualBillRef || null, // $43
          data.WebDealRef || null, // $44
          data.MRKTREF || null, // $45
          data.OthRef || "", // $46
          data.OnBehalfClient || null, // $47
          data.settFromDate || null, // $48
          data.settTillDate || null, // $49
          data.NoOfPrints || 0, // $50
          data.ExchReleased || false, // $51
          data.usdIBR || 0, // $52
          data.userID || 1, // $53
          new Date(), // $54 tdate
          data.OthSWRefence1 || null, // $55
          data.OthSWRefence2 || null, // $56
          data.CancelLinkID || null, // $57
          data.OnBehalfBRNID || null, // $58
          data.Remark || "", // $59
          data.bAuthorized || false, // $60
          data.nAuthorizedBy || null, // $61
          data.dAuthorizedDate || null, // $62
          data.vAuthorizeRemark || null, // $63
          data.bRejected || false, // $64
          data.nRejectedBy || null, // $65
          data.dRejectedDate || null, // $66
          data.vRejectedRemark || null, // $67
          data.TRNWITHIC || "I", // $68
          data.Category || "L", // $69 RiskCateg
          data.InvVendor || null, // $70
          false, // $71 bIsDeleted
          null, // $72 dDeletedDate
          null, // $73 nDeleedBY
          data.nDeliveryPersonID || null, // $74
          data.PRETCSAMT || data.Amount, // $75
          data.TCSAMT || 0, // $76
          data.TCSPER || null, // $77
          data.TOTOLDBILLTOT || 0, // $78
          data.TOTOLDTCSCOLLECTED || 0, // $79
          data.TCSPERON || null, // $80
          data.TCSFixed || 0, // $81
          data.TCSPenalty || 0, // $82
          data.CardPaymentAmount || 0, // $83
          data.CardPaymentPer || 0, // $84
          data.CardPaymentCGST || 0, // $85
          data.CardPaymentSGST || 0, // $86
          data.OrgBranchId || null, // $87
          data.OrgVno || null, // $88
          otherCharges.OthChgID3, // $89
          otherCharges.OthAmt3, // $90
          otherCharges.OthChgID4, // $91
          otherCharges.OthAmt4, // $92
          otherCharges.OthChgID5, // $93
          otherCharges.OthAmt5, // $94
          data.DealNo || null, // $95
          data.nBranchID, // $96
          data.vBranchCode, // $97
        ];

        console.log("\n--- Main Transaction Insert ---");
        console.log("Calculated payment totals:", { totalCash, totalCheque });
        console.log("Query:", transactionQuery);
        console.log("Values:", JSON.stringify(transactionValues, null, 2));

        const transactionResult = await client.query(
          transactionQuery,
          transactionValues
        );
        const transactId = transactionResult.rows[0].nTranID;
        console.log("Transaction inserted successfully. ID:", transactId);

        // 2. Insert exchange data if present
        if (data.exchangeData && data.exchangeData.length > 0) {
          console.log("\n--- Exchange Data Insert ---");
          console.log("Number of exchange records:", data.exchangeData.length);

          const exchangeQuery = `
            INSERT INTO "Exchange" (
              "UniqID", "vTrnwith", "vTrntype", "vNo", "sr_no",
              "TxnNature", "ConsiderAsEEFC", "CNCodeID", "ExchType",
              "ISSCodeID", "FEAmount", "Rate", "Per", "Amount",
              "Round", "ActAmount", "Purpose", "SubPurpose",
              "agentCode", "CommType", "CommRate", "CommAmt",
              "TDSRate", "TDSAmount", "HoldCost", "Profit",
              "ibrRate", "FWDID", "FWDSrno", "CancelLinkIDSrno",
              "bIsSettled"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19,
              $20, $21, $22, $23, $24, $25, $26, $27, $28,
              $29, $30, $31
            )
            RETURNING "nExchID"
          `;

          for (let i = 0; i < data.exchangeData.length; i++) {
            const exchange = data.exchangeData[i];
            console.log(
              `\nProcessing exchange record ${i + 1}:`,
              JSON.stringify(exchange, null, 2)
            );

            const profit = exchange.Rate * 0.001 || 0; // Example profit calculation, adjust as needed
            console.log("Calculated profit:", profit);

            await client.query(exchangeQuery, [
              data.vNo, // $1
              data.vTrnwith, // $2
              data.vTrntype, // $3
              data.vNo, // $4
              i + 1, // $5 sr_no
              exchange.TxnNature || "B", // $6
              exchange.ConsiderAsEEFC || null, // $7
              exchange.CNCodeID, // $8 CNCodeID
              exchange.ExchType || "CN", // $9
              exchange.ISSCodeID || "", // $10
              exchange.FEAmount, // $11
              exchange.Rate, // $12
              exchange.Per || 1, // $13
              exchange.Amount, // $14
              exchange.Round || 0, // $15
              exchange.ActAmount || exchange.Amount, // $16
              exchange.Purpose || null, // $17
              exchange.SubPurpose || null, // $18
              exchange.agentCode || null, // $19
              exchange.CommType || "F", // $20
              exchange.CommRate || 0, // $21
              exchange.CommAmt || 0, // $22
              exchange.TDSRate || 5, // $23
              exchange.TDSAmount || 0, // $24
              exchange.HoldCost || 0, // $25
              profit, // $26
              exchange.ibrRate || null, // $27
              exchange.FWDID || null, // $28
              exchange.FWDSrno || null, // $29
              exchange.CancelLinkIDSrno || null, // $30
              exchange.bIsSettled || null, // $31
            ]);
          }
        }

        // 3. Insert charges if present
        if (data.Charges && data.Charges.length > 0) {
          console.log("\n--- Charges Insert ---");
          console.log("Number of charges:", data.Charges.length);

          const chargesQuery = `
            INSERT INTO "FXTRANSOTHERCHARG" (
              "vNo", "vTrntype", "dSrno",
              "vAccCodeCgst", "dCgstAmount",
              "vAccCodeSgst", "dSgstAmount",
              "vAccCodeIgst", "dIgstAmount",
              "nBranchID", "vBranchCode",
              "Value", "operation", "account"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING "Id"
          `;

          for (let i = 0; i < data.Charges.length; i++) {
            const charge = data.Charges[i];
            console.log(
              `\nProcessing charge record ${i + 1}:`,
              JSON.stringify(charge, null, 2)
            );

            const chargeValues = [
              data.vNo, // $1
              data.vTrntype, // $2
              i + 1, // $3 dSrno
              charge.cgstAccount || "CGST", // $4
              charge.othCGST || 0, // $5
              charge.sgstAccount || "SGST", // $6
              charge.othSGST || 0, // $7
              charge.igstAccount || "IGST", // $8
              charge.othIGST || 0, // $9
              data.nBranchID, // $10
              data.vBranchCode, // $11
              charge.value, // $12
              charge.operation, // $13
              charge.account, // $14
            ];

            console.log(
              "Charge insert values:",
              JSON.stringify(chargeValues, null, 2)
            );

            const chargeResult = await client.query(chargesQuery, chargeValues);
            console.log(
              "Charge record inserted successfully. ID:",
              chargeResult.rows[0].Id
            );
          }
        }

        // 4. Insert taxes if present
        if (data.Taxes && data.Taxes.length > 0) {
          console.log("\n--- Taxes Insert ---");
          console.log("Number of taxes:", data.Taxes.length);

          const taxesQuery = `
            INSERT INTO "TaxT" (
              "UniqID", "vTrnwith", "vTrntype", "vNo",
              "sAdded", "sTaxCode", "sApplyAs", "nTaxValue",
              "nTaxAmt", "sACCode", "STAXID", "SACCID",
              "nBranchID", "vBranchCode"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              $9, $10, $11, $12, $13, $14
            )
          `;

          for (const tax of data.Taxes) {
            console.log(
              "\nProcessing tax record:",
              JSON.stringify(tax, null, 2)
            );

            const taxValues = [
              data.vNo, // $1 UniqID
              data.vTrnwith, // $2
              data.vTrntype, // $3
              data.vNo, // $4
              tax.currentSign || "-", // $5
              tax.CODE || tax.CODE, // $6 sTaxCode
              tax.APPLYAS || "F", // $7
              tax.nTaxValue || tax.amount || 0, // $8
              tax.nTaxAmt || tax.lineTotal || 0, // $9
              tax.sACCode || "SGST/UGST", // $10
              tax.nTaxID || 0, // $11
              tax.SACCID || 0, // $12
              data.nBranchID, // $13
              data.vBranchCode, // $14
            ];

            console.log(
              "Tax insert values:",
              JSON.stringify(taxValues, null, 2)
            );

            const taxResult = await client.query(taxesQuery, taxValues);
            console.log("Tax record inserted successfully");
          }
        }

        // 5. Insert RecPay data if present
        if (data.RecPay && data.RecPay.length > 0) {
          console.log("\n--- RecPay Insert ---");
          console.log("Number of RecPay records:", data.RecPay.length);

          const recPayQuery = `
            INSERT INTO "RECPAY" (
              "vTrnwith", "vTrntype", "vNo", "vRp", "vCb",
              "vCode", "nAmount", "vChqno", "dChqdt",
              "vDrawnon", "vBranch", "adate", "vPayinno",
              "dBkdate", "bValue_hl", "vRno", "vSlcode",
              "UNIQID", "vCurr", "nFeAmt", "nFeRate",
              "nFeratePer", "vFeRateMethod", "nCodeid",
              "DisHon", "DishonNo", "nBranchID", "vBranchCode"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19,
              $20, $21, $22, $23, $24, $25, $26, $27, $28
            )
            RETURNING "nRPID"
          `;

          for (const payment of data.RecPay) {
            console.log(
              "\nProcessing RecPay record:",
              JSON.stringify(payment, null, 2)
            );

            const recPayValues = [
              data.vTrnwith, // $1
              data.vTrntype, // $2
              data.vNo, // $3
              data.vTrntype === "B" ? "P" : "R", // $4
              payment.code === "CASH" ? "C" : "B", // $5
              payment.code, // $6 vCode
              payment.amount, // $7 nAmount
              payment.chequeNo || "", // $8 vChqno
              payment.chequeDate || null, // $9 dChqdt
              payment.drawnOn || "", // $10 vDrawnon
              payment.branch || "", // $11 vBranch
              payment.accountDate || new Date(), // $12 adate
              payment.vPayinno || "1", // $13
              payment.dBkdate || new Date(), // $14
              payment.bValue_hl || null, // $15
              payment.vRno || null, // $16
              payment.vSlcode || null, // $17
              data.vNo, // $18 UNIQID
              payment.vCurr || null, // $19
              payment.nFeAmt || null, // $20
              payment.nFeRate || null, // $21
              payment.nFeratePer || null, // $22
              payment.vFeRateMethod || null, // $23
              payment.nCodeid || null, // $24
              payment.DisHon || null, // $25
              payment.DishonNo || null, // $26
              data.nBranchID, // $27
              data.vBranchCode, // $28
            ];

            console.log(
              "RecPay insert values:",
              JSON.stringify(recPayValues, null, 2)
            );

            const recPayResult = await client.query(recPayQuery, recPayValues);
            console.log(
              "RecPay record inserted successfully. ID:",
              recPayResult.rows[0].nRPID
            );
          }
        }

        console.log("\n=== Transaction Save Completed ===\n");
        return { success: true, transactId };
      });
    } catch (error) {
      throw new DatabaseError("Failed to save transaction", error);
    }
  }

  static async updateTransaction(id, data) {
    try {
      return await this.executeTransactionQuery(async (client) => {
        console.log("\n=== Starting Transaction Update ===");
        console.log("Updating Transaction ID:", id);
        console.log("Update Data:", JSON.stringify(data, null, 2));

        // Calculate other charges from data.Charges
        let otherCharges = {
          OthChgID1: "0", OthAmt1: 0,
          OthChgID2: "0", OthAmt2: 0,
          OthChgID3: "0", OthAmt3: 0,
          OthChgID4: "0", OthAmt4: 0,
          OthChgID5: "0", OthAmt5: 0
        };

        // Ensure data.Charges is an array before processing
        if (Array.isArray(data.Charges) && data.Charges.length > 0) {
          data.Charges.forEach((charge, index) => {
            try {
              if (index < 5) { // We only have 5 other charge fields
                const fieldNum = index + 1;
                
                // Ensure charge is an object
                if (!charge || typeof charge !== "object") {
                  console.warn(`Invalid charge at index ${index}:`, charge);
                  return;
                }

                const chargeId = charge.account?.value || "0";

                // Safely parse all numeric values
                const gstAmount = [
                  parseFloat(charge.othCGST || 0),
                  parseFloat(charge.othSGST || 0),
                  parseFloat(charge.othIGST || 0)
                ].reduce((sum, val) => {
                  return sum + (isNaN(val) ? 0 : val);
                }, 0);

                const baseAmount = parseFloat(charge.value || 0);
                if (isNaN(baseAmount)) {
                  console.warn(`Invalid base amount for charge ${index}:`, charge.value);
                  return;
                }

                const totalAmount = gstAmount + baseAmount;

                // Apply operation (+ or -) to the total amount
                const finalAmount = charge.operation === "-" ? -totalAmount : totalAmount;

                otherCharges[`OthChgID${fieldNum}`] = chargeId;
                otherCharges[`OthAmt${fieldNum}`] = finalAmount;

                console.log(`Processed charge ${index + 1}:`, {
                  chargeId,
                  gstAmount,
                  baseAmount,
                  totalAmount,
                  finalAmount
                });
              }
            } catch (error) {
              console.error(`Error processing charge at index ${index}:`, error);
              // Continue processing other charges
            }
          });
        }

        // Calculate NetAmt
        const chargesTotal = Math.abs(parseFloat(data.ChargesTotalAmount || 0));
        const taxTotal = Math.abs(parseFloat(data.TaxTotalAmount || 0));
        const totalDeductions = chargesTotal + taxTotal;
        const netAmount = (parseFloat(data.Amount) || 0) - totalDeductions;

        // Calculate byCash and byChq from RecPay records
        let totalCash = 0;
        let totalCheque = 0;

        // Ensure data.RecPay is an array before processing
        if (Array.isArray(data.RecPay) && data.RecPay.length > 0) {
          data.RecPay.forEach((payment, index) => {
            try {
              // Ensure payment is a valid object
              if (!payment || typeof payment !== "object") {
                console.warn(`Invalid payment at index ${index}:`, payment);
                return;
              }

              const amount = parseFloat(payment.amount || 0);
              if (isNaN(amount)) {
                console.warn(`Invalid amount for payment ${index}:`, payment.amount);
                return;
              }

              if (payment.code === "CASH") {
                totalCash += amount;
              } else if (payment.chequeNo) {
                totalCheque += amount;
              }
              
              console.log(`Processed payment ${index + 1}:`, {
                code: payment.code,
                chequeNo: payment.chequeNo,
                amount,
                runningTotalCash: totalCash,
                runningTotalCheque: totalCheque,
              });
            } catch (error) {
              console.error(`Error processing payment at index ${index}:`, error);
              // Continue processing other payments
            }
          });
        }

        console.log("Final payment totals:", { totalCash, totalCheque });

        // 1. Update main transaction
        const transactionQuery = `
          UPDATE "Transact" SET
            "PaxCode" = $1,
            "Purpose" = $2,
            "SubPurpose" = $3,
            "Amount" = $4,
            "Remark" = $5,
            "agentCode" = $6,
            "OthRef" = $7,
            "OthChgID1" = $8,
            "OthAmt1" = $9,
            "OthChgID2" = $10,
            "OthAmt2" = $11,
            "OthChgID3" = $12,
            "OthAmt3" = $13,
            "OthChgID4" = $14,
            "OthAmt4" = $15,
            "OthChgID5" = $16,
            "OthAmt5" = $17,
            "TaxAmt" = $18,
            "Netamt" = $19,
            "byCash" = $20,
            "byChq" = $21,
            "tdate" = CURRENT_TIMESTAMP,
            "userID" = $22
          WHERE "nTranID" = $23
        `;

        console.log("\n--- Main Transaction Update ---");
        console.log("Calculated payment totals:", { totalCash, totalCheque });
        console.log("Query:", transactionQuery);

        await client.query(transactionQuery, [
          data.PaxCode,
          data.Purpose,
          data.SubPurpose || null,
          data.Amount,
          data.Remark || "",
          data.agentCode || null,
          data.ReferenceNo || "",
          otherCharges.OthChgID1,
          otherCharges.OthAmt1,
          otherCharges.OthChgID2,
          otherCharges.OthAmt2,
          otherCharges.OthChgID3,
          otherCharges.OthAmt3,
          otherCharges.OthChgID4,
          otherCharges.OthAmt4,
          otherCharges.OthChgID5,
          otherCharges.OthAmt5,
          data.TaxTotalAmount || 0,
          netAmount || data.Amount,
          totalCash,
          totalCheque,
          data.userID || 1,
          id
        ]);

        console.log("Main transaction updated successfully");

        // 2. Handle exchange data
        await client.query('DELETE FROM "Exchange" WHERE "UniqID" = $1 AND "vTrnwith" = $2 AND "vTrntype" = $3', 
          [data.vNo, data.vTrnwith, data.vTrntype]);
          
        if (data.exchangeData && data.exchangeData.length > 0) {
          console.log("\n--- Exchange Data Insert ---");
          console.log("Number of exchange records:", data.exchangeData.length);

          const exchangeQuery = `
            INSERT INTO "Exchange" (
              "UniqID", "vTrnwith", "vTrntype", "vNo", "sr_no",
              "TxnNature", "ConsiderAsEEFC", "CNCodeID", "ExchType",
              "ISSCodeID", "FEAmount", "Rate", "Per", "Amount",
              "Round", "ActAmount", "Purpose", "SubPurpose",
              "agentCode", "CommType", "CommRate", "CommAmt",
              "TDSRate", "TDSAmount", "HoldCost", "Profit",
              "ibrRate", "FWDID", "FWDSrno", "CancelLinkIDSrno",
              "bIsSettled"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19,
              $20, $21, $22, $23, $24, $25, $26, $27, $28,
              $29, $30, $31
            )
            RETURNING "nExchID"
          `;

          for (let i = 0; i < data.exchangeData.length; i++) {
            const exchange = data.exchangeData[i];
            console.log(
              `\nProcessing exchange record ${i + 1}:`,
              JSON.stringify(exchange, null, 2)
            );
            
            const profit = exchange.Rate * 0.001 || 0; // Example profit calculation, adjust as needed
            console.log("Calculated profit:", profit);

            await client.query(exchangeQuery, [
              data.vNo, // $1
              data.vTrnwith, // $2
              data.vTrntype, // $3
              data.vNo, // $4
              i + 1, // $5 sr_no
              exchange.TxnNature || "B", // $6
              exchange.ConsiderAsEEFC || null, // $7
              exchange.CNCodeID, // $8 CNCodeID
              exchange.ExchType || "CN", // $9
              exchange.ISSCodeID || "", // $10
              exchange.FEAmount, // $11
              exchange.Rate, // $12
              exchange.Per || 1, // $13
              exchange.Amount, // $14
              exchange.Round || 0, // $15
              exchange.ActAmount || exchange.Amount, // $16
              exchange.Purpose || null, // $17
              exchange.SubPurpose || null, // $18
              exchange.agentCode || null, // $19
              exchange.CommType || "F", // $20
              exchange.CommRate || 0, // $21
              exchange.CommAmt || 0, // $22
              exchange.TDSRate || 5, // $23
              exchange.TDSAmount || 0, // $24
              exchange.HoldCost || 0, // $25
              profit, // $26
              exchange.ibrRate || null, // $27
              exchange.FWDID || null, // $28
              exchange.FWDSrno || null, // $29
              exchange.CancelLinkIDSrno || null, // $30
              exchange.bIsSettled || null, // $31
            ]);
          }
        }

        // 3. Handle charges
        await client.query('DELETE FROM "FXTRANSOTHERCHARG" WHERE "vNo" = $1 AND "vTrntype" = $2', 
          [data.vNo, data.vTrntype]);
          
        if (data.Charges && data.Charges.length > 0) {
          console.log("\n--- Charges Insert ---");
          console.log("Number of charges:", data.Charges.length);

          const chargesQuery = `
            INSERT INTO "FXTRANSOTHERCHARG" (
              "vNo", "vTrntype", "dSrno",
              "vAccCodeCgst", "dCgstAmount",
              "vAccCodeSgst", "dSgstAmount",
              "vAccCodeIgst", "dIgstAmount",
              "nBranchID", "vBranchCode",
              "Value", "operation", "account"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING "Id"
          `;

          for (let i = 0; i < data.Charges.length; i++) {
            const charge = data.Charges[i];
            console.log(
              `\nProcessing charge record ${i + 1}:`,
              JSON.stringify(charge, null, 2)
            );
            
            const chargeValues = [
              data.vNo, // $1
              data.vTrntype, // $2
              i + 1, // $3 dSrno
              charge.cgstAccount || "CGST", // $4
              charge.othCGST || 0, // $5
              charge.sgstAccount || "SGST", // $6
              charge.othSGST || 0, // $7
              charge.igstAccount || "IGST", // $8
              charge.othIGST || 0, // $9
              data.nBranchID, // $10
              data.vBranchCode, // $11
              charge.value, // $12
              charge.operation, // $13
              charge.account, // $14
            ];

            console.log(
              "Charge insert values:",
              JSON.stringify(chargeValues, null, 2)
            );

            const chargeResult = await client.query(chargesQuery, chargeValues);
            console.log(
              "Charge record inserted successfully. ID:",
              chargeResult.rows[0].Id
            );
          }
        }

        // 4. Handle taxes
        await client.query('DELETE FROM "TaxT" WHERE "UniqID" = $1 AND "vTrnwith" = $2 AND "vTrntype" = $3', 
          [data.vNo, data.vTrnwith, data.vTrntype]);
          
        if (data.Taxes && data.Taxes.length > 0) {
          console.log("\n--- Taxes Insert ---");
          console.log("Number of taxes:", data.Taxes.length);

          const taxesQuery = `
            INSERT INTO "TaxT" (
              "UniqID", "vTrnwith", "vTrntype", "vNo",
              "sAdded", "sTaxCode", "sApplyAs", "nTaxValue",
              "nTaxAmt", "sACCode", "STAXID", "SACCID",
              "nBranchID", "vBranchCode"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              $9, $10, $11, $12, $13, $14
            )
          `;

          for (const tax of data.Taxes) {
            console.log(
              "\nProcessing tax record:",
              JSON.stringify(tax, null, 2)
            );
            
            // Ensure tax amount is always positive
            const taxAmount = Math.abs(parseFloat(tax.amount || tax.lineTotal || 0));
            
            const taxValues = [
              data.vNo, // $1 UniqID
              data.vTrnwith, // $2
              data.vTrntype, // $3
              data.vNo, // $4
              tax.currentSign || "-", // $5
              tax.CODE || tax.code, // $6 sTaxCode
              tax.APPLYAS || "F", // $7
              tax.VALUE || tax.taxValue || 0, // $8
              taxAmount, // $9
              tax.sACCode || "SGST/UGST", // $10
              tax.nTaxID || 0, // $11
              tax.SACCID || 0, // $12
              data.nBranchID, // $13
              data.vBranchCode, // $14
            ];

            console.log(
              "Tax insert values:",
              JSON.stringify(taxValues, null, 2)
            );

            const taxResult = await client.query(taxesQuery, taxValues);
            console.log("Tax record inserted successfully");
          }
        }

        // 5. Handle RecPay
        await client.query('DELETE FROM "RECPAY" WHERE "UNIQID" = $1 AND "vTrnwith" = $2 AND "vTrntype" = $3', 
          [data.vNo, data.vTrnwith, data.vTrntype]);
          
        if (data.RecPay && data.RecPay.length > 0) {
          console.log("\n--- RecPay Insert ---");
          console.log("Number of RecPay records:", data.RecPay.length);

          const recPayQuery = `
            INSERT INTO "RECPAY" (
              "vTrnwith", "vTrntype", "vNo", "vRp", "vCb",
              "vCode", "nAmount", "vChqno", "dChqdt",
              "vDrawnon", "vBranch", "adate", "vPayinno",
              "dBkdate", "bValue_hl", "vRno", "vSlcode",
              "UNIQID", "vCurr", "nFeAmt", "nFeRate",
              "nFeratePer", "vFeRateMethod", "nCodeid",
              "DisHon", "DishonNo", "nBranchID", "vBranchCode"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19,
              $20, $21, $22, $23, $24, $25, $26, $27, $28
            )
            RETURNING "nRPID"
          `;

          for (const payment of data.RecPay) {
            console.log(
              "\nProcessing RecPay record:",
              JSON.stringify(payment, null, 2)
            );
            
            const recPayValues = [
              data.vTrnwith, // $1
              data.vTrntype, // $2
              data.vNo, // $3
              data.vTrntype === "B" ? "P" : "R", // $4
              payment.code === "CASH" ? "C" : "B", // $5
              payment.code, // $6 vCode
              payment.amount, // $7 nAmount
              payment.chequeNo || "", // $8 vChqno
              payment.chequeDate || null, // $9 dChqdt
              payment.drawnOn || "", // $10 vDrawnon
              payment.branch || "", // $11 vBranch
              payment.accountDate || new Date(), // $12 adate
              payment.vPayinno || "1", // $13
              payment.dBkdate || new Date(), // $14
              payment.bValue_hl || null, // $15
              payment.vRno || null, // $16
              payment.vSlcode || null, // $17
              data.vNo, // $18 UNIQID
              payment.vCurr || null, // $19
              payment.nFeAmt || null, // $20
              payment.nFeRate || null, // $21
              payment.nFeratePer || null, // $22
              payment.vFeRateMethod || null, // $23
              payment.nCodeid || null, // $24
              payment.DisHon || null, // $25
              payment.DishonNo || null, // $26
              data.nBranchID, // $27
              data.vBranchCode, // $28
            ];

            console.log(
              "RecPay insert values:",
              JSON.stringify(recPayValues, null, 2)
            );

            const recPayResult = await client.query(recPayQuery, recPayValues);
            console.log(
              "RecPay record inserted successfully. ID:",
              recPayResult.rows[0].nRPID
            );
          }
        }

        console.log("\n=== Transaction Update Completed ===\n");
        return { success: true, transactId: id };
      });
    } catch (error) {
      throw new DatabaseError("Failed to update transaction", error);
    }
  }

  // ... rest of the code remains the same ...
}

module.exports = TransactionModel;
