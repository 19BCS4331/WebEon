const {BaseModel,DatabaseError} = require("../../../base/BaseModel");

class SubPurposeModel extends BaseModel {
  // Get all sub purposes
  static async getAllSubPurposes() {
    try {
      const query = `
        SELECT sp.*, mp."TrnSubType", mp."PurposeCode"
        FROM "SubPurpose" sp
        LEFT JOIN "MstPurpose" mp ON sp."MstPurposeID" = mp."nPurposeID"
        WHERE sp."bIsDeleted" = false OR sp."bIsDeleted" IS NULL
        ORDER BY sp."SubPurposeID"
      `;
      return await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch sub purposes", error);
      }
      throw error;
    }
  }

  // Get master purpose options
  static async getMasterPurposeOptions() {
    try {
      const query = `
        SELECT "nPurposeID" as value, 
               CONCAT("TrnSubType", ' - ', "Description") as label
        FROM "MstPurpose"
        WHERE "bIsDeleted" = false OR "bIsDeleted" IS NULL
        ORDER BY "nPurposeID"
      `;
      return await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch master purpose options", error);
      }
      throw error;
    }
  }

  // Create new sub purpose
  static async createSubPurpose(data) {
    try {
      const query = `
        INSERT INTO "SubPurpose" (
          "MstPurposeID", "SubPurposeCode", "SubDescription", 
          "StatutoryCode", "nTrackingID", "nCreatedBy", 
          "dCreationDate", "bIsVerified", "bIsDeleted"
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, false, false)
        RETURNING *
      `;
      const values = [
        data.MstPurposeID,
        data.SubPurposeCode,
        data.SubDescription,
        data.StatutoryCode,
        data.nTrackingID,
        data.nCreatedBy
      ];
      return await this.executeQuery(query, values);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to create sub purpose", error);
      }
      throw error;
    }
  }

  // Update sub purpose
  static async updateSubPurpose(data) {
    try {
      const query = `
        UPDATE "SubPurpose"
        SET 
          "MstPurposeID" = $1,
          "SubPurposeCode" = $2,
          "SubDescription" = $3,
          "StatutoryCode" = $4,
          "nTrackingID" = $5,
          "nLastUpdateBy" = $6,
          "dLastUpdateDate" = CURRENT_TIMESTAMP
        WHERE "SubPurposeID" = $7
        RETURNING *
      `;
      const values = [
        data.MstPurposeID,
        data.SubPurposeCode,
        data.SubDescription,
        data.StatutoryCode,
        data.nTrackingID,
        data.nLastUpdateBy,
        data.SubPurposeID
      ];
      return await this.executeQuery(query, values);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update sub purpose", error);
      }
      throw error;
    }
  }

  // Soft delete sub purpose
  static async deleteSubPurpose(data) {
    try {
      const query = `
        UPDATE "SubPurpose"
        SET 
          "bIsDeleted" = true,
          "nDeletedBy" = $1,
          "dDeletedDate" = CURRENT_TIMESTAMP
        WHERE "SubPurposeID" = $2
        RETURNING *
      `;
      const values = [data.nDeletedBy, data.SubPurposeID];
      return await this.executeQuery(query, values);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to delete sub purpose", error);
      }
      throw error;
    }
  }
}

module.exports = SubPurposeModel;
