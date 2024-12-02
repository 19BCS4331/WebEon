const { BaseModel, DatabaseError } = require("../../../base/BaseModel");

class MasterPurposeModel extends BaseModel {
  // Get all purposes
  static async getAllPurposes() {
    try {
      const query = `
        SELECT * FROM "MstPurpose"
        WHERE "bIsDeleted" = false OR "bIsDeleted" IS NULL
        ORDER BY "nPurposeID"
      `;
      return await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch purposes", error);
      }
      throw error;
    }
  }

  // Create new purpose
  static async createPurpose(data) {
    try {
      const insertQuery = `
        INSERT INTO "MstPurpose" (
          "vTrnWith", "vTrnType", "TrnSubType", "PurposeCode",
          "Description", "StatutoryCode", "CashExpLimit", "CashExpCurrencyCode",
          "SubPurposeApp", "isActive", "nTrackingID", "nCreatedBy",
          "dCreationDate", "nLastUpdateBy", "dLastUpdateDate", "bIsVerified",
          "nVerifiedBy", "dVerifiedDate", "nDeletedBy", "bIsDeleted", "dDeletedDate"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
          CURRENT_TIMESTAMP, $13, CURRENT_TIMESTAMP, $14, $15, $16, $17, false, $18)
        RETURNING *
      `;

      const params = [
        data.vTrnWith,
        data.vTrnType,
        data.TrnSubType,
        data.PurposeCode,
        data.Description,
        data.StatutoryCode,
        data.CashExpLimit,
        data.CashExpCurrencyCode,
        data.SubPurposeApp,
        data.isActive,
        data.nTrackingID,
        data.nCreatedBy,
        data.nLastUpdateBy,
        data.bIsVerified,
        data.nVerifiedBy,
        data.dVerifiedDate,
        data.nDeletedBy,
        data.dDeletedDate
      ];

      const result = await this.executeTransactionQuery([
        { query: insertQuery, params }
      ]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to create purpose", error);
      }
      throw error;
    }
  }

  // Update purpose
  static async updatePurpose(data) {
    try {
      const updateQuery = `
        UPDATE "MstPurpose"
        SET 
          "vTrnWith" = $2,
          "vTrnType" = $3,
          "TrnSubType" = $4,
          "PurposeCode" = $5,
          "Description" = $6,
          "StatutoryCode" = $7,
          "CashExpLimit" = $8,
          "CashExpCurrencyCode" = $9,
          "SubPurposeApp" = $10,
          "isActive" = $11,
          "nTrackingID" = $12,
          "nLastUpdateBy" = $13,
          "dLastUpdateDate" = CURRENT_TIMESTAMP,
          "bIsVerified" = $14,
          "nVerifiedBy" = $15,
          "dVerifiedDate" = $16
        WHERE "nPurposeID" = $1
        RETURNING *
      `;

      const params = [
        data.nPurposeID,
        data.vTrnWith,
        data.vTrnType,
        data.TrnSubType,
        data.PurposeCode,
        data.Description,
        data.StatutoryCode,
        data.CashExpLimit,
        data.CashExpCurrencyCode,
        data.SubPurposeApp,
        data.isActive,
        data.nTrackingID,
        data.nLastUpdateBy,
        data.bIsVerified,
        data.nVerifiedBy,
        data.dVerifiedDate
      ];

      const result = await this.executeTransactionQuery([
        { query: updateQuery, params }
      ]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update purpose", error);
      }
      throw error;
    }
  }

  // Delete purpose (soft delete)
  static async deletePurpose(nPurposeID, nDeletedBy) {
    try {
      const deleteQuery = `
        UPDATE "MstPurpose"
        SET 
          "bIsDeleted" = true,
          "nDeletedBy" = $2,
          "dDeletedDate" = CURRENT_TIMESTAMP
        WHERE "nPurposeID" = $1
        RETURNING *
      `;

      const result = await this.executeTransactionQuery([
        { query: deleteQuery, params: [nPurposeID, nDeletedBy] }
      ]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to delete purpose", error);
      }
      throw error;
    }
  }
}

module.exports = MasterPurposeModel;
