const { BaseModel, DatabaseError } = require("../../base/BaseModel");
const AdvancedSettingsUtil = require("../../../utils/advancedSettings");

class TransactionModel extends BaseModel {
  // Get transactions based on type and filters
  static async getTransactions({
    vTrnwith,
    vTrntype,
    fromDate,
    toDate,
    branchId,
    counterID,
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
        AND t."counterID" = $6
        ORDER BY t."date" DESC, t."vNo" DESC
      `;

      const values = [
        vTrnwith,
        vTrntype,
        fromDate,
        toDate,
        branchId,
        counterID,
      ];
      return await this.executeQuery(query, values);
    } catch (error) {
      throw new DatabaseError("Failed to fetch transactions", error);
    }
  }

  // Check and update financial year in document number tables
  static async checkAndUpdateFinancialYear() {
    try {
      // Get current date
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const currentDay = currentDate.getDate();
      const currentYear = currentDate.getFullYear();
      
      // Determine financial year
      // In India, financial year runs from April 1 to March 31
      let financialYear;
      if (currentMonth < 4 || (currentMonth === 4 && currentDay === 1)) {
        // Jan 1 to April 1 is previous year's financial year
        financialYear = currentYear - 1;
      } else {
        // April 2 to Dec 31 is current year's financial year
        financialYear = currentYear;
      }
      
      // Get the last digit of the financial year
      const yearDigit = financialYear.toString().slice(-1);
      
      // Check if we need to update the year in Doc_no and TemplateDoc_no tables
      // First, get a sample record to check the current year value
      const checkYearQuery = `
        SELECT "year" FROM "Doc_no" LIMIT 1
      `;
      
      const yearResult = await this.executeQuery(checkYearQuery);
      
      if (yearResult && yearResult.length > 0) {
        const currentStoredYear = yearResult[0].year;
        
        // If the stored year is different from the current financial year's last digit,
        // update all records in both tables and reset document numbers
        if (currentStoredYear.toString() !== yearDigit) {
          console.log(`Financial year changed. Updating year from ${currentStoredYear} to ${yearDigit} in document number tables.`);
          
          // Get the starting numbers from TemplateDoc_no for each code (ignoring branch)
          const getTemplateQuery = `
            SELECT "code", "og_no" FROM "TemplateDoc_no"
            GROUP BY "code", "og_no"
          `;
          
          const templateResults = await this.executeQuery(getTemplateQuery);
          
          // Create a map of code to starting number
          const startingNumbers = {};
          if (templateResults && templateResults.length > 0) {
            for (const template of templateResults) {
              // Use just the code as the key
              startingNumbers[template.code] = template.og_no;
            }
          }
          
          // Get all codes and branches from Doc_no table
          const getDocNoCodesQuery = `
            SELECT "code", "branch_id" FROM "Doc_no"
          `;
          
          const docNoCodes = await this.executeQuery(getDocNoCodesQuery);
          
          // Update each code+branch combination in Doc_no with its starting number and new year
          if (docNoCodes && docNoCodes.length > 0) {
            for (const docNoCode of docNoCodes) {
              const code = docNoCode.code;
              const branchId = docNoCode.branch_id;
              
              // Use the starting number from template if available, otherwise use a default
              // Look up by code only, ignoring branch
              const startingNo = startingNumbers[code] || '100000';
              
              const updateDocNoQuery = `
                UPDATE "Doc_no" 
                SET "year" = $1, "no" = $2
                WHERE "code" = $3 AND "branch_id" = $4
              `;
              
              await this.executeQuery(updateDocNoQuery, [yearDigit, startingNo, code, branchId]);
              console.log(`Reset document number for code ${code}, branch ${branchId} to ${startingNo} for new financial year.`);
            }
          } else {
            // If no codes found, just update the year
            const updateDocNoQuery = `
              UPDATE "Doc_no" SET "year" = $1
            `;
            
            await this.executeQuery(updateDocNoQuery, [yearDigit]);
          }
          
          // Update TemplateDoc_no table year (keep the starting numbers as they are)
          const updateTemplateQuery = `
            UPDATE "TemplateDoc_no" SET "year" = $1
          `;
          
          await this.executeQuery(updateTemplateQuery, [yearDigit]);
          
          console.log('Document number tables updated with new financial year and numbers reset.');
        }
      }
      
      return yearDigit;
    } catch (error) {
      console.error('Error checking/updating financial year:', error);
      // Return current year's last digit as fallback
      return new Date().getFullYear().toString().slice(-1);
    }
  }
  
  // Get next transaction number
  static async getNextTransactionNumber(vTrnwith, vTrntype, nBranchID = null) {
    try {
      // Default branch ID to 1 if not provided
      const branchId = nBranchID || 1;
      
      console.log(
        `Getting next transaction number for vTrnwith=${vTrnwith}, vTrntype=${vTrntype}, nBranchID=${branchId}`
      );
      
      // Check and update financial year if needed
      await this.checkAndUpdateFinancialYear();

      // Combine vTrnwith and vTrntype to form the document code
      const code = `${vTrnwith}${vTrntype}`;
      const name = `${vTrnwith} ${vTrntype}`;
      
      // Check if we have an existing document number in Doc_no table for this branch
      const checkDocNoQuery = `
        SELECT "code", "name", "year", "no", "DOCID", "branch_id" 
        FROM "Doc_no" 
        WHERE "code" = $1 AND "branch_id" = $2
      `;
      
      const docNoResult = await this.executeQuery(checkDocNoQuery, [code, branchId]);
      
      // Get current date for reference
      const currentDate = new Date();
      
      if (docNoResult && docNoResult.length > 0) {
        // We found an existing document number record for this branch
        const existingRecord = docNoResult[0];
        const existingNo = existingRecord.no;
        const existingYear = existingRecord.year;
        
        // Convert to number for calculation
        const existingNoInt = parseInt(existingNo, 10);
        const nextNoInt = existingNoInt + 1;
        
        // Format with leading zeros to match your existing format
        // Adjust padding based on your number format
        const nextNoFormatted = nextNoInt.toString().padStart(existingNo.length, '0');
        
        // Don't update the Doc_no table here - it will be updated in saveTransaction
        // Just generate and return the next number
        
        // Get the year digit for the document number
        // If year is 0, use 5 as per the original code logic
        const yearDigit = existingYear === 0 ? '5' : existingYear.toString();
        
        // Combine year and number for the full document number
        const fullDocNo = yearDigit + nextNoFormatted;
        
        // Return the full document number
        return fullDocNo;
      } else {
        // We need to check if there's a template document number (ignoring branch)
        const checkTemplateQuery = `
          SELECT "code", "name", "year", "no", "og_no" 
          FROM "TemplateDoc_no" 
          WHERE "code" = $1
          LIMIT 1
        `;
        
        const templateResult = await this.executeQuery(checkTemplateQuery, [code]);
        
        if (templateResult && templateResult.length > 0) {
          // We have a template for this transaction type, use it
          const templateRecord = templateResult[0];
          const templateNo = templateRecord.no;
          const templateYear = templateRecord.year;
          
          // Don't insert into Doc_no here - it will be done in saveTransaction
          // Just store the values for generating the document number
          
          // Get the year digit for the document number
          // If year is 0, use 5 as per the original code logic
          const yearDigit = templateYear === 0 ? '5' : templateYear.toString();
          
          // Combine year and number for the full document number
          const fullDocNo = yearDigit + templateNo;
          
          // Return the full document number
          return fullDocNo;
        } else {
          // No template exists, create a new document number
          // Generate a starting number based on your business logic
          // This is just an example, adjust according to your numbering system
          const startingNo = '100000'; // Example starting number
          
          // Get the year from the template records in the database
          // Query to get the default year value from existing templates
          
          // Get current date
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
          const currentDay = currentDate.getDate();
          const currentYear = currentDate.getFullYear();
          
          // Determine financial year
          let financialYear;
          if (currentMonth < 4 || (currentMonth === 4 && currentDay === 1)) {
            financialYear = currentYear - 1;
          } else {
            financialYear = currentYear;
          }
          
          // Get the last digit of the financial year
          const yearDigit = financialYear.toString().slice(-1);
          
          // Combine year and number for the full document number
          const fullDocNo = yearDigit + startingNo;
          
          // Return the full document number
          return fullDocNo;
        }
      }
    } catch (error) {
      console.error('Error generating transaction number:', error);
      throw new DatabaseError("Failed to get next transaction number", error);
    }
  }
  


  // Validate transaction before save
  // static async validateTransaction(data) {
  //   try {
  //     // Basic validation checks
  //     const validations = [];

  //     // Check if party exists
  //     if (data.PartyID) {
  //       const partyQuery = `
  //         SELECT "PartyID" FROM "PartyMaster"
  //         WHERE "PartyID" = $1 AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
  //       `;
  //       const partyResult = await this.executeQuery(partyQuery, [data.PartyID]);
  //       if (!partyResult.length) {
  //         validations.push("Invalid Party selected");
  //       }
  //     }

  //     // Check if Purpose and SubPurpose exist and are valid
  //     if (data.Purpose) {
  //       const purposeQuery = `
  //         SELECT "nPurposeID" FROM "MstPurpose"
  //         WHERE "nPurposeID" = $1 AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
  //       `;
  //       const purposeResult = await this.executeQuery(purposeQuery, [
  //         data.Purpose,
  //       ]);
  //       if (!purposeResult.length) {
  //         validations.push("Invalid Purpose selected");
  //       }
  //     }

  //     if (data.SubPurpose) {
  //       const subPurposeQuery = `
  //         SELECT "SubPurposeID" FROM "SubPurpose"
  //         WHERE "SubPurposeID" = $1 AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
  //       `;
  //       const subPurposeResult = await this.executeQuery(subPurposeQuery, [
  //         data.SubPurpose,
  //       ]);
  //       if (!subPurposeResult.length) {
  //         validations.push("Invalid Sub Purpose selected");
  //       }
  //     }

  //     // Amount validations
  //     const amount = parseFloat(data.Amount) || 0;
  //     const netamt = parseFloat(data.Netamt) || 0;
  //     const byCash = parseFloat(data.byCash) || 0;
  //     const byChq = parseFloat(data.byChq) || 0;
  //     const byCard = parseFloat(data.byCard) || 0;
  //     const byTransfer = parseFloat(data.byTransfer) || 0;
  //     const byOth = parseFloat(data.byOth) || 0;

  //     // Check if payment methods sum up to net amount
  //     const totalPayment = byCash + byChq + byCard + byTransfer + byOth;
  //     if (Math.abs(totalPayment - netamt) > 0.01) {
  //       validations.push("Total payment methods do not match net amount");
  //     }

  //     return {
  //       isValid: validations.length === 0,
  //       errors: validations,
  //     };
  //   } catch (error) {
  //     throw new DatabaseError("Failed to validate transaction", error);
  //   }
  // }

  // Create new transaction
  // static async createTransaction(data) {
  //   try {
  //     // First validate the transaction
  //     const validation = await this.validateTransaction(data);
  //     if (!validation.isValid) {
  //       throw new Error(validation.errors.join(", "));
  //     }

  //     // Get next transaction number
  //     const nextNo = await this.getNextTransactionNumber(
  //       data.vTrnwith,
  //       data.vTrntype,
  //       data.nBranchID
  //     );

  //     const query = `
  //       INSERT INTO "Transact" (
  //         "vTrnwith", "vTrntype", "vNo", "date", "counterID", "ShiftID",
  //         "Purpose", "SubPurpose", "PartyType", "PartyID", "Amount", "TaxAmt",
  //         "Netamt", "byCash", "byChq", "byCard", "byTransfer", "byOth",
  //         "userID", "tdate", "bIsDeleted"
  //       ) VALUES (
  //         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
  //         $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, false
  //       ) RETURNING *
  //     `;

  //     const values = [
  //       data.vTrnwith,
  //       data.vTrntype,
  //       nextNo,
  //       data.date,
  //       data.counterID,
  //       data.ShiftID,
  //       data.Purpose,
  //       data.SubPurpose,
  //       data.PartyType,
  //       data.PartyID,
  //       data.Amount,
  //       data.TaxAmt,
  //       data.Netamt,
  //       data.byCash,
  //       data.byChq,
  //       data.byCard,
  //       data.byTransfer,
  //       data.byOth,
  //       data.userID,
  //     ];

  //     return await this.executeQuery(query, values);
  //   } catch (error) {
  //     throw new DatabaseError("Failed to create transaction", error);
  //   }
  // } ---- OBSELETE (saveTransaction Function is used at the end)

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
  static async getPartyTypeOptions(entityType, vTrnwith) {
    try {
      // Determine vType based on vTrnwith
      let vType = "CC"; // Default value

      if (vTrnwith) {
        switch (vTrnwith) {
          case "F":
            vType = "FF,AD"; // Foreign Exchange or Advance
            break;
          case "R":
            vType = "RM"; // Remittance
            break;
          case "C":
            vType = "FR"; // Foreign Receipt
            break;
          case "I":
            vType = "EX"; // Foreign Receipt
            break;
          case "H":
            vType = "NF"; // Foreign Receipt
            break;
          case "K":
            vType = "BK"; // Foreign Receipt
            break;
          default:
            vType = "CC"; // Default Customer Code
        }
      }

      let query = `
        SELECT 
          "nCodesID" as value,
          "vName" as label,
          "vCode"
        FROM "mstCODES" 
        WHERE "bIND" = $1 
        AND "vType" IN (${vType
          .split(",")
          .map((_, i) => `$${i + 2}`)
          .join(",")})
        AND "bIsDeleted" = false 
        AND "bActive" = true
        ORDER BY "vName"
      `;

      const queryParams = [entityType === "I"];

      // Add vType parameters
      vType.split(",").forEach((type) => {
        queryParams.push(type.trim());
      });

      const result = await this.executeQuery(query, queryParams);
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

            return total + chargeTotal * signMultiplier;
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

  // Get payment codes for transaction (BUY)
  static async getPaymentCodesBuy() {
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

  // Get payment codes for transaction (Sell)
  static async getPaymentCodesSell() {
    try {
      const query = `
       SELECT "vCode", "vName", "vNature", "vBankType", 
               "nCurrencyID", "nDivisionID", "vFinType", "vFinCode" 
        FROM "AccountsProfile" 
        WHERE "vNature" NOT IN ('P') 
          AND ("vCode" = 'AFC' OR "vCode" = 'CASH')
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

  static async checkBalance(cncode, exchtype, counter, vBranchCode) {
    try {
      // Build query to check balance in balcntc table - fetch the latest record for the parameters
      const query = `
        SELECT "clbal" 
        FROM "balcntc" 
        WHERE "cncode" = $1 
        AND "exchtype" = $2 
        AND "counter" = $3 
        AND "vBranchCode" = $4
        ORDER BY "nbalcntcId" DESC
        LIMIT 1
      `;

      console.log("Checking balance with params:", {
        cncode,
        exchtype,
        counter,
        vBranchCode,
      });
      console.log("Executing query:", query);

      const params = [cncode, exchtype, counter, vBranchCode];
      const result = await this.executeQuery(query, params);

      console.log("Query result:", result);

      // Check if result or result.rows is undefined
      if (!result) {
        // No balance record found
        console.log("No balance record found for params:", {
          cncode,
          exchtype,
          counter,
          vBranchCode,
        });
        return {
          success: false,
          message: `No balance record found for currency ${cncode} with exchange type ${exchtype}`,
          balance: 0,
        };
      }

      // Return the current balance
      const balance = parseFloat(result[0].clbal) || 0;
      console.log(
        `Balance found: ${balance} for currency ${cncode}, exchtype ${exchtype}`
      );

      return {
        success: true,
        balance: balance,
      };
    } catch (error) {
      console.error("Error in checkBalance:", error);
      // Return a structured error response instead of throwing
      return {
        success: false,
        message: `Error checking balance: ${error.message}`,
        balance: 0,
      };
    }
  }

  // Calculate Hold Cost for CN product
  static async calcHoldCostCN(data) {
    try {
      // Extract parameters from data
      const {
        cncode, // Currency code
        exchtype, // Exchange type
        issuer, // Issuer code (can be empty string)
        date, // Date string (ISO or yyyy-mm-dd)
        counter, // Counter ID
        rate, // Entered rate
        // bExchangeGridMode = false,
        // moldCnCode = "",
        // moldExchtype = "",
        // moldIssuer = "",
        // nOldFE = 0,
        // nOldINR = 0
      } = data;

      // 1. Query for clbal and clbalrs as of the given date
      const clbalQuery = `
        SELECT "clbal", "clbalrs"
        FROM "balcntc" 
        WHERE "cncode" = $1 
        AND "exchtype" = $2 
        AND "counter" = $3
        AND "date" <= $4
        ORDER BY "nbalcntcId" DESC
        LIMIT 1
      `;
      const clbalParams = [cncode, exchtype, counter, date];
      const clbalResult = await BaseModel.executeQuery(clbalQuery, clbalParams);
      let MClBal = 0,
        MClBalRs = 0;
      if (clbalResult && clbalResult.length > 0) {
        MClBal = parseFloat(clbalResult[0].clbal) || 0;
        MClBalRs = parseFloat(clbalResult[0].clbalrs) || 0;
      }

      // 2. Query for rateper from mCurrencies
      let rateper = 1;
      const rateperQuery = `SELECT "nRatePer" FROM "mCurrency" WHERE "vCncode" = $1 LIMIT 1`;
      const rateperResult = await BaseModel.executeQuery(rateperQuery, [
        cncode,
      ]);
      if (
        rateperResult &&
        rateperResult.length > 0 &&
        rateperResult[0].nRatePer
      ) {
        rateper = parseInt(rateperResult[0].nRatePer) || 1;
      }

      // // 3. Adjust for old values if editing same CN/exchtype/issuer
      // if (
      //   !bExchangeGridMode &&
      //   cncode === moldCnCode &&
      //   exchtype === moldExchtype &&
      //   (issuer || '') === (moldIssuer || '')
      // ) {
      //   MClBal += parseFloat(nOldFE) || 0;
      //   MClBalRs += parseFloat(nOldINR) || 0;
      // }

      // 4. Calculate holdCost and profit
      let holdCost =
        MClBal !== 0
          ? (Math.round((MClBalRs / MClBal) * 100000) / 100000) * rateper
          : 0;
      let profit = (parseFloat(rate) || 0) - holdCost;
      let warningMessage = "";

      // 5. If holdCost == 0, fallback to latest daily HoldCost from Exchange table
      if (holdCost === 0) {
        warningMessage = `AWP Rate for the currency [${cncode}] could not be calculated, Picking up the latest rate from daily rates`;
        const fallbackQuery = `
          SELECT "HoldCost" FROM "Exchange"
          WHERE "ExchType" = 'CN' AND "CNCodeID" = $1 AND "vTrntype" = 'S'
          ORDER BY "nExchID" DESC
          LIMIT 1
        `;
        const fallbackResult = await BaseModel.executeQuery(fallbackQuery, [
          cncode,
        ]);
        let nCurrRate = 0;
        if (
          fallbackResult &&
          fallbackResult.length > 0 &&
          fallbackResult[0].HoldCost
        ) {
          nCurrRate = parseFloat(fallbackResult[0].HoldCost) || 0;
        }
        holdCost = nCurrRate * rateper;
        profit = (parseFloat(rate) || 0) - holdCost;
      }

      return {
        success: true,
        holdCost,
        profit,
        warningMessage,
      };
    } catch (error) {
      console.error("Error in calcHoldCostCN:", error);
      return {
        success: false,
        message: `Error calculating hold cost: ${error.message}`,
        holdCost: 0,
        profit: 0,
      };
    }
  }

  // Save complete transaction with all related data
  static async saveTransaction(data) {
    try {
      return await this.executeTransactionQuery(async (client) => {
        console.log("\n=== Starting Transaction Save ===");
        console.log("Incoming Data:", JSON.stringify(data, null, 2));
        
        // Update the Doc_no table with the transaction number after saving
        // The vNo in the data contains the full document number (year + sequence)
        if (data.vNo) {
          try {
            // Extract the sequence part (remove the first digit which is the year)
            const sequenceNumber = data.vNo.substring(1);
            
            // Get the document code from transaction type
            const code = `${data.vTrnwith}${data.vTrntype}`;
            
            // Get the branch ID from the transaction data
            const branchId = data.nBranchID || 1;
            
            // Check if the document code exists in Doc_no for this branch
            const checkDocNoQuery = `
              SELECT "code", "year", "no", "branch_id" 
              FROM "Doc_no" 
              WHERE "code" = $1 AND "branch_id" = $2
            `;
            
            const docNoResult = await this.executeQuery(checkDocNoQuery, [code, branchId]);
            
            if (docNoResult && docNoResult.length > 0) {
              // Update existing record for this branch
              const updateQuery = `
                UPDATE "Doc_no" 
                SET "no" = $1 
                WHERE "code" = $2 AND "branch_id" = $3
              `;
              
              await this.executeQuery(updateQuery, [sequenceNumber, code, branchId]);
              console.log(`Updated Doc_no for code ${code}, branch ${branchId} with number ${sequenceNumber}`);
            } else {
              // Insert new record for this branch
              // Get the financial year based on the transaction date
              let financialYear;
              const transactionDate = data.dDate ? new Date(data.dDate) : new Date();
              const transactionMonth = transactionDate.getMonth() + 1; // JavaScript months are 0-based
              const transactionDay = transactionDate.getDate();
              const transactionYear = transactionDate.getFullYear();
              
              // Determine financial year (April 1 to March 31)
              if (transactionMonth < 4 || (transactionMonth === 4 && transactionDay === 1)) {
                // Jan 1 to April 1 is previous year's financial year
                financialYear = transactionYear - 1;
              } else {
                // April 2 to Dec 31 is current year's financial year
                financialYear = transactionYear;
              }
              
              // Get the last digit of the financial year
              const yearCode = financialYear.toString().slice(-1);
              
              const insertQuery = `
                INSERT INTO "Doc_no" ("code", "name", "year", "no", "branch_id")
                VALUES ($1, $2, $3, $4, $5)
              `;
              
              const name = `${data.vTrnwith} ${data.vTrntype}`;
              await this.executeQuery(insertQuery, [code, name, yearCode, sequenceNumber, branchId]);
              console.log(`Inserted new Doc_no for code ${code}, branch ${branchId} with number ${sequenceNumber}`);
              
              // Also create a template if it doesn't exist for this branch
              const checkTemplateQuery = `
                SELECT "code" 
                FROM "TemplateDoc_no" 
                WHERE "code" = $1 AND "branch_id" = $2
              `;
              
              const templateResult = await this.executeQuery(checkTemplateQuery, [code, branchId]);
              
              if (!templateResult || templateResult.length === 0) {
                // Check if a template exists for this code (ignoring branch)
                const checkTemplateOgNoQuery = `
                  SELECT "code", "og_no" 
                  FROM "TemplateDoc_no" 
                  WHERE "code" = $1
                  LIMIT 1
                `;
                
                const templateOgNoResult = await this.executeQuery(checkTemplateOgNoQuery, [code]);
                
                // Use the og_no from template if it exists, otherwise use sequenceNumber
                const ogNo = templateOgNoResult && templateOgNoResult.length > 0 ? 
                  templateOgNoResult[0].og_no : sequenceNumber;
                
                const insertTemplateQuery = `
                  INSERT INTO "TemplateDoc_no" ("code", "name", "year", "no", "og_no", "branch_id")
                  VALUES ($1, $2, $3, $4, $5, $6)
                `;
                
                await this.executeQuery(insertTemplateQuery, [code, name, yearCode, sequenceNumber, ogNo, branchId]);
                console.log(`Created template for code ${code}, branch ${branchId}`);
              }
            }
          } catch (error) {
            console.error("Error updating document number:", error);
            // Continue with transaction save even if document number update fails
          }
        }

        // Check balance for each row in exchangeData array (for sell transactions)
        if (
          data.vTrntype === "S" &&
          data.exchangeData &&
          Array.isArray(data.exchangeData)
        ) {
          // Group by currency and exchange type to sum up FE amounts
          const currencyGroups = {};

          for (const exchange of data.exchangeData) {
            const key = `${exchange.CNCodeID}_${exchange.ExchType}`;
            if (!currencyGroups[key]) {
              currencyGroups[key] = {
                currencyCode: exchange.CNCodeID,
                exchType: exchange.ExchType,
                totalFEAmount: 0,
              };
            }
            currencyGroups[key].totalFEAmount += parseFloat(exchange.FEAmount);
          }

          // Check balance for each currency group
          for (const key in currencyGroups) {
            const group = currencyGroups[key];
            const balanceCheck = await this.checkBalance(
              group.currencyCode,
              group.exchType,
              data.CounterID.nCounterID,
              data.vBranchCode
            );

            if (!balanceCheck.success) {
              console.error(
                `Error checking balance for ${group.currencyCode} (${group.exchType}):`,
                balanceCheck.message
              );
              return {
                success: false,
                message: `Error checking balance for ${group.currencyCode} (${group.exchType}): ${balanceCheck.message}`,
              };
            }

            if (balanceCheck.balance < group.totalFEAmount) {
              console.error(
                `Insufficient balance for ${group.currencyCode} (${group.exchType})`
              );
              return {
                success: false,
                message: `Insufficient balance for ${group.currencyCode} (${
                  group.exchType
                }). Available: ${
                  balanceCheck.balance
                }, Required: ${group.totalFEAmount.toFixed(2)}`,
              };
            }
          }
        }

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
                  parseFloat(charge.othIGST || 0),
                ].reduce((sum, val) => {
                  return sum + (isNaN(val) ? 0 : val);
                }, 0);

                const baseAmount = parseFloat(charge.value || 0);
                if (isNaN(baseAmount)) {
                  console.warn(
                    `Invalid base amount for charge ${index}:`,
                    charge.value
                  );
                  return;
                }

                const totalAmount = gstAmount + baseAmount;

                // Apply operation (+ or -) to the total amount
                const finalAmount =
                  charge.operation === "-" ? -totalAmount : totalAmount;

                otherCharges[`OthChgID${fieldNum}`] = chargeId;
                otherCharges[`OthAmt${fieldNum}`] = finalAmount;

                console.log(`Processed charge ${index + 1}:`, {
                  chargeId,
                  gstAmount,
                  baseAmount,
                  totalAmount,
                  finalAmount,
                });
              }
            } catch (error) {
              console.error(
                `Error processing charge at index ${index}:`,
                error
              );
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
                console.warn(
                  `Invalid amount for payment ${index}:`,
                  payment.amount
                );
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
              console.error(
                `Error processing payment at index ${index}:`,
                error
              );
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
            "OthAmtMore", "TaxAmt", "round",
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
            "CardPaymentSGST", "OrgBranchId", "OrgVno", "OthChgID2", "OthAmt2",
            "OthChgID3", "OthAmt3", "OthChgID4", "OthAmt4", "OthChgID5", "OthAmt5", "DealNo",
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
          data.CounterID.nCounterID || "1", // $6
          data.ShiftID || "0", // $7
          data.Purpose || null, // $8
          data.SubPurpose || null, // $9
          "CC", // $10 PartyType
          data.PartyID || null, // $11
          data.PersonRef || "INDIVIDUAL", // $12
          data.PaxCode || null, // $13
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
          data.OthAmtMore || 0, // $26
          data.TaxTotalAmount || 0, // $27
          data.round || 0, // $28
          netAmount || data.Amount, // $29
          data.CancTaxAmt || null, // $30
          data.agentCode || null, // $31
          data.agentCommCN || 0, // $32
          data.agentCommOth || 0, // $33
          data.TDSRate || 5, // $34
          data.TDSAmount || 0, // $35
          totalCash, // $36 byCash
          totalCheque, // $37 byChq
          data.byCard || 0, // $38
          data.byTransfer || 0, // $39
          data.byOth || 0, // $40
          data.ManualBillRef || null, // $41
          data.WebDealRef || null, // $42
          data.MRKTREF || null, // $43
          data.OthRef || "", // $44
          data.OnBehalfClient || null, // $45
          data.settFromDate || null, // $46
          data.settTillDate || null, // $47
          data.NoOfPrints || 0, // $48
          data.ExchReleased || false, // $49
          data.usdIBR || 0, // $50
          data.userID || 1, // $51
          new Date(), // $52 tdate
          data.OthSWRefence1 || null, // $53
          data.OthSWRefence2 || null, // $54
          data.CancelLinkID || null, // $55
          data.OnBehalfBRNID || null, // $56
          data.Remark || "", // $57
          data.bAuthorized || false, // $58
          data.nAuthorizedBy || null, // $59
          data.dAuthorizedDate || null, // $60
          data.vAuthorizeRemark || null, // $61
          data.bRejected || false, // $62
          data.nRejectedBy || null, // $63
          data.dRejectedDate || null, // $64
          data.vRejectedRemark || null, // $65
          data.TRNWITHIC || null, // $66
          data.Category || "L", // $67 RiskCateg
          data.InvVendor || null, // $68
          false, // $69 bIsDeleted
          null, // $70 dDeletedDate
          null, // $71 nDeleedBY
          data.nDeliveryPersonID || null, // $72
          data.PRETCSAMT || data.Amount, // $73
          data.TCSAMT || 0, // $74
          data.TCSPER || null, // $75
          data.TOTOLDBILLTOT || 0, // $76
          data.TOTOLDTCSCOLLECTED || 0, // $77
          data.TCSPERON || null, // $78
          data.TCSFixed || 0, // $79
          data.TCSPenalty || 0, // $80
          data.CardPaymentAmount || 0, // $81
          data.CardPaymentPer || 0, // $82
          data.CardPaymentCGST || 0, // $83
          data.CardPaymentSGST || 0, // $84
          data.OrgBranchId || null, // $85
          data.OrgVno || null, // $86
          otherCharges.OthChgID2, // $87
          otherCharges.OthAmt2, // $88
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

        // Handle Changes in balcntc table wrt the TrnType
        // Handle Changes in balcntc table
        console.log("\n--- balcntc Update for Transaction ---");

        // Helper function to determine column names based on transaction type and with
        const getColumnNames = (trnType, trnWith) => {
          // Default to purpub/salpub
          let purColumn = "purpub";
          let salColumn = "salpub";

          // Map trnWith values to column suffixes
          const columnMap = {
            P: "pub", // Foreign Exchange
            F: "FFMC", // Remittance
            C: "Franchisee", // Foreign Receipt
            I: "Import", // Import
            H: "Branch", // Branch
            K: "Counter", // Counter
          };

          // Get the appropriate column suffix based on trnWith
          const columnSuffix = columnMap[trnWith] || "pub";

          // Construct column names
          purColumn = `pur${columnSuffix}`;
          salColumn = `sal${columnSuffix}`;

          return {
            // For Buy transactions, we update the purchase column
            // For Sell transactions, we update the sale column
            updateColumn: trnType === "B" ? purColumn : salColumn,
            // Column for INR amount
            updateColumnRs:
              trnType === "B" ? `${purColumn}rs` : `${salColumn}rs`,
            // For Buy, we add to clbal; for Sell, we subtract
            operator: trnType === "B" ? "+" : "-",
          };
        };

        // For each currency in exchangeData, update the balcntc table
        if (data.exchangeData && Array.isArray(data.exchangeData)) {
          for (const exchange of data.exchangeData) {
            // Get column names based on transaction type and with
            const { updateColumn, updateColumnRs, operator } = getColumnNames(
              data.vTrntype,
              data.vTrnwith
            );

            console.log(
              `Transaction type: ${data.vTrntype}, with: ${data.vTrnwith}`
            );
            console.log(
              `Using columns: ${updateColumn}, ${updateColumnRs}, operator: ${operator}`
            );

            // Check if a record exists for today
            const checkQuery = `
      SELECT "nbalcntcId" 
      FROM "balcntc" 
      WHERE "date" = CURRENT_DATE 
      AND "counter" = $1 
      AND "cncode" = $2 
      AND "exchtype" = $3
      AND "vBranchCode" = $4
    `;

            const checkResult = await client.query(checkQuery, [
              data.CounterID.nCounterID,
              exchange.CNCodeID,
              exchange.ExchType,
              data.vBranchCode,
            ]);

            if (checkResult.rows.length > 0) {
              // Update existing record
              // Use dynamic column names and operator in the query
              const updateQuery = `
        UPDATE "balcntc" 
        SET "${updateColumn}" = COALESCE("${updateColumn}", 0) + $1,
            "${updateColumnRs}" = COALESCE("${updateColumnRs}", 0) + $2,
            "clbal" = COALESCE("clbal", 0) ${operator} $1,
            "clbalrs" = COALESCE("clbalrs", 0) ${operator} $2
        WHERE "nbalcntcId" = $3
      `;

              await client.query(updateQuery, [
                parseFloat(exchange.FEAmount),
                parseFloat(exchange.Amount),
                checkResult.rows[0].nbalcntcId,
              ]);

              console.log(
                `Updated balcntc for ${data.vTrntype}: ${exchange.CNCodeID} (${exchange.ExchType}), Amount: ${exchange.FEAmount}`
              );
            } else {
              // Get the last record for this currency to get the opening balance
              const lastRecordQuery = `
        SELECT "clbal", "clbalrs" 
        FROM "balcntc" 
        WHERE "cncode" = $1 
        AND "exchtype" = $2 
        AND "counter" = $3 
        AND "vBranchCode" = $4
        ORDER BY "date" DESC 
        LIMIT 1
      `;

              const lastRecord = await client.query(lastRecordQuery, [
                exchange.CNCodeID,
                exchange.ExchType,
                data.CounterID.nCounterID,
                data.vBranchCode,
              ]);

              console.log("lastRecord", lastRecord);

              const opbal =
                lastRecord.rows.length > 0
                  ? parseFloat(lastRecord.rows[0].clbal)
                  : 0;
              const opbalrs =
                lastRecord.rows.length > 0
                  ? parseFloat(lastRecord.rows[0].clbalrs)
                  : 0;

              // Calculate closing balance based on operator
              const clbal =
                operator === "+"
                  ? opbal + parseFloat(exchange.FEAmount)
                  : opbal - parseFloat(exchange.FEAmount);

              const clbalrs =
                operator === "+"
                  ? opbalrs + parseFloat(exchange.Amount)
                  : opbalrs - parseFloat(exchange.Amount);

              // Create dynamic column list for insert
              const columns = [
                '"date"',
                '"counter"',
                '"shiftID"',
                '"cncode"',
                '"exchtype"',
                '"opbal"',
                '"opbalrs"',
                `"${updateColumn}"`,
                `"${updateColumnRs}"`,
                '"clbal"',
                '"clbalrs"',
                '"nBranchID"',
                '"vBranchCode"',
              ];

              // Create values placeholders correctly
              const valuePlaceholders = ["CURRENT_DATE"];
              for (let i = 1; i <= 12; i++) {
                valuePlaceholders.push(`$${i}`);
              }

              // Insert new record with dynamic columns
              const insertQuery = `
  INSERT INTO "balcntc" (${columns.join(", ")})
  VALUES (${valuePlaceholders.join(", ")})
  RETURNING "nbalcntcId"
`;

              console.log("insertQuery", insertQuery);

              // Create an object with all values set to 0 or null
              const insertValues = {
                counter: data.CounterID.nCounterID,
                shiftID: 1,
                cncode: exchange.CNCodeID,
                exchtype: exchange.ExchType,
                opbal: opbal,
                opbalrs: opbalrs,

                clbal: clbal,
                clbalrs: clbalrs,
                nBranchID: data.nBranchID,
                vBranchCode: data.vBranchCode,
              };

              console.log("insertValues", insertValues);

              // Set the specific update column value
              insertValues[updateColumn] = parseFloat(exchange.FEAmount);
              insertValues[updateColumnRs] = parseFloat(exchange.Amount);

              // Convert to array in the right order
              const insertValuesArray = [
                insertValues.counter,
                insertValues.shiftID,
                insertValues.cncode,
                insertValues.exchtype,
                insertValues.opbal,
                insertValues.opbalrs,
                insertValues[updateColumn],
                insertValues[updateColumnRs],
                insertValues.clbal,
                insertValues.clbalrs,
                insertValues.nBranchID,
                insertValues.vBranchCode,
              ];

              console.log("insertValuesArray", insertValuesArray);

              const insertResult = await client.query(
                insertQuery,
                insertValuesArray
              );

              console.log(
                `Created new balcntc for ${data.vTrntype}: ${exchange.CNCodeID} (${exchange.ExchType}), ID: ${insertResult.rows[0].nbalcntcId}`
              );
            }
          }
        }

        console.log("\n=== Transaction Save Completed ===\n");

        // Post accounting entries using the same transaction context
        await this.postAccountingEntries(
          {
            ...data,
          },
          client
        );

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
                  parseFloat(charge.othIGST || 0),
                ].reduce((sum, val) => {
                  return sum + (isNaN(val) ? 0 : val);
                }, 0);

                const baseAmount = parseFloat(charge.value || 0);
                if (isNaN(baseAmount)) {
                  console.warn(
                    `Invalid base amount for charge ${index}:`,
                    charge.value
                  );
                  return;
                }

                const totalAmount = gstAmount + baseAmount;

                // Apply operation (+ or -) to the total amount
                const finalAmount =
                  charge.operation === "-" ? -totalAmount : totalAmount;

                otherCharges[`OthChgID${fieldNum}`] = chargeId;
                otherCharges[`OthAmt${fieldNum}`] = finalAmount;

                console.log(`Processed charge ${index + 1}:`, {
                  chargeId,
                  gstAmount,
                  baseAmount,
                  totalAmount,
                  finalAmount,
                });
              }
            } catch (error) {
              console.error(
                `Error processing charge at index ${index}:`,
                error
              );
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
                console.warn(
                  `Invalid amount for payment ${index}:`,
                  payment.amount
                );
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
              console.error(
                `Error processing payment at index ${index}:`,
                error
              );
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
          id,
        ]);

        console.log("Main transaction updated successfully");

        // 2. Handle exchange data
        await client.query(
          'DELETE FROM "Exchange" WHERE "UniqID" = $1 AND "vTrnwith" = $2 AND "vTrntype" = $3',
          [data.vNo, data.vTrnwith, data.vTrntype]
        );

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
        await client.query(
          'DELETE FROM "FXTRANSOTHERCHARG" WHERE "vNo" = $1 AND "vTrntype" = $2',
          [data.vNo, data.vTrntype]
        );

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
        await client.query(
          'DELETE FROM "TaxT" WHERE "UniqID" = $1 AND "vTrnwith" = $2 AND "vTrntype" = $3',
          [data.vNo, data.vTrnwith, data.vTrntype]
        );

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
            const taxAmount = Math.abs(
              parseFloat(tax.amount || tax.lineTotal || 0)
            );

            const taxValues = [
              data.vNo, // $1 UniqID
              data.vTrnwith, // $2
              data.vTrntype, // $3
              data.vNo, // $4
              tax.currentSign || "-", // $5
              tax.code || tax.CODE, // $6 sTaxCode
              tax.applyAs || "F", // $7
              tax.VALUE || tax.taxValue || 0, // $8
              taxAmount, // $9
              tax.components.accountCode || "SGST/UGST", // $10
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
        await client.query(
          'DELETE FROM "RECPAY" WHERE "UNIQID" = $1 AND "vTrnwith" = $2 AND "vTrntype" = $3',
          [data.vNo, data.vTrnwith, data.vTrntype]
        );

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

  /**
   * Posts accounting entries for a transaction
   * @param {Object} transactionData - Transaction data containing all necessary information
   * @param {Object} client - Optional database client for transaction context
   * @returns {Promise<Object>} - Result of the operation
   */
  static async postAccountingEntries(transactionData, client = null) {
    // TODO: MAKE CHANGES FOR CODE ID, AND SLCODEID, RNOID FOR OTHER THAN ADVSETTINGS
    try {
      // If client is provided, use it (for transaction context)
      // Otherwise, create a new transaction
      const executeQuery = async (callback) => {
        if (client) {
          return await callback(client);
        } else {
          return await this.executeTransactionQuery(callback);
        }
      };

      return await executeQuery(async (dbClient) => {
        console.log("\n=== Starting Account Posting ===");

        // Extract required data
        const {
          vNo,
          vTrntype,
          vTrnwith,
          CounterID,
          uniqID,
          date,
          nBranchID,
          vBranchCode,
          exchangeData,
          Taxes: taxData, // Map Taxes to taxData for consistency
          gstData,
          PartyID,
          PartyType,
          UserID,
          RecPay: paymentData, // Map RecPay to paymentData for consistency
          DirectRemi = false, // Default to false if not provided
          TCSAMT = 0,
          TaxTotalAmount = 0,
          Charges = [], // Get the Charges array
          OthAmt1 = 0,
          OthAmt2 = 0,
          OthAmt3 = 0,
          OthAmt4 = 0,
          OthAmt5 = 0,
          OthChgID1 = "",
          OthChgID2 = "",
          OthChgID3 = "",
          OthChgID4 = "",
          OthChgID5 = "",
        } = transactionData;

        // Create a temporary array to hold all accounting entries
        const accountingEntries = [];

        // Get the appropriate settlement account based on transaction type and party
        const settlementAccount =
          await AdvancedSettingsUtil.getSettlementAccount(
            vTrntype,
            PartyType || "INDIVIDUAL",
            nBranchID
          );
        // Use both the code and ID
        const AdvSett = settlementAccount.code;

        const PartyCode = await AdvancedSettingsUtil.getPartyCodeById(PartyID);
        // Delete existing entries if any (do this first to avoid conflicts)
        const deleteQuery = `
        DELETE FROM "INTUPDTD" 
        WHERE "type" = $1 AND "Vno" = $2 AND "vBranchCode" = $3
      `;

        await dbClient.query(deleteQuery, [
          vTrnwith + vTrntype,
          vNo,
          vBranchCode,
        ]);

        // Process Currency (CN) entries
        if (exchangeData && Array.isArray(exchangeData)) {
          // Group exchanges by type for profit calculation
          const exchangesByType = {};

          // First pass - group exchanges and get product details
          for (const exchange of exchangeData) {
            const exchType = exchange.ExchType;
            if (!exchangesByType[exchType]) {
              exchangesByType[exchType] = [];
            }
            exchangesByType[exchType].push(exchange);
          }

          // Second pass - process each exchange
          for (const exchange of exchangeData) {
            // Get product details for account codes
            const productDetails = await AdvancedSettingsUtil.getProductDetails(
              exchange.ExchType
            );

            if (exchange.ExchType === "CN") {
              // Calculate cost amount
              const costAmountSell =
                (parseFloat(exchange.FEAmount) *
                  parseFloat(exchange.HoldCost)) /
                parseFloat(exchange.Per);
              const costAmountPurchase = parseFloat(exchange.Amount);

              const costAmount =
                vTrntype === "S" ? costAmountSell : costAmountPurchase;

              // Sale/Purchase CN entry (Credit/Debit based on transaction type)
              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: date,
                code:
                  vTrntype === "S"
                    ? productDetails?.vSaleAccountCode || "SALCN"
                    : productDetails?.vPurchaseAccountCode || "PURCN",
                slcode: "",
                anacode: "XXX",
                sign: vTrntype === "S" ? "C" : "D",
                amount: costAmount.toFixed(2),

                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  vTrntype === "S"
                    ? productDetails?.vSaleAccountCode || "SALCN"
                    : productDetails?.vPurchaseAccountCode || "PURCN"
                ),
                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
              });

              // Check if CN is a settlement product
              const isCNSettlement = productDetails?.isSettlement || false;

              // Only add profit entry for specific transaction types based on settlement status
              // For non-settlement products: Add profit in SELL transactions only
              // For settlement products: Add profit in BUY transactions only
              if (
                (isCNSettlement && vTrntype === "B") ||
                (!isCNSettlement && vTrntype === "S")
              ) {
                // Calculate profit amount
                const profitAmount = parseFloat(exchange.Amount) - costAmount;

                if (profitAmount !== 0) {
                  // Determine profit account code based on bulk or regular
                  const profitCode =
                    vTrnwith === "F"
                      ? productDetails?.vBulkProfitAccountCode || `PROCN`
                      : productDetails?.vProfitAccountCode || "PROCN";

                  // Determine sign based on settlement status and transaction type
                  const profitSign = isCNSettlement ? "D" : "C";

                  accountingEntries.push({
                    counter: CounterID.nCounterID,
                    shift: "1",
                    type: vTrnwith + vTrntype,
                    uniqid: uniqID,
                    date: date,
                    code: profitCode,
                    slcode: "",
                    anacode: "XXX",
                    sign: profitSign,
                    amount: Math.abs(profitAmount).toFixed(2),

                    nBranchID: nBranchID,
                    vBranchCode: vBranchCode,
                    CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                      profitCode
                    ),
                  });
                }
              }
            } else {
              // Non-CN entries
              // Get settlement status from product details or exchange data
              const isSettlement =
                productDetails?.isSettlement ||
                exchange.IsSettlement === true ||
                exchange.IsSettlement === 1 ||
                exchange.IsSettlement === "1";

              // For non-settlement products
              if (!isSettlement) {
                // Issuer entry
                accountingEntries.push({
                  counter: CounterID.nCounterID,
                  shift: "1",
                  type: vTrnwith + vTrntype,
                  uniqid: uniqID,
                  date: date,
                  code:
                    productDetails?.vIssuerAccountCode ||
                    exchange.IssuerAccountCode ||
                    `ISS${exchange.ExchType}`,
                  slcode: exchange.ISSCodeID || "",
                  anacode: "XXX",
                  sign: vTrntype === "B" ? "D" : "C",
                  amount:
                    vTrntype === "B"
                      ? parseFloat(exchange.Amount).toFixed(2)
                      : (
                          (parseFloat(exchange.FEAmount) *
                            parseFloat(exchange.HoldCost)) /
                          parseFloat(exchange.Per)
                        ).toFixed(2),

                  nBranchID: nBranchID,
                  vBranchCode: vBranchCode,
                  CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    productDetails?.vIssuerAccountCode ||
                      exchange.IssuerAccountCode ||
                      `ISS${exchange.ExchType}`
                  ),
                  SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    exchange.ISSCodeID || "0"
                  ),
                });

                // Closing entry
                accountingEntries.push({
                  counter: CounterID.nCounterID,
                  shift: "1",
                  type: vTrnwith + vTrntype,
                  uniqid: uniqID,
                  date: date,
                  code:
                    productDetails?.vClosingAccountCode ||
                    exchange.ClosingAccountCode ||
                    `CLO${exchange.ExchType}`,
                  slcode: "",
                  anacode: "XXX",
                  sign: vTrntype === "B" ? "C" : "D",
                  amount:
                    vTrntype === "B"
                      ? parseFloat(exchange.Amount).toFixed(2)
                      : (
                          (parseFloat(exchange.FEAmount) *
                            parseFloat(exchange.HoldCost)) /
                          parseFloat(exchange.Per)
                        ).toFixed(2),

                  nBranchID: nBranchID,
                  vBranchCode: vBranchCode,
                  CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    productDetails?.vClosingAccountCode ||
                      exchange.ClosingAccountCode ||
                      `CLO${exchange.ExchType}`
                  ),
                });

                // Add profit/loss entry for sell transactions (non-settlement)
                if (vTrntype === "S") {
                  // Calculate profit amount
                  const costAmount =
                    (parseFloat(exchange.FEAmount) *
                      parseFloat(exchange.HoldCost)) /
                    parseFloat(exchange.Per);
                  const profitAmount = parseFloat(exchange.Amount) - costAmount;

                  if (profitAmount !== 0) {
                    // Determine profit account code based on bulk or regular
                    const profitCode =
                      vTrnwith === "F"
                        ? productDetails?.vBulkProfitAccountCode ||
                          `PROB${exchange.ExchType}`
                        : productDetails?.vProfitAccountCode ||
                          `PRO${exchange.ExchType}`;

                    accountingEntries.push({
                      counter: CounterID.nCounterID,
                      shift: "1",
                      type: vTrnwith + vTrntype,
                      uniqid: uniqID,
                      date: date,
                      code: profitCode,
                      slcode: "",
                      anacode: "XXX",
                      sign: "C", // Credit for profit in sell transactions
                      amount: Math.abs(profitAmount).toFixed(2),

                      nBranchID: nBranchID,
                      vBranchCode: vBranchCode,
                      CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                        profitCode
                      ),
                    });
                  }
                }
              } else {
                // For settlement products
                // Issuer entry
                accountingEntries.push({
                  counter: CounterID.nCounterID,
                  shift: "1",
                  type: vTrnwith + vTrntype,
                  uniqid: uniqID,
                  date: date,
                  code:
                    productDetails?.vIssuerAccountCode ||
                    exchange.IssuerAccountCode ||
                    `ISS${exchange.ExchType}`,
                  slcode: exchange.ISSCodeID || "",
                  anacode: "XXX",
                  sign: vTrntype === "B" ? "D" : "C",
                  amount:
                    vTrntype === "S"
                      ? parseFloat(exchange.Amount).toFixed(2)
                      : (
                          (parseFloat(exchange.FEAmount) *
                            parseFloat(exchange.HoldCost)) /
                          parseFloat(exchange.Per)
                        ).toFixed(2),

                  nBranchID: nBranchID,
                  vBranchCode: vBranchCode,
                  CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    productDetails?.vIssuerAccountCode ||
                      exchange.IssuerAccountCode ||
                      `ISS${exchange.ExchType}`
                  ),
                });

                // Closing entry
                accountingEntries.push({
                  counter: CounterID.nCounterID,
                  shift: "1",
                  type: vTrnwith + vTrntype,
                  uniqid: uniqID,
                  date: date,
                  code:
                    productDetails?.vClosingAccountCode ||
                    exchange.ClosingAccountCode ||
                    `CLO${exchange.ExchType}`,
                  slcode: "",
                  anacode: "XXX",
                  sign: vTrntype === "B" ? "C" : "D",
                  amount:
                    vTrntype === "S"
                      ? parseFloat(exchange.Amount).toFixed(2)
                      : (
                          (parseFloat(exchange.FEAmount) *
                            parseFloat(exchange.HoldCost)) /
                          parseFloat(exchange.Per)
                        ).toFixed(2),

                  nBranchID: nBranchID,
                  vBranchCode: vBranchCode,
                  CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    productDetails?.vClosingAccountCode ||
                      exchange.ClosingAccountCode ||
                      `CLO${exchange.ExchType}`
                  ),
                });

                // Add profit/loss entry for buy transactions (settlement)
                if (vTrntype === "B") {
                  // Calculate profit amount
                  const costAmount =
                    (parseFloat(exchange.FEAmount) *
                      parseFloat(exchange.HoldCost)) /
                    parseFloat(exchange.Per);
                  const profitAmount = parseFloat(exchange.Amount) - costAmount;

                  if (profitAmount !== 0) {
                    // Determine profit account code based on bulk or regular
                    const profitCode =
                      vTrnwith === "F"
                        ? productDetails?.vBulkProfitAccountCode ||
                          `PROB${exchange.ExchType}`
                        : productDetails?.vProfitAccountCode ||
                          `PRO${exchange.ExchType}`;

                    accountingEntries.push({
                      counter: CounterID.nCounterID,
                      shift: "1",
                      type: vTrnwith + vTrntype,
                      uniqid: uniqID,
                      date: date,
                      code: profitCode,
                      slcode: "",
                      anacode: "XXX",
                      sign: "D", // Debit for profit in buy transactions for settlement products
                      amount: Math.abs(profitAmount).toFixed(2),

                      nBranchID: nBranchID,
                      vBranchCode: vBranchCode,
                      CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                        profitCode
                      ),
                    });
                  }
                }
              }

              // Purchase/Sale entry based on transaction type
              const purchaseSaleCode = (() => {
                if (vTrntype === "B") {
                  return vTrnwith === "F"
                    ? productDetails?.vBulkPurchaseAccountCode ||
                        `PURB${exchange.ExchType}`
                    : productDetails?.vPurchaseAccountCode ||
                        `PUR${exchange.ExchType}`;
                } else {
                  // 'S'
                  return vTrnwith === "F"
                    ? productDetails?.vBulkSaleAccountCode ||
                        `SALB${exchange.ExchType}`
                    : productDetails?.vSaleAccountCode ||
                        `SAL${exchange.ExchType}`;
                }
              })();

              // Purchase/Sale amount calculation
              const purchaseSaleAmount =
                vTrntype === "B"
                  ? parseFloat(exchange.Amount)
                  : (parseFloat(exchange.FEAmount) *
                      parseFloat(exchange.HoldCost)) /
                    parseFloat(exchange.Per);

              if (purchaseSaleAmount !== 0) {
                accountingEntries.push({
                  counter: CounterID.nCounterID,
                  shift: "1",
                  type: vTrnwith + vTrntype,
                  uniqid: uniqID,
                  date: date,
                  code: purchaseSaleCode,
                  slcode: "",
                  anacode: "XXX",
                  sign: vTrntype === "B" ? "D" : "C",
                  amount: Math.abs(purchaseSaleAmount).toFixed(2),

                  nBranchID: nBranchID,
                  vBranchCode: vBranchCode,
                  CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    purchaseSaleCode
                  ),
                });
              }
            }
            // Debtors control entry - common for both settlement and non-settlement
            accountingEntries.push({
              counter: CounterID.nCounterID,
              shift: "1",
              type: vTrnwith + vTrntype,
              uniqid: uniqID,
              date: date,
              code: AdvSett,
              slcode: PartyCode.vCode || "",
              anacode: "XXX",
              sign: vTrntype === "S" ? "D" : "C",
              amount: parseFloat(exchange.Amount).toFixed(2),

              nBranchID: nBranchID,
              vBranchCode: vBranchCode,
              SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                PartyCode?.vCode || "0",
                "mstCODES"
              ),
              CodeId: await AdvancedSettingsUtil.getAccountIdByCode(AdvSett),
            });
          }
        }

        // Process tax entries
        if (taxData && Array.isArray(taxData)) {
          // First calculate total tax amount for the balancing entry
          let totalTaxAmount = parseFloat(TaxTotalAmount) || 0;
          let totalGstAmount = 0;

          // Process non-GST taxes
          for (const tax of taxData) {
            if (tax.CODE.toLowerCase() !== "gst18%") {
              // Skip GST entries as they're handled separately
              const taxAmount = parseFloat(tax.amount || tax.lineTotal || 0);

              // Get the tax account code from mstTax and AccountsProfile tables
              // This will first try to get nAccID from mstTax and then get vCode from AccountsProfile
              // If not found, it will fall back to advanced settings or the tax code itself
              if (taxAmount !== 0) {
                const taxCode = await AdvancedSettingsUtil.getTaxAccountCode(
                  tax.CODE,
                  nBranchID
                );

                // Individual tax entry
                accountingEntries.push({
                  counter: CounterID.nCounterID,
                  shift: "1",
                  type: vTrnwith + vTrntype,
                  uniqid: uniqID,
                  date: date,
                  code: taxCode || tax.CODE, // Use the tax code itself as fallback
                  slcode: "",
                  anacode: "TAX",
                  sign:
                    vTrntype === "S"
                      ? tax.currentSign === "+"
                        ? "C"
                        : "D"
                      : tax.currentSign === "+"
                      ? "D"
                      : "C",
                  amount: Math.abs(taxAmount).toFixed(2),

                  nBranchID: nBranchID,
                  vBranchCode: vBranchCode,
                  CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    taxCode || tax.CODE
                  ),
                });
              }
            } else {
              // Track GST amount for later processing
              const gstAmount = parseFloat(tax.amount || tax.lineTotal || 0);
              if (gstAmount !== 0) {
                totalGstAmount += gstAmount;
              }
            }
          }

          // Process GST entries separately
          if (Math.abs(totalGstAmount) > 0) {
            try {
              // Get the state code from mstCompany table for the branch
              const stateCodeQuery = `
              SELECT "STDCode" 
              FROM "mstCompany" 
              WHERE "vBranchCode" = $1
              LIMIT 1
            `;

              const stateCodeResult = await BaseModel.executeQuery(
                stateCodeQuery,
                [vBranchCode]
              );
              const stateCode =
                stateCodeResult && stateCodeResult.length > 0
                  ? stateCodeResult[0].STDCode
                  : "";

              const stateCodeIDQuery = `
              SELECT "nCodesID" 
              FROM "mstCODES" 
              WHERE "vCode" = $1
              LIMIT 1
            `;

              const stateCodeIDResult = await BaseModel.executeQuery(
                stateCodeIDQuery,
                [stateCode]
              );

              // Get GST account code using the same method as non-GST taxes
              const gstCode = await AdvancedSettingsUtil.getTaxAccountCode(
                "gst18%",
                nBranchID
              );

              // GST entry - IGST
              if (totalGstAmount !== 0) {
                accountingEntries.push({
                  counter: CounterID.nCounterID,
                  shift: "1",
                  type: vTrnwith + vTrntype,
                  uniqid: uniqID,
                  date: date,
                  code: gstCode || "IGST", // Use the GST account code from AccountsProfile
                  slcode: stateCode,
                  anacode: "TAX",
                  sign: vTrntype === "S" ? "D" : "C",
                  amount: Math.abs(totalGstAmount).toFixed(2),

                  nBranchID: nBranchID,
                  vBranchCode: vBranchCode,
                  rno: stateCode,
                  rnoId: await AdvancedSettingsUtil.getAccountIdByCode(
                    stateCode || "0"
                  ),
                  SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    stateCode || "0"
                  ),
                  CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                    gstCode || "IGST"
                  ),
                });
              }
            } catch (error) {
              console.error("Error processing GST entries:", error);
            }
          }

          // Balancing entry for all taxes combined
          if (totalTaxAmount !== 0) {
            accountingEntries.push({
              counter: CounterID.nCounterID,
              shift: "1",
              type: vTrnwith + vTrntype,
              uniqid: uniqID,
              date: date,
              code: AdvSett,
              slcode: PartyCode?.vCode || "",
              anacode: "TAX",
              sign: vTrntype === "B" ? "D" : "C",
              amount: Math.abs(totalTaxAmount).toFixed(2),

              nBranchID: nBranchID,
              vBranchCode: vBranchCode,
              SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                PartyCode?.vCode || "0",
                "mstCODES"
              ),
              CodeId: await AdvancedSettingsUtil.getAccountIdByCode(AdvSett),
            });
          }
        }

        // Process payment entries
        if (paymentData && Array.isArray(paymentData)) {
          for (const payment of paymentData) {
            // Determine payment direction based on transaction type
            // For Buy transactions, money goes out (Payment)
            // For Sell transactions, money comes in (Receipt)
            const rnoId = await AdvancedSettingsUtil.getAccountIdByCode(
              payment.code
            );
            const paymentDirection = vTrntype === "B" ? "P" : "R";

            if (DirectRemi) {
              // Direct remittance entries
              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: payment.chequeDate || date,
                code: "DRDEBCTR",
                slcode: "DIRREMIT",
                anacode: "XXX",
                sign: paymentDirection === "R" ? "C" : "D",
                amount: parseFloat(payment.amount).toFixed(2),
                rno: payment.code || "",
                rnoId: rnoId,

                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
                SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  "DIRREMIT"
                ),
                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  "DRDEBCTR"
                ),
              });

              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: payment.chequeDate || date,
                code: "DIRREMIT",
                slcode: "DRDEBCTR",
                anacode: "",
                sign: paymentDirection === "R" ? "D" : "C",
                amount: parseFloat(payment.amount).toFixed(2),
                rno: "",
                rnoId: rnoId,

                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
                SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  "DRDEBCTR"
                ),
                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  "DIRREMIT"
                ),
              });
            } else {
              // Regular payment entries
              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: payment.chequeDate || date,
                code: AdvSett,
                slcode: PartyCode?.vCode || "",
                anacode: "XXX",
                sign: paymentDirection === "R" ? "C" : "D",
                amount: parseFloat(payment.amount).toFixed(2),
                rno: payment.code || "",
                rnoId: rnoId,

                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
                SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  PartyCode?.vCode || "0",
                  "mstCODES"
                ),
                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(AdvSett),
              });

              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: payment.chequeDate || date,
                code: payment.code || "",
                slcode: "",
                anacode: "",
                sign: paymentDirection === "R" ? "D" : "C",
                amount: parseFloat(payment.amount).toFixed(2),
                rno: payment.code !== "CASH" ? payment.chequeNo : "",
                rnoId:
                  payment.code !== "CASH"
                    ? await AdvancedSettingsUtil.getAccountIdByCode(
                        payment.chequeNo || ""
                      )
                    : "0",

                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  payment.code || ""
                ),
                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
              });
            }
          }
        }

        // Process charges from the Charges array if present
        if (Charges && Array.isArray(Charges) && Charges.length > 0) {
          // Process each charge from the Charges array
          for (const charge of Charges) {
            if (charge.value && parseFloat(charge.value) !== 0) {
              const chargeAmount = parseFloat(charge.value);
              const absAmount = Math.abs(chargeAmount);
              const operation = charge.operation || "+"; // Default to addition if not specified

              // Use the charge code directly as it's already the account code
              const accountCode = charge.account?.code || "";

              // Determine sign based on transaction type and operation
              let chargeSign;
              if (vTrntype === "B") {
                chargeSign = operation === "+" ? "D" : "C";
              } else {
                // 'S'
                chargeSign = operation === "+" ? "C" : "D";
              }

              // First entry - Charge account
              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: date,
                code: accountCode,
                slcode: "",
                anacode: "XXX",
                sign: chargeSign,
                amount: absAmount.toFixed(2),

                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  accountCode
                ),
              });

              // Corresponding entry for the party - opposite sign
              let balanceSign;
              if (vTrntype === "B") {
                balanceSign = operation === "+" ? "C" : "D";
              } else {
                // 'S'
                balanceSign = operation === "+" ? "D" : "C";
              }

              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: date,
                code: AdvSett, // Use the settlement account from settings
                slcode: PartyCode?.vCode || "",
                anacode: "XXX",
                sign: balanceSign,
                amount: absAmount.toFixed(2),

                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
                SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  PartyCode?.vCode || "0",
                  "mstCODES"
                ),
                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(AdvSett),
              });

              // Process GST on other charges if applicable
              if (charge.OtherChargeGST) {
                // CGST entry
                if (charge.othCGST && parseFloat(charge.othCGST) !== 0) {
                  const cgstAmount = parseFloat(charge.othCGST);
                  accountingEntries.push({
                    counter: CounterID.nCounterID,
                    shift: "1",
                    type: vTrnwith + vTrntype,
                    uniqid: uniqID,
                    date: date,
                    code: "CGST",
                    slcode: "",
                    anacode: "TAX",
                    sign: vTrntype === "S" ? "C" : "D",
                    amount: Math.abs(cgstAmount).toFixed(2),

                    nBranchID: nBranchID,
                    vBranchCode: vBranchCode,
                    CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                      "CGST"
                    ),
                  });
                }

                // SGST entry
                if (charge.othSGST && parseFloat(charge.othSGST) !== 0) {
                  const sgstAmount = parseFloat(charge.othSGST);
                  accountingEntries.push({
                    counter: CounterID.nCounterID,
                    shift: "1",
                    type: vTrnwith + vTrntype,
                    uniqid: uniqID,
                    date: date,
                    code: "SGST",
                    slcode: "",
                    anacode: "TAX",
                    sign: vTrntype === "S" ? "C" : "D",
                    amount: Math.abs(sgstAmount).toFixed(2),

                    nBranchID: nBranchID,
                    vBranchCode: vBranchCode,
                    CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                      "SGST"
                    ),
                  });
                }

                // IGST entry
                if (charge.othIGST && parseFloat(charge.othIGST) !== 0) {
                  const igstAmount = parseFloat(charge.othIGST);
                  accountingEntries.push({
                    counter: CounterID.nCounterID,
                    shift: "1",
                    type: vTrnwith + vTrntype,
                    uniqid: uniqID,
                    date: date,
                    code: "IGST",
                    slcode: "",
                    anacode: "TAX",
                    sign: vTrntype === "S" ? "C" : "D",
                    amount: Math.abs(igstAmount).toFixed(2),

                    nBranchID: nBranchID,
                    vBranchCode: vBranchCode,
                    CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                      "IGST"
                    ),
                  });
                }

                // GST balancing entry
                const totalGstAmount =
                  (parseFloat(charge.othCGST) || 0) +
                  (parseFloat(charge.othSGST) || 0) +
                  (parseFloat(charge.othIGST) || 0);

                if (totalGstAmount !== 0) {
                  accountingEntries.push({
                    counter: CounterID.nCounterID,
                    shift: "1",
                    type: vTrnwith + vTrntype,
                    uniqid: uniqID,
                    date: date,
                    code: "DEBCTR",
                    slcode: PartyCode?.vCode || "",
                    anacode: "TAX",
                    sign: vTrntype === "S" ? "D" : "C",
                    amount: Math.abs(totalGstAmount).toFixed(2),

                    nBranchID: nBranchID,
                    vBranchCode: vBranchCode,
                    SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                      PartyCode?.vCode || "0",
                      "mstCODES"
                    ),
                    CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                      "DEBCTR"
                    ),
                  });
                }
              }
            }
          }
        }

        // Process legacy other charges if present (for backward compatibility)
        if (OthAmt1 || OthAmt2 || OthAmt3 || OthAmt4 || OthAmt5) {
          // Process each charge that has a value
          const legacyCharges = [
            { amount: OthAmt1, accountId: OthChgID1 },
            { amount: OthAmt2, accountId: OthChgID2 },
            { amount: OthAmt3, accountId: OthChgID3 },
            { amount: OthAmt4, accountId: OthChgID4 },
            { amount: OthAmt5, accountId: OthChgID5 },
          ];

          // Process each charge
          for (const charge of legacyCharges) {
            if (
              charge.amount &&
              parseFloat(charge.amount) !== 0 &&
              charge.accountId
            ) {
              const chargeAmount = parseFloat(charge.amount);
              const absAmount = Math.abs(chargeAmount);

              // Get the account code from AccountsProfile table
              const accountDetails = await AdvancedSettingsUtil.getAccountById(
                charge.accountId
              );
              const accountCode = accountDetails.vCode || charge.accountId;

              // Determine sign based on transaction type and amount sign
              // Following the old implementation's logic
              let chargeSign;
              if (vTrntype === "B") {
                chargeSign = chargeAmount >= 0 ? "D" : "C";
              } else {
                // 'S'
                chargeSign = chargeAmount >= 0 ? "C" : "D";
              }

              // First entry - Charge account
              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: date,
                code: accountCode,
                slcode: "",
                anacode: "XXX",
                sign: chargeSign,
                amount: absAmount.toFixed(2),

                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  accountCode
                ),
              });

              // Corresponding entry for the party - opposite sign
              // Determine opposite sign for the balancing entry
              let balanceSign;
              if (vTrntype === "B") {
                balanceSign = chargeAmount >= 0 ? "C" : "D";
              } else {
                // 'S'
                balanceSign = chargeAmount >= 0 ? "D" : "C";
              }

              accountingEntries.push({
                counter: CounterID.nCounterID,
                shift: "1",
                type: vTrnwith + vTrntype,
                uniqid: uniqID,
                date: date,
                code: AdvSett, // Use the settlement account from settings
                slcode: PartyCode?.vCode || "",
                anacode: "XXX",
                sign: balanceSign,
                amount: absAmount.toFixed(2),

                nBranchID: nBranchID,
                vBranchCode: vBranchCode,
                SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
                  PartyCode?.vCode || "0",
                  "mstCODES"
                ),
                CodeId: await AdvancedSettingsUtil.getAccountIdByCode(AdvSett),
              });
            }
          }
        }

        // Process TCS if applicable
        if (TCSAMT && parseFloat(TCSAMT) !== 0) {
          accountingEntries.push({
            counter: CounterID.nCounterID,
            shift: "1",
            type: vTrnwith + vTrntype,
            uniqid: uniqID,
            date: date,
            code: "TCS",
            slcode: PartyCode?.vCode || "",
            anacode: "XXX",
            sign: vTrntype === "S" ? "C" : "D",
            amount: Math.abs(parseFloat(TCSAMT)).toFixed(2),

            nBranchID: nBranchID,
            vBranchCode: vBranchCode,
            SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
              PartyCode?.vCode || "0",
              "mstCODES"
            ),
            CodeId: await AdvancedSettingsUtil.getAccountIdByCode("TCS"),
          });

          // Corresponding entry for the party
          accountingEntries.push({
            counter: CounterID.nCounterID,
            shift: "1",
            type: vTrnwith + vTrntype,
            uniqid: uniqID,
            date: date,
            code: "DEBCTR",
            slcode: PartyCode?.vCode || "",
            anacode: "XXX",
            sign: vTrntype === "S" ? "D" : "C",
            amount: Math.abs(parseFloat(TCSAMT)).toFixed(2),

            nBranchID: nBranchID,
            vBranchCode: vBranchCode,
            SlCodeId: await AdvancedSettingsUtil.getAccountIdByCode(
              PartyCode?.vCode || "0",
              "mstCODES"
            ),
            CodeId: await AdvancedSettingsUtil.getAccountIdByCode("DEBCTR"),
          });
        }

        // Insert new entries
        if (accountingEntries.length > 0) {
          const insertQuery = `
          INSERT INTO "INTUPDTD" (
            "counter", "shift", "type", "uniqid", "date", 
            "code", "slcode", "anacode", "sign", "amount", 
            "rno", "bnktag", "Vno", "CodeId", "SlCodeId", 
            "AnaCodeId", "rnoId", "Userid", "Tdate", "nBranchID", "vBranchCode"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          )
        `;

          // Use a batch insert approach for better performance
          const batchSize = 100;
          for (let i = 0; i < accountingEntries.length; i += batchSize) {
            const batch = accountingEntries.slice(i, i + batchSize);

            // Create a transaction for each batch
            await dbClient.query("BEGIN");

            try {
              for (const entry of batch) {
                await dbClient.query(insertQuery, [
                  entry.counter,
                  entry.shift,
                  entry.type,
                  entry.uniqid,
                  entry.date,
                  entry.code,
                  entry.slcode,
                  entry.anacode,
                  entry.sign,
                  entry.amount,
                  entry.rno || "",
                  entry.bnktag || "",
                  vNo,
                  entry.CodeId || "0",
                  entry.SlCodeId || "0",
                  entry.AnaCodeId || "0",
                  entry.rnoId || "0",
                  UserID || "0",
                  new Date(),
                  entry.nBranchID,
                  entry.vBranchCode,
                ]);
              }

              await dbClient.query("COMMIT");
            } catch (error) {
              await dbClient.query("ROLLBACK");
              throw error;
            }
          }

          console.log(
            `Posted ${accountingEntries.length} accounting entries for transaction ${vNo}`
          );
        } else {
          console.log("No accounting entries to post");
        }

        console.log("\n=== Account Posting Completed ===\n");

        return {
          success: true,
          entriesCount: accountingEntries.length,
          message: `Successfully posted ${accountingEntries.length} accounting entries`,
        };
      });
    } catch (error) {
      console.error("Error posting accounting entries:", error);
      throw new DatabaseError("Failed to post accounting entries", error);
    }
  }

  // ... rest of the code remains the same ...
}

module.exports = TransactionModel;
