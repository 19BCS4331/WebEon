const { BaseModel, DatabaseError } = require('../../../base/BaseModel');

class FinancialSubProfileModel extends BaseModel {
    static TABLE_NAME = 'FinancialSubProfile';

    static async getAllFinancialSubProfiles() {
        try {
            const result = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "bIsDeleted" = false`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching financial sub profiles', error);
        }
    }

    static async createFinancialSubProfile(profileData) {
        const { nFID, vSubFinCode, vSubFinName, nPriority } = profileData;

        try {
            const [result] = await this.executeQuery(
                `INSERT INTO "${this.TABLE_NAME}" 
                ("nFID", "vSubFinCode", "vSubFinName", "nPriority", "bIsDeleted")
                VALUES ($1, $2, $3, $4, false)
                RETURNING *`,
                [nFID, vSubFinCode, vSubFinName, nPriority]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error creating financial sub profile', error);
        }
    }

    static async updateFinancialSubProfile(profileData) {
        const { nSFID, nFID, vSubFinCode, vSubFinName, nPriority } = profileData;

        try {
            const [result] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}"
                SET 
                    "nFID" = $2,
                    "vSubFinCode" = $3,
                    "vSubFinName" = $4,
                    "nPriority" = $5
                WHERE "nSFID" = $1 AND "bIsDeleted" = false
                RETURNING *`,
                [nSFID, nFID, vSubFinCode, vSubFinName, nPriority]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error updating financial sub profile', error);
        }
    }

    static async deleteFinancialSubProfile(profileId) {
        try {
            const [result] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}"
                SET "bIsDeleted" = true
                WHERE "nSFID" = $1
                RETURNING *`,
                [profileId]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error deleting financial sub profile', error);
        }
    }

    static async findByFinCode(finType) {
        try {
            const result = await this.executeQuery(
                `SELECT DISTINCT fp."vFinCode" as value, fp."vFinCode" as label
                FROM "${this.TABLE_NAME}" fsp
                JOIN "FinancialProfile" fp ON fp."nFID" = fsp."nFID"
                WHERE fp."vFinType" = $1 AND fsp."bIsDeleted" = false`,
                [finType]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error finding financial sub profile by code', error);
        }
    }
}

module.exports = { FinancialSubProfileModel };
