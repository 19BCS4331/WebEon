const { BaseModel, DatabaseError } = require("../../../base/BaseModel");

class CounterMasterModel extends BaseModel {
  // Get all counters
  static async getAllCounters() {
    try {
      const query = `
        SELECT * FROM "mstCounter" 
        WHERE "bIsDeleted" = false 
        ORDER BY "nCounterID" ASC
      `;
      return await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch counters", error);
      }
      throw error;
    }
  }

  // Create new counter
  static async createCounter(data) {
    try {
      const insertQuery = `
        INSERT INTO "mstCounter" (
          "vCounterID", "vCounterName", "vDescription", "Remark",
          "bIsActive", "nCreatedBy", "dCreationDate", "nLastUpdateBy",
          "dLastUpdateDate", "nTrackingID", "nVerifiedBy", "dVerifiedDate",
          "bIsVierified", "bIsDeleted", "nDeletedBY", "dDeletedDate"
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, CURRENT_TIMESTAMP, $8, $9, $10, $11, false, $12, $13)
        RETURNING *
      `;

      const params = [
        data.vCounterID,
        data.vCounterName,
        data.vDescription,
        data.Remark,
        data.bIsActive,
        data.nCreatedBy,
        data.nLastUpdateBy,
        data.nTrackingID,
        data.nVerifiedBy,
        data.dVerifiedDate,
        data.bIsVierified,
        data.nDeletedBY,
        data.dDeletedDate
      ];

      const result = await this.executeTransactionQuery([
        { query: insertQuery, params }
      ]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to create counter", error);
      }
      throw error;
    }
  }

  // Update counter
  static async updateCounter(data) {
    try {
      const updateQuery = `
        UPDATE "mstCounter"
        SET 
          "vCounterID" = $2,
          "vCounterName" = $3,
          "vDescription" = $4,
          "Remark" = $5,
          "bIsActive" = $6,
          "nLastUpdateBy" = $7,
          "dLastUpdateDate" = CURRENT_TIMESTAMP,
          "nTrackingID" = $8,
          "nVerifiedBy" = $9,
          "dVerifiedDate" = $10,
          "bIsVierified" = $11
        WHERE "nCounterID" = $1
        RETURNING *
      `;

      const params = [
        data.nCounterID,
        data.vCounterID,
        data.vCounterName,
        data.vDescription,
        data.Remark,
        data.bIsActive,
        data.nLastUpdateBy,
        data.nTrackingID,
        data.nVerifiedBy,
        data.dVerifiedDate,
        data.bIsVierified
      ];

      const result = await this.executeTransactionQuery([
        { query: updateQuery, params }
      ]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update counter", error);
      }
      throw error;
    }
  }

  // Delete counter (soft delete)
  static async deleteCounter(nCounterID, nDeletedBy) {
    try {
      const deleteQuery = `
        UPDATE "mstCounter"
        SET 
          "bIsDeleted" = true,
          "nDeletedBY" = $2,
          "dDeletedDate" = CURRENT_TIMESTAMP
        WHERE "nCounterID" = $1
        RETURNING *
      `;

      const result = await this.executeTransactionQuery([
        { query: deleteQuery, params: [nCounterID, nDeletedBy] }
      ]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to delete counter", error);
      }
      throw error;
    }
  }
}

module.exports = CounterMasterModel;
