const { BaseModel, DatabaseError } = require("../../../base/BaseModel");

class ProductProfileModel extends BaseModel {
  // Get all product profiles
  static async getAllProducts() {
    try {
      const query = 'SELECT * FROM "mProductM" WHERE "bIsDeleted" = false ORDER BY "nProductID" ASC';
      return await this.executeQuery(query);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch products", error);
      }
      throw error;
    }
  }

  // Get product-issuer links
  static async getProductIssuerLinks(PRODUCTCODE) {
    try {
      // Fetch all issuers
      const issuersQuery = `SELECT * FROM "mstCODES" WHERE "vType" = 'TC' ORDER BY "vCode"`;
      const issuers = await this.executeQuery(issuersQuery);

      // Fetch existing product-issuer links
      const productIssuerQuery = `SELECT * FROM "mProductIssuerLink" WHERE "PRODUCTCODE"= $1`;
      const productIssuers = await this.executeQuery(productIssuerQuery, [PRODUCTCODE]);

      // Merge data to indicate which issuers are linked
      return issuers.map((item) => {
        const link = productIssuers.find(
          (issuer) => issuer.nIssuerID === item.nCodesID
        );
        return {
          ...item,
          bIsActive: link ? link.bIsActive : false,
        };
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to fetch product-issuer links", error);
      }
      throw error;
    }
  }

  // Create new product
  static async createProduct(data) {
    try {
      const {
        PRODUCTCODE,
        DESCRIPTION,
        retailBuy,
        retailBuySeries,
        retailSell,
        retailSellSeries,
        bulkBuy,
        bulkBuySeries,
        bulkSell,
        bulkSellSeries,
        IssuerRequire,
        blankStock,
        blankStockDeno,
        isSettlement,
        vProfitAccountCode,
        vIssuerAccountCode,
        vCommAccountCode,
        vOpeningAccountCode,
        vClosingAccountCode,
        vExportAccountCode,
        vPurchaseAccountCode,
        vSaleAccountCode,
        vFakeAccountcode,
        isActive,
        Priority,
        vBulkPurchaseAccountCode,
        vBulkSaleAccountCode,
        vBulkProfitAccountCode,
        vPurRetCanAccountCode,
        vPurBlkCanAccountCode,
        vSaleRetCanAccountCode,
        vSaleBlkCanAccountCode,
        vPurchaseBranchAccountCode,
        vSaleBranchAccountCode,
        reverseProfit,
        vBrnProfitAccountCode,
        AUTOSTOCK,
        allowFractions,
        AllowMultiCard,
        RetailFees,
        COMMPERCENT,
        COMMAMT,
        AUTOSETTRATE,
        passSeparateSett,
        saleAvgSett,
        BulkFees,
        stockSplit,
        stockDenoChange,
        bReload,
        AllAddOn,
        bAskReference,
        IsAllowCancellation,
      } = data;

      const insertQuery = `
        INSERT INTO "mProductM" (
          "PRODUCTCODE", "DESCRIPTION", "retailBuy", "retailBuySeries", "retailSell",
          "retailSellSeries", "bulkBuy", "bulkBuySeries", "bulkSell", "bulkSellSeries",
          "IssuerRequire", "blankStock", "blankStockDeno", "isSettlement",
          "vProfitAccountCode", "vIssuerAccountCode", "vCommAccountCode",
          "vOpeningAccountCode", "vClosingAccountCode", "vExportAccountCode",
          "vPurchaseAccountCode", "vSaleAccountCode", "vFakeAccountcode", "isActive",
          "Priority", "vBulkPurchaseAccountCode", "vBulkSaleAccountCode",
          "vBulkProfitAccountCode", "vPurRetCanAccountCode", "vPurBlkCanAccountCode",
          "vSaleRetCanAccountCode", "vSaleBlkCanAccountCode", "vPurchaseBranchAccountCode",
          "vSaleBranchAccountCode", "reverseProfit", "vBrnProfitAccountCode",
          "AUTOSTOCK", "allowFractions", "AllowMultiCard", "RetailFees",
          "COMMPERCENT", "COMMAMT", "AUTOSETTRATE", "passSeparateSett",
          "saleAvgSett", "BulkFees", "stockSplit", "stockDenoChange",
          "bReload", "AllAddOn", "bAskReference", "IsAllowCancellation"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
          $45, $46, $47, $48, $49, $50, $51, $52
        )
        RETURNING *
      `;

      const params = [
        PRODUCTCODE, DESCRIPTION, retailBuy, retailBuySeries, retailSell,
        retailSellSeries, bulkBuy, bulkBuySeries, bulkSell, bulkSellSeries,
        IssuerRequire, blankStock, blankStockDeno, isSettlement,
        vProfitAccountCode, vIssuerAccountCode, vCommAccountCode,
        vOpeningAccountCode, vClosingAccountCode, vExportAccountCode,
        vPurchaseAccountCode, vSaleAccountCode, vFakeAccountcode, isActive,
        Priority, vBulkPurchaseAccountCode, vBulkSaleAccountCode,
        vBulkProfitAccountCode, vPurRetCanAccountCode, vPurBlkCanAccountCode,
        vSaleRetCanAccountCode, vSaleBlkCanAccountCode, vPurchaseBranchAccountCode,
        vSaleBranchAccountCode, reverseProfit, vBrnProfitAccountCode,
        AUTOSTOCK, allowFractions, AllowMultiCard, RetailFees,
        COMMPERCENT, COMMAMT, AUTOSETTRATE, passSeparateSett,
        saleAvgSett, BulkFees, stockSplit, stockDenoChange,
        bReload, AllAddOn, bAskReference, IsAllowCancellation
      ];

      const result = await this.executeTransactionQuery([
        { query: insertQuery, params }
      ]);

      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to create product", error);
      }
      throw error;
    }
  }

  // Update product
  static async updateProduct(data) {
    try {
      const updateQuery = `
        UPDATE "mProductM" SET 
          "PRODUCTCODE" = $2, "DESCRIPTION" = $3, "retailBuy" = $4,
          "retailBuySeries" = $5, "retailSell" = $6, "retailSellSeries" = $7,
          "bulkBuy" = $8, "bulkBuySeries" = $9, "bulkSell" = $10,
          "bulkSellSeries" = $11, "IssuerRequire" = $12, "blankStock" = $13,
          "blankStockDeno" = $14, "isSettlement" = $15, "vProfitAccountCode" = $16,
          "vIssuerAccountCode" = $17, "vCommAccountCode" = $18, "vOpeningAccountCode" = $19,
          "vClosingAccountCode" = $20, "vExportAccountCode" = $21, "vPurchaseAccountCode" = $22,
          "vSaleAccountCode" = $23, "vFakeAccountcode" = $24, "isActive" = $25,
          "Priority" = $26, "vBulkPurchaseAccountCode" = $27, "vBulkSaleAccountCode" = $28,
          "vBulkProfitAccountCode" = $29, "vPurRetCanAccountCode" = $30, "vPurBlkCanAccountCode" = $31,
          "vSaleRetCanAccountCode" = $32, "vSaleBlkCanAccountCode" = $33,
          "vPurchaseBranchAccountCode" = $34, "vSaleBranchAccountCode" = $35,
          "reverseProfit" = $36, "vBrnProfitAccountCode" = $37, "AUTOSTOCK" = $38,
          "allowFractions" = $39, "AllowMultiCard" = $40, "RetailFees" = $41,
          "COMMPERCENT" = $42, "COMMAMT" = $43, "AUTOSETTRATE" = $44,
          "passSeparateSett" = $45, "saleAvgSett" = $46, "BulkFees" = $47,
          "stockSplit" = $48, "stockDenoChange" = $49, "bReload" = $50,
          "AllAddOn" = $51, "bAskReference" = $52, "IsAllowCancellation" = $53,
          "nTrackingID" = $54, "nCreatedBY" = $55, "dCreatedDate" = $56,
          "nLastUpdatedBy" = $57, "dLastUpdatedDate" = $58, "bIsDeleted" = $59,
          "nDeletedBy" = $60, "dDeletedDate" = $61, "vSaleEEFCAccountCode" = $62,
          "vSaleProfitEEFCAccountCode" = $63, "vPurchaseEEFCAccountCode" = $64,
          "vEEFCAccountCode" = $65
        WHERE "nProductID" = $1
        RETURNING *
      `;

      const params = [
        data.nProductID, data.PRODUCTCODE, data.DESCRIPTION, data.retailBuy,
        data.retailBuySeries, data.retailSell, data.retailSellSeries,
        data.bulkBuy, data.bulkBuySeries, data.bulkSell, data.bulkSellSeries,
        data.IssuerRequire, data.blankStock, data.blankStockDeno,
        data.isSettlement, data.vProfitAccountCode, data.vIssuerAccountCode,
        data.vCommAccountCode, data.vOpeningAccountCode, data.vClosingAccountCode,
        data.vExportAccountCode, data.vPurchaseAccountCode, data.vSaleAccountCode,
        data.vFakeAccountcode, data.isActive, data.Priority,
        data.vBulkPurchaseAccountCode, data.vBulkSaleAccountCode,
        data.vBulkProfitAccountCode, data.vPurRetCanAccountCode,
        data.vPurBlkCanAccountCode, data.vSaleRetCanAccountCode,
        data.vSaleBlkCanAccountCode, data.vPurchaseBranchAccountCode,
        data.vSaleBranchAccountCode, data.reverseProfit, data.vBrnProfitAccountCode,
        data.AUTOSTOCK, data.allowFractions, data.AllowMultiCard,
        data.RetailFees, data.COMMPERCENT, data.COMMAMT, data.AUTOSETTRATE,
        data.passSeparateSett, data.saleAvgSett, data.BulkFees,
        data.stockSplit, data.stockDenoChange, data.bReload, data.AllAddOn,
        data.bAskReference, data.IsAllowCancellation, data.nTrackingID,
        data.nCreatedBY, data.dCreatedDate, data.nLastUpdatedBy,
        data.dLastUpdatedDate, data.bIsDeleted, data.nDeletedBy,
        data.dDeletedDate, data.vSaleEEFCAccountCode,
        data.vSaleProfitEEFCAccountCode, data.vPurchaseEEFCAccountCode,
        data.vEEFCAccountCode
      ];

      const result = await this.executeTransactionQuery([
        { query: updateQuery, params }
      ]);

      return result[0][0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update product", error);
      }
      throw error;
    }
  }

  // Update product-issuer link
  static async updateProductIssuerLink(PRODUCTCODE, nIssuerID, bIsActive) {
    try {
      const query = `
        INSERT INTO "mProductIssuerLink" ("PRODUCTCODE", "nIssuerID", "bIsActive","vIssuerCode")
        VALUES ($1, $2, $3,(SELECT "vCode" FROM "mstCODES" WHERE "nCodesID" = $2))
        ON CONFLICT ("PRODUCTCODE","nIssuerID")
        DO UPDATE SET "bIsActive" = EXCLUDED."bIsActive",
        "vIssuerCode" = (SELECT "vCode" FROM "mstCODES" WHERE "nCodesID" = $2)
      `;

      await this.executeTransactionQuery([
        { query, params: [PRODUCTCODE, nIssuerID, bIsActive] }
      ]);
      return { message: "Data updated successfully" };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to update product-issuer link", error);
      }
      throw error;
    }
  }

  // Delete product (soft delete)
  static async deleteProduct(nProductID) {
    try {
      const query = `
        UPDATE "mProductM"
        SET "bIsDeleted" = true
        WHERE "nProductID" = $1
      `;

      await this.executeTransactionQuery([
        { query, params: [nProductID] }
      ]);
      return { message: "Data deleted successfully" };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new DatabaseError("Failed to delete product", error);
      }
      throw error;
    }
  }
}

module.exports = ProductProfileModel;
