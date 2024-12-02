const { BaseModel, DatabaseError } = require("../../../base/BaseModel");

class TaxMasterModel extends BaseModel {
  // Get all tax masters
  static async getAllTaxes() {
    try {
      const query = 'SELECT * FROM "mstTax" WHERE "bIsDeleted" = false ORDER BY "nTaxID" ASC';
      return await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch tax masters", error);
      }
      throw error;
    }
  }

  // Get tax slabs
  static async getTaxSlabs(nTaxID = null) {
    try {
      const query = `
        SELECT * FROM "mstTaxd"
        ${nTaxID ? 'WHERE "nTaxID" = $1' : ''}
      `;
      
      return nTaxID 
        ? await this.executeQuery(query, [nTaxID])
        : await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch tax slabs", error);
      }
      throw error;
    }
  }

  // Get posting account options
  static async getPostingAccOptions() {
    try {
      const query = `
        SELECT "nAccID", "vCode", "vName", "vFinCode"  
        FROM "AccountsProfile"  
        ORDER BY "nAccID" ASC
      `;
      return await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch posting account options", error);
      }
      throw error;
    }
  }

  // Create new tax master
  static async createTax(data) {
    try {
      const insertQuery = `
        INSERT INTO "mstTax" (
          "CODE", "DESCRIPTION", "APPLYAS", "VALUE", "RETAILBUY", "RETAILSELL",
          "BULKBUY", "BULKSELL", "EEFCPRD", "EEFCCN", "ISACTIVE", "RETAILBUYSIGN",
          "RETAILSELLSIGN", "BULKBUYSIGN", "BULKSELLSIGN", "ROUNDOFF", "BIFURCATE",
          "FROMDT", "TILLDT", "TAXCHARGEDON", "ONTAXCODE", "tcSettlement",
          "prdSettlement", "tcSettlementSign", "prdSettlementSign", "SLABWISETAX",
          "ISINSTRUMENTCHG", "PRODUCTCODE", "nAccID", "RBIREFERENCERATE",
          "TXNROUNDOFF", "INVOICEAMT", "IsFeeHead", "nTrackingID", "nCreatedBy",
          "dCreatedDate", "nLastUpdatedby", "dLastUpdatedDate", "bIsVerified",
          "nVerifiedby", "dVerifiedDate", "bIsDeleted", "nDeletedBy", "dDeletedDate"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
          $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
          $42, $43, $44
        )
        RETURNING *
      `;

      const params = [
        data.CODE, data.DESCRIPTION, data.APPLYAS, data.VALUE, data.RETAILBUY,
        data.RETAILSELL, data.BULKBUY, data.BULKSELL, data.EEFCPRD, data.EEFCCN,
        data.ISACTIVE, data.RETAILBUYSIGN, data.RETAILSELLSIGN, data.BULKBUYSIGN,
        data.BULKSELLSIGN, data.ROUNDOFF, data.BIFURCATE, data.FROMDT, data.TILLDT,
        data.TAXCHARGEDON, data.ONTAXCODE, data.tcSettlement, data.prdSettlement,
        data.tcSettlementSign, data.prdSettlementSign, data.SLABWISETAX,
        data.ISINSTRUMENTCHG, data.PRODUCTCODE, data.nAccID, data.RBIREFERENCERATE,
        data.TXNROUNDOFF, data.INVOICEAMT, data.IsFeeHead, data.nTrackingID,
        data.nCreatedBy, data.dCreatedDate, data.nLastUpdatedby, data.dLastUpdatedDate,
        data.bIsVerified, data.nVerifiedby, data.dVerifiedDate, data.bIsDeleted,
        data.nDeletedBy, data.dDeletedDate
      ];

      const result = await this.executeTransactionQuery([{ query: insertQuery, params }]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to create tax master", error);
      }
      throw error;
    }
  }

  // Update tax master
  static async updateTax(data) {
    try {
      const updateQuery = `
        UPDATE "mstTax" SET 
          "CODE" = $2, "DESCRIPTION" = $3, "APPLYAS" = $4, "VALUE" = $5,
          "RETAILBUY" = $6, "RETAILSELL" = $7, "BULKBUY" = $8, "BULKSELL" = $9,
          "EEFCPRD" = $10, "EEFCCN" = $11, "ISACTIVE" = $12, "RETAILBUYSIGN" = $13,
          "RETAILSELLSIGN" = $14, "BULKBUYSIGN" = $15, "BULKSELLSIGN" = $16,
          "ROUNDOFF" = $17, "BIFURCATE" = $18, "FROMDT" = $19, "TILLDT" = $20,
          "TAXCHARGEDON" = $21, "ONTAXCODE" = $22, "tcSettlement" = $23,
          "prdSettlement" = $24, "tcSettlementSign" = $25, "prdSettlementSign" = $26,
          "SLABWISETAX" = $27, "ISINSTRUMENTCHG" = $28, "PRODUCTCODE" = $29,
          "nAccID" = $30, "RBIREFERENCERATE" = $31, "TXNROUNDOFF" = $32,
          "INVOICEAMT" = $33, "IsFeeHead" = $34, "nTrackingID" = $35,
          "nCreatedBy" = $36, "dCreatedDate" = $37, "nLastUpdatedby" = $38,
          "dLastUpdatedDate" = $39, "bIsVerified" = $40, "nVerifiedby" = $41,
          "dVerifiedDate" = $42, "bIsDeleted" = $43, "nDeletedBy" = $44,
          "dDeletedDate" = $45
        WHERE "nTaxID" = $1
        RETURNING *
      `;

      const params = [
        data.nTaxID, data.CODE, data.DESCRIPTION, data.APPLYAS, data.VALUE,
        data.RETAILBUY, data.RETAILSELL, data.BULKBUY, data.BULKSELL,
        data.EEFCPRD, data.EEFCCN, data.ISACTIVE, data.RETAILBUYSIGN,
        data.RETAILSELLSIGN, data.BULKBUYSIGN, data.BULKSELLSIGN,
        data.ROUNDOFF, data.BIFURCATE, data.FROMDT, data.TILLDT,
        data.TAXCHARGEDON, data.ONTAXCODE, data.tcSettlement,
        data.prdSettlement, data.tcSettlementSign, data.prdSettlementSign,
        data.SLABWISETAX, data.ISINSTRUMENTCHG, data.PRODUCTCODE,
        data.nAccID, data.RBIREFERENCERATE, data.TXNROUNDOFF,
        data.INVOICEAMT, data.IsFeeHead, data.nTrackingID,
        data.nCreatedBy, data.dCreatedDate, data.nLastUpdatedby,
        data.dLastUpdatedDate, data.bIsVerified, data.nVerifiedby,
        data.dVerifiedDate, data.bIsDeleted, data.nDeletedBy,
        data.dDeletedDate
      ];

      const result = await this.executeTransactionQuery([{ query: updateQuery, params }]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update tax master", error);
      }
      throw error;
    }
  }

  // Delete tax master (soft delete)
  static async deleteTax(nTaxID) {
    try {
      const query = `
        UPDATE "mstTax"
        SET "bIsDeleted" = true
        WHERE "nTaxID" = $1
      `;

      await this.executeTransactionQuery([{ query, params: [nTaxID] }]);
      return { message: "Tax master deleted successfully" };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to delete tax master", error);
      }
      throw error;
    }
  }

  // Create tax slab
  static async createTaxSlab(data) {
    try {
      const insertQuery = `
        INSERT INTO "mstTaxd"
        ("nTaxID", "SRNO", "FROMAMT", "TOAMT", "VALUE", "BASEVALUE")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await this.executeTransactionQuery([{
        query: insertQuery,
        params: [
          data.nTaxID,
          data.SRNO,
          data.FROMAMT,
          data.TOAMT,
          data.VALUE,
          data.BASEVALUE
        ]
      }]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to create tax slab", error);
      }
      throw error;
    }
  }

  // Update tax slab
  static async updateTaxSlab(data) {
    try {
      const updateQuery = `
        UPDATE "mstTaxd"
        SET "SRNO" = $2, "FROMAMT" = $3, "TOAMT" = $4, "VALUE" = $5, "BASEVALUE" = $6, "nTaxID" = $7
        WHERE "nTaxIdD" = $1
        RETURNING *
      `;

      const result = await this.executeTransactionQuery([{
        query: updateQuery,
        params: [
          data.nTaxIdD,
          data.SRNO,
          data.FROMAMT,
          data.TOAMT,
          data.VALUE,
          data.BASEVALUE,
          data.nTaxID
        ]
      }]);
      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update tax slab", error);
      }
      throw error;
    }
  }

  // Delete tax slabs
  static async deleteTaxSlabs(nTaxID) {
    try {
      const deleteQuery = `
        DELETE FROM "mstTaxd"
        WHERE "nTaxID" = $1
      `;

      await this.executeTransactionQuery([{ query: deleteQuery, params: [nTaxID] }]);
      return { message: "Tax slabs deleted successfully" };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to delete tax slabs", error);
      }
      throw error;
    }
  }
}

module.exports = TaxMasterModel;
