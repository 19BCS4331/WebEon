const { BaseModel, DatabaseError } = require('../../../base/BaseModel');

class DivisionProfileModel extends BaseModel {
    static TABLE_NAME = 'DivisionProfile';

    static async getAllDivisionProfiles() {
        try {
            const result = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "bIsDeleted" = false`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching division profiles', error);
        }
    }

    static async createDivisionProfile(profileData) {
        const { vDivCode, vDivName, vBranchCode } = profileData;

        try {
            // First get the nBranchID from mstCompany
            const [branchResult] = await this.executeQuery(
                `SELECT "nBranchID" from "mstCompany" WHERE "vBranchCode" = $1`,
                [vBranchCode]
            );

            if (!branchResult) {
                throw new DatabaseError('Branch code not found');
            }

            const nControlBranchID = branchResult.nBranchID;

            // Then insert the division profile with the nControlBranchID
            const [result] = await this.executeQuery(
                `INSERT INTO "${this.TABLE_NAME}" 
                ("vDivCode", "vDivName", "vBranchCode", "nControlBranchID", "bIsDeleted")
                VALUES ($1, $2, $3, $4, false)
                RETURNING *`,
                [vDivCode, vDivName, vBranchCode, nControlBranchID]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error creating division profile', error);
        }
    }

    static async updateDivisionProfile(profileData) {
        const { nDivisionID, vDivCode, vDivName, vBranchCode } = profileData;

        try {
            // First get the nBranchID from mstCompany
            const [branchResult] = await this.executeQuery(
                `SELECT "nBranchID" from "mstCompany" WHERE "vBranchCode" = $1`,
                [vBranchCode]
            );

            if (!branchResult) {
                throw new DatabaseError('Branch code not found');
            }

            const nControlBranchID = branchResult.nBranchID;

            const [result] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}"
                SET 
                    "vDivCode" = $2,
                    "vDivName" = $3,
                    "vBranchCode" = $4,
                    "nControlBranchID" = $5
                WHERE "nDivisionID" = $1 AND "bIsDeleted" = false
                RETURNING *`,
                [nDivisionID, vDivCode, vDivName, vBranchCode, nControlBranchID]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error updating division profile', error);
        }
    }

    static async deleteDivisionProfile(profileId) {
        try {
            const [result] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}"
                SET "bIsDeleted" = true
                WHERE "nDivisionID" = $1
                RETURNING *`,
                [profileId]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error deleting division profile', error);
        }
    }

    static async findByDivCode(divCode) {
        try {
            const [result] = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}"
                WHERE "vDivCode" = $1 AND "bIsDeleted" = false`,
                [divCode]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error finding division profile by code', error);
        }
    }

    static async getBranchCodes() {
        try {
            const result = await this.executeQuery(
                `SELECT "vBranchCode" as value, "vBranchCode" as label
                FROM "mstCompany" 
                WHERE "bIsdeleted" = false AND "bActive" = true`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching branch codes', error);
        }
    }
}

module.exports = { DivisionProfileModel };
