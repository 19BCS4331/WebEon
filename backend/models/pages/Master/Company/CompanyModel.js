const { BaseModel } = require("../../../../base/BaseModel");

class CompanyModel extends BaseModel {
    constructor() {
        super();
        this.tableName = "mstCompany";
        this.primaryKey = "nBranchID";
    }

    /**
     * Get all company profiles
     * @returns {Promise<Array>} Array of company profiles
     */
    async getCompanyProfiles() {
        const query = `
            SELECT * FROM "mstCompany"
            WHERE "bIsdeleted" = false
            ORDER BY "nBranchID"
        `;
        const result = await BaseModel.executeQuery(query);
        return result;
    }

    /**
     * Create a new company profile
     * @param {Object} data - Company profile data
     * @returns {Promise<Object>} Created company profile
     */
    async createCompanyProfile(data) {
        const columns = Object.keys(data).map(key => `"${key}"`).join(',');
        const values = Object.keys(data).map((_, i) => `$${i + 1}`).join(',');
        const query = `
            INSERT INTO "mstCompany" (${columns})
            VALUES (${values})
            RETURNING *
        `;

        const result = await BaseModel.executeTransactionQuery(async (client) => {
            const res = await client.query(query, Object.values(data));
            return res.rows[0];
        });
        return result;
    }

    /**
     * Update an existing company profile
     * @param {number} nBranchID - ID of the company profile to update
     * @param {Object} data - Updated company profile data
     * @returns {Promise<Object>} Updated company profile
     */
    async updateCompanyProfile(nBranchID, data) {
        const setClause = Object.keys(data)
            .map((key, i) => `"${key}" = $${i + 2}`)
            .join(',');
        
        const query = `
            UPDATE "mstCompany"
            SET ${setClause}
            WHERE "nBranchID" = $1
            RETURNING *
        `;

        const result = await BaseModel.executeTransactionQuery(async (client) => {
            const res = await client.query(query, [nBranchID, ...Object.values(data)]);
            return res.rows[0];
        });
        return result;
    }

    /**
     * Soft delete a company profile
     * @param {number} nBranchID - ID of the company profile to delete
     * @returns {Promise<Object>} Deleted company profile
     */
    async deleteCompanyProfile(nBranchID) {
        const query = `
            UPDATE "mstCompany"
            SET "bIsdeleted" = true
            WHERE "nBranchID" = $1
            RETURNING *
        `;
        const result = await BaseModel.executeTransactionQuery(async (client) => {
            const res = await client.query(query, [nBranchID]);
            return res.rows[0];
        });
        return result;
    }

    /**
     * Get company options
     * @returns {Promise<Array>} Array of company options
     */
    async getCompanyOptions() {
        try {
            const query = `
                SELECT "nBranchID", "vBranchCode"
                FROM "mstCompany"
                WHERE "bIsdeleted" = false
                ORDER BY "nBranchID"
            `;
            const result = await BaseModel.executeQuery(query);
            return result.map(row => ({
                value: row.nBranchID,
                label: row.vBranchCode
            }));
        } catch (error) {
            throw new DatabaseError('Error fetching company options', error);
        }
    }
}

module.exports = {
    CompanyModel
};
