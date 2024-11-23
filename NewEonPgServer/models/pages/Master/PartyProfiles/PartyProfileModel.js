const { BaseModel } = require("../../../base/BaseModel");

class PartyProfileModel extends BaseModel {
    constructor() {
        super();
        this.tableName = "mstCODES";
        this.primaryKey = "nCodesID";
    }

    /**
     * Get all party profiles of a specific type
     * @param {string} vType - The type of party profile (e.g., 'CC', 'FF', 'AD', 'RM')
     * @returns {Promise<Array>} Array of party profiles
     */
    async getPartyProfiles(vType) {
        const query = `
            SELECT * FROM "mstCODES"
            WHERE "vType" = $1
            AND "bActive" = true
            AND "bIsDeleted" = false
            ORDER BY "nCodesID"
        `;
        const result = await BaseModel.executeQuery(query, [vType]);
        return result;
    }

    /**
     * Create a new party profile
     * @param {Object} data - Party profile data
     * @returns {Promise<Object>} Created party profile
     */
    async createPartyProfile(data) {
        try {
            // List of valid columns in mstCODES table
            const validColumns = [
                'vCode', 'vName', 'vBranchCode', 'dIntdate', 'bActive', 'bIND',
                'vAddress1', 'vAddress2', 'vAddress3', 'vPinCode', 'vPhone', 'vFax',
                'vEmail', 'vDesign', 'vGrpcode', 'vEntityType', 'vBusinessNature',
                'bSaleParty', 'bPurchaseParty', 'bEEFCClient', 'bPrintAddress',
                'vLocation', 'vWebsite', 'vCreditPolicy', 'nCREDITLIM', 'nCREDITDAYS',
                'nAddCreditLimit', 'nAddCreditDays', 'nTxnSaleLimit', 'nTxnPurLimit',
                'nChqTxnlimt', 'vKYCApprovalNumber', 'vKYCRiskCategory', 'nHandlingCharges',
                'bTDSDED', 'nTDSPER', 'vTDSGroup', 'bServiceTax', 'cGSTNO', 'sGSTNO',
                'iGSTNO', 'vState', 'AccHolderName', 'BankName', 'AccNumber', 'IFSCCode',
                'BankAddress', 'CancelledChequecopy', 'vPanName', 'dPanDOB', 'vPan',
                'bIGSTOnly', 'nMrktExecutive', 'nBranchID', 'dBlockDate', 'dEstblishDate',
                'Remarks', 'vRegno', 'dRegdate', 'bExportParty', 'bEnforcement', 'vType'
            ];

            // Filter out invalid columns
            const filteredData = Object.keys(data)
                .filter(key => validColumns.includes(key))
                .reduce((obj, key) => {
                    obj[key] = data[key];
                    return obj;
                }, {});

            const columns = Object.keys(filteredData).map(key => `"${key}"`).join(',');
            const values = Object.values(filteredData);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
            
            const query = `
                INSERT INTO "mstCODES" (${columns})
                VALUES (${placeholders})
                RETURNING *
            `;

            const result = await BaseModel.executeTransactionQuery(async (client) => {
                const res = await client.query(query, values);
                return res.rows[0];
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update an existing party profile
     * @param {number} nCodesID - ID of the party profile to update
     * @param {Object} data - Updated party profile data
     * @returns {Promise<Object>} Updated party profile
     */
    async updatePartyProfile(nCodesID, data) {
        try {
            // List of valid columns in mstCODES table
            const validColumns = [
                'vCode', 'vName', 'vBranchCode', 'dIntdate', 'bActive', 'bIND',
                'vAddress1', 'vAddress2', 'vAddress3', 'vPinCode', 'vPhone', 'vFax',
                'vEmail', 'vDesign', 'vGrpcode', 'vEntityType', 'vBusinessNature',
                'bSaleParty', 'bPurchaseParty', 'bEEFCClient', 'bPrintAddress',
                'vLocation', 'vWebsite', 'vCreditPolicy', 'nCREDITLIM', 'nCREDITDAYS',
                'nAddCreditLimit', 'nAddCreditDays', 'nTxnSaleLimit', 'nTxnPurLimit',
                'nChqTxnlimt', 'vKYCApprovalNumber', 'vKYCRiskCategory', 'nHandlingCharges',
                'bTDSDED', 'nTDSPER', 'vTDSGroup', 'bServiceTax', 'cGSTNO', 'sGSTNO',
                'iGSTNO', 'vState', 'AccHolderName', 'BankName', 'AccNumber', 'IFSCCode',
                'BankAddress', 'CancelledChequecopy', 'vPanName', 'dPanDOB', 'vPan',
                'bIGSTOnly', 'nMrktExecutive', 'nBranchID', 'dBlockDate', 'dEstblishDate',
                'Remarks', 'vRegno', 'dRegdate', 'bExportParty', 'bEnforcement', 'vType'
            ];

            // Filter out invalid columns
            const filteredData = Object.keys(data)
                .filter(key => validColumns.includes(key))
                .reduce((obj, key) => {
                    obj[key] = data[key];
                    return obj;
                }, {});

            const setClause = Object.keys(filteredData)
                .map((key, i) => `"${key}" = $${i + 2}`)
                .join(',');
            
            const query = `
                UPDATE "mstCODES"
                SET ${setClause}
                WHERE "nCodesID" = $1
                RETURNING *
            `;

            const result = await BaseModel.executeTransactionQuery(async (client) => {
                const res = await client.query(query, [nCodesID, ...Object.values(filteredData)]);
                return res.rows[0];
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Soft delete a party profile
     * @param {number} nCodesID - ID of the party profile to delete
     * @returns {Promise<Object>} Deleted party profile
     */
    async deletePartyProfile(nCodesID) {
        const query = `
            UPDATE "mstCODES"
            SET "bIsDeleted" = true
            WHERE "nCodesID" = $1
            RETURNING *
        `;
        const result = await BaseModel.executeTransactionQuery(async (client) => {
            const res = await client.query(query, [nCodesID]);
            return res.rows[0];
        });
        return result;
    }

    /**
     * Get group options for a specific type
     * @param {string} vType - The type of group options to get
     * @returns {Promise<Array>} Array of group options
     */
    async getGroupOptions(vType) {
        const query = `
            SELECT * FROM "mstGroup"
            WHERE "vGrptype" = $1
        `;
        const result = await BaseModel.executeQuery(query, [vType]);
        return result.map(row => ({
            value: row.vCode,
            label: row.vName
        }));
    }

    async getBranchOptions() {
        const query = `
            SELECT "nBranchID","vBranchCode" FROM "mstCompany" WHERE "bIsdeleted"= false
        `;
        const result = await BaseModel.executeQuery(query);
        return result.map(row => ({
            value: row.nBranchID,
            label: row.vBranchCode
        }));
    }

    async getEntityOptions() {
        const query = `
            SELECT * from "MMASTERS" where "vType" = 'ES' ORDER BY "nMasterID" ASC
        `;
        const result = await BaseModel.executeQuery(query);
        return result.map(row => ({
            value: row.vCode,
            label: row.vDescription
        }));
    }

    async getEntityOptionsAD() {
        const query = `
            SELECT * from "MMASTERS" where "vDescription" = 'PUBLIC SECTOR BANK' ORDER BY "nMasterID" ASC
        `;
        const result = await BaseModel.executeQuery(query);
        return result.map(row => ({
            value: row.vCode,
            label: row.vDescription
        }));
    }

    async getBankNatureOptions() {
        const query = `
            SELECT * from "MMASTERS" where "vType" = 'BN' ORDER BY "nMasterID" ASC
        `;
        const result = await BaseModel.executeQuery(query);
        return result.map(row => ({
            value: row.vCode,
            label: row.vDescription
        }));
    }

    async getStateOptions() {
        const query = `
            SELECT * FROM "MMASTERS" 
            WHERE "vType" = 'ST' 
            ORDER BY "nMasterID" ASC
        `;
        const result = await BaseModel.executeQuery(query);
        return result.map(row => ({
            value: row.vCode,
            label: row.vDescription
        }));
    }

    async getMarketExecutiveOptions() {
        const query = `
            SELECT * FROM "mstCODES"
            WHERE "vType" = 'ME'
            AND "bActive" = true
            AND "bIsDeleted" = false
            ORDER BY "nCodesID"
        `;
        const result = await BaseModel.executeQuery(query);
        return result.map(row => ({
            value: row.nCodesID,
            label: `${row.vCode} - ${row.vName}`
        }));
    }
}

module.exports = new PartyProfileModel();
