const { BaseModel, DatabaseError } = require('../../../base/BaseModel');

class DivisionDetailsModel extends BaseModel {
    static TABLE_NAME = 'DivisionProfileDetails';

    static parseInput(value, type = 'string') {
        if (value === '' || value === null || value === undefined) {
            return null;
        }
        
        switch (type) {
            case 'integer':
                return value === '' ? null : parseInt(value, 10) || null;
            default:
                return value;
        }
    }

    static async getAllDivisionDetails() {
        try {
            const result = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "bIsDeleted" = false`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching division details', error);
        }
    }

    static async createDivisionDetails(detailsData) {
        const { vDivCode, nNo_of_Emp, vHeadDept, vContactH, nAreaManagerID, vContactAM,IsActive,nBranchID,vBranchCode } = detailsData;

        try {
            // First get the nDivisionID from DivisionProfile
            const [divisionResult] = await this.executeQuery(
                `SELECT "nDivisionID" FROM "DivisionProfile" WHERE "vDivCode" = $1`,
                [vDivCode]
            );

            if (!divisionResult) {
                throw new DatabaseError('Division code not found');
            }

            const nDivisionID = divisionResult.nDivisionID;

            // Parse integer fields
            const parsedData = {
                nNo_of_Emp: this.parseInput(nNo_of_Emp, 'integer'),
                nAreaManagerID: this.parseInput(nAreaManagerID, 'integer'),
                vHeadDept: this.parseInput(vHeadDept),
                vContactH: this.parseInput(vContactH),
                vContactAM: this.parseInput(vContactAM),
                IsActive: this.parseInput(IsActive, 'boolean'),
                nBranchID: this.parseInput(nBranchID, 'integer'),
                vBranchCode: this.parseInput(vBranchCode)
            };

            await this.executeQuery(
                `INSERT INTO "${this.TABLE_NAME}" 
                ("nDivisionID", "vDivCode", "nNo_of_Emp", "vHeadDept", "vContactH", "nAreaManagerID", "vContactAM", "bIsDeleted", "IsActive", "nBranchID", "vBranchCode")
                VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9, $10)`,
                [
                    nDivisionID, 
                    vDivCode,
                    parsedData.nNo_of_Emp,
                    parsedData.vHeadDept,
                    parsedData.vContactH,
                    parsedData.nAreaManagerID,
                    parsedData.vContactAM,
                    parsedData.IsActive,
                    parsedData.nBranchID,
                    parsedData.vBranchCode
                ]
            );
            return true;
        } catch (error) {
            throw new DatabaseError('Error creating division details', error);
        }
    }

    static async updateDivisionDetails(detailsData) {
        const { nDivProDtlID, vDivCode, nNo_of_Emp, vHeadDept, vContactH, nAreaManagerID, vContactAM,IsActive,nBranchID,vBranchCode } = detailsData;

        try {
            // First get the nDivisionID from DivisionProfile
            const [divisionResult] = await this.executeQuery(
                `SELECT "nDivisionID" FROM "DivisionProfile" WHERE "vDivCode" = $1`,
                [vDivCode]
            );

            if (!divisionResult) {
                throw new DatabaseError('Division code not found');
            }

            const nDivisionID = divisionResult.nDivisionID;

            // Parse integer fields
            const parsedData = {
                nDivProDtlID: this.parseInput(nDivProDtlID, 'integer'),
                nNo_of_Emp: this.parseInput(nNo_of_Emp, 'integer'),
                nAreaManagerID: this.parseInput(nAreaManagerID, 'integer'),
                vHeadDept: this.parseInput(vHeadDept),
                vContactH: this.parseInput(vContactH),
                vContactAM: this.parseInput(vContactAM),
                IsActive: this.parseInput(IsActive, 'boolean'),
                nBranchID: this.parseInput(nBranchID, 'integer'),
                vBranchCode: this.parseInput(vBranchCode)
            };

            await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}"
                SET 
                    "nDivisionID" = $2,
                    "vDivCode" = $3,
                    "nNo_of_Emp" = $4,
                    "vHeadDept" = $5,
                    "vContactH" = $6,
                    "nAreaManagerID" = $7,
                    "vContactAM" = $8,
                    "IsActive" = $9,
                    "nBranchID" = $10,
                    "vBranchCode" = $11
                WHERE "nDivProDtlID" = $1 AND "bIsDeleted" = false`,
                [
                    parsedData.nDivProDtlID,
                    nDivisionID,
                    vDivCode,
                    parsedData.nNo_of_Emp,
                    parsedData.vHeadDept,
                    parsedData.vContactH,
                    parsedData.nAreaManagerID,
                    parsedData.vContactAM,
                    parsedData.IsActive,
                    parsedData.nBranchID,
                    parsedData.vBranchCode
                ]
            );
            return true;
        } catch (error) {
            throw new DatabaseError('Error updating division details', error);
        }
    }

    static async deleteDivisionDetails(detailsId) {
        try {
            const parsedId = this.parseInput(detailsId, 'integer');
            await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}"
                SET "bIsDeleted" = true
                WHERE "nDivProDtlID" = $1`,
                [parsedId]
            );
            return true;
        } catch (error) {
            throw new DatabaseError('Error deleting division details', error);
        }
    }

    static async getDivisionCodes() {
        try {
            const result = await this.executeQuery(
                `SELECT "vDivCode" as value, "vDivCode" as label
                FROM "DivisionProfile" 
                WHERE "bIsDeleted" = false`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching division codes', error);
        }
    }
}

module.exports = { DivisionDetailsModel };
