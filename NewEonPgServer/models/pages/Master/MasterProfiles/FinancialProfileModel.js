const { BaseModel, DatabaseError } = require('../../../base/BaseModel');

class FinancialProfileModel extends BaseModel {
    static TABLE_NAME = 'FinancialProfile';

    static async getAllFinancialProfiles() {
        try {
            const result = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "bIsDeleted" = false ORDER BY "nFID"`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching financial profiles', error);
        }
    }

    static async createFinancialProfile(profileData) {
        const {
            vFinType,
            vFinCode,
            vFinName,
            vDefaultSign,
            nPriority
        } = profileData;

        try {
            const result = await this.executeTransactionQuery([{
                query: `INSERT INTO "${this.TABLE_NAME}" (
                    "vFinType",
                    "vFinCode",
                    "vFinName",
                    "vDefaultSign",
                    "nPriority"
                ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                params: [
                    vFinType || null,
                    vFinCode || null,
                    vFinName || null,
                    vDefaultSign || null,
                    nPriority || null
                ]
            }]);
            return result[0][0];
        } catch (error) {
            throw new DatabaseError('Error creating financial profile', error);
        }
    }

    static async updateFinancialProfile(profileData) {
        const {
            nFID,
            vFinType,
            vFinCode,
            vFinName,
            vDefaultSign,
            nPriority
        } = profileData;

        try {
            const result = await this.executeTransactionQuery([{
                query: `UPDATE "${this.TABLE_NAME}" SET
                    "vFinType" = $2,
                    "vFinCode" = $3,
                    "vFinName" = $4,
                    "vDefaultSign" = $5,
                    "nPriority" = $6
                WHERE "nFID" = $1 RETURNING *`,
                params: [
                    nFID,
                    vFinType || null,
                    vFinCode || null,
                    vFinName || null,
                    vDefaultSign || null,
                    nPriority || null
                ]
            }]);
            return result[0][0];
        } catch (error) {
            throw new DatabaseError('Error updating financial profile', error);
        }
    }

    static async deleteFinancialProfile(profileId) {
        try {
            const result = await this.executeTransactionQuery([{
                query: `UPDATE "${this.TABLE_NAME}" SET "bIsDeleted" = true WHERE "nFID" = $1 RETURNING *`,
                params: [profileId]
            }]);
            return result[0][0];
        } catch (error) {
            throw new DatabaseError('Error deleting financial profile', error);
        }
    }

    static async findByFinCode(finCode) {
        try {
            const [result] = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "vFinCode" = $1 AND "bIsDeleted" = false`,
                [finCode]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error finding financial profile by code', error);
        }
    }
}

module.exports = { FinancialProfileModel };
