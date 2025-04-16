const { BaseModel, DatabaseError } = require('../../../base/BaseModel');

class AccountsProfileModel extends BaseModel {
    static TABLE_NAME = 'AccountsProfile';

    static parseInput(value, type = 'string') {
        if (value === '' || value === null || value === undefined) {
            return null;
        }
        
        switch (type) {
            case 'integer':
                return value === '' ? null : parseInt(value, 10) || null;
            case 'boolean':
                return value === '' ? null : Boolean(value);
            default:
                return value;
        }
    }

    static async getAllAccountsProfiles() {
        try {
            const result = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "bIsDeleted" = false`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching accounts profiles', error);
        }
    }

    static async createAccountsProfile(profileData) {
        const {
            nDivisionID,
            vCode,
            vName,
            vAddress1,
            vAddress2,
            vAddress3,
            vCity,
            vState,
            vPinCode,
            vPhone,
            vEmail,
            vGSTIN,
            bDoSales,
            bDoReceipts,
            bDoPayments,
            bActive,
            bCMSBank,
            bDirectRemit,
            vBranchCode
        } = profileData;

        try {
            const parsedData = {
                nDivisionID: this.parseInput(nDivisionID, 'integer'),
                vCode: this.parseInput(vCode),
                vName: this.parseInput(vName),
                vAddress1: this.parseInput(vAddress1),
                vAddress2: this.parseInput(vAddress2),
                vAddress3: this.parseInput(vAddress3),
                vCity: this.parseInput(vCity),
                vState: this.parseInput(vState),
                vPinCode: this.parseInput(vPinCode),
                vPhone: this.parseInput(vPhone),
                vEmail: this.parseInput(vEmail),
                vGSTIN: this.parseInput(vGSTIN),
                bDoSales: this.parseInput(bDoSales, 'boolean'),
                bDoReceipts: this.parseInput(bDoReceipts, 'boolean'),
                bDoPayments: this.parseInput(bDoPayments, 'boolean'),
                bActive: this.parseInput(bActive, 'boolean'),
                bCMSBank: this.parseInput(bCMSBank, 'boolean'),
                bDirectRemit: this.parseInput(bDirectRemit, 'boolean'),
                vBranchCode: this.parseInput(vBranchCode)
            };

            const [result] = await this.executeQuery(
                `INSERT INTO "${this.TABLE_NAME}" (
                    "nDivisionID",
                    "vCode",
                    "vName",
                    "vAddress1",
                    "vAddress2",
                    "vAddress3",
                    "vCity",
                    "vState",
                    "vPinCode",
                    "vPhone",
                    "vEmail",
                    "vGSTIN",
                    "bDoSales",
                    "bDoReceipts",
                    "bDoPayments",
                    "bActive",
                    "bCMSBank",
                    "bDirectRemit",
                    "vBranchCode"
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19
                ) RETURNING *`,
                [
                    parsedData.nDivisionID,
                    parsedData.vCode,
                    parsedData.vName,
                    parsedData.vAddress1,
                    parsedData.vAddress2,
                    parsedData.vAddress3,
                    parsedData.vCity,
                    parsedData.vState,
                    parsedData.vPinCode,
                    parsedData.vPhone,
                    parsedData.vEmail,
                    parsedData.vGSTIN,
                    parsedData.bDoSales,
                    parsedData.bDoReceipts,
                    parsedData.bDoPayments,
                    parsedData.bActive,
                    parsedData.bCMSBank,
                    parsedData.bDirectRemit,
                    parsedData.vBranchCode
                ]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error creating accounts profile', error);
        }
    }

    static async updateAccountsProfile(profileData) {
        const {
            nAccID,
            nDivisionID,
            vCode,
            vName,
            vAddress1,
            vAddress2,
            vAddress3,
            vCity,
            vState,
            vPinCode,
            vPhone,
            vEmail,
            vGSTIN,
            bDoSales,
            bDoReceipts,
            bDoPayments,
            bActive,
            bCMSBank,
            bDirectRemit,
            vBranchCode
        } = profileData;

        try {
            const parsedData = {
                nAccID: this.parseInput(nAccID, 'integer'),
                nDivisionID: this.parseInput(nDivisionID, 'integer'),
                vCode: this.parseInput(vCode),
                vName: this.parseInput(vName),
                vAddress1: this.parseInput(vAddress1),
                vAddress2: this.parseInput(vAddress2),
                vAddress3: this.parseInput(vAddress3),
                vCity: this.parseInput(vCity),
                vState: this.parseInput(vState),
                vPinCode: this.parseInput(vPinCode),
                vPhone: this.parseInput(vPhone),
                vEmail: this.parseInput(vEmail),
                vGSTIN: this.parseInput(vGSTIN),
                bDoSales: this.parseInput(bDoSales, 'boolean'),
                bDoReceipts: this.parseInput(bDoReceipts, 'boolean'),
                bDoPayments: this.parseInput(bDoPayments, 'boolean'),
                bActive: this.parseInput(bActive, 'boolean'),
                bCMSBank: this.parseInput(bCMSBank, 'boolean'),
                bDirectRemit: this.parseInput(bDirectRemit, 'boolean'),
                vBranchCode: this.parseInput(vBranchCode)
            };

            const [result] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}" SET
                    "nDivisionID" = $1,
                    "vCode" = $2,
                    "vName" = $3,
                    "vAddress1" = $4,
                    "vAddress2" = $5,
                    "vAddress3" = $6,
                    "vCity" = $7,
                    "vState" = $8,
                    "vPinCode" = $9,
                    "vPhone" = $10,
                    "vEmail" = $11,
                    "vGSTIN" = $12,
                    "bDoSales" = $13,
                    "bDoReceipts" = $14,
                    "bDoPayments" = $15,
                    "bActive" = $16,
                    "bCMSBank" = $17,
                    "bDirectRemit" = $18,
                    "vBranchCode" = $19
                WHERE "nAccID" = $20 AND "bIsDeleted" = false
                RETURNING *`,
                [
                    parsedData.nDivisionID,
                    parsedData.vCode,
                    parsedData.vName,
                    parsedData.vAddress1,
                    parsedData.vAddress2,
                    parsedData.vAddress3,
                    parsedData.vCity,
                    parsedData.vState,
                    parsedData.vPinCode,
                    parsedData.vPhone,
                    parsedData.vEmail,
                    parsedData.vGSTIN,
                    parsedData.bDoSales,
                    parsedData.bDoReceipts,
                    parsedData.bDoPayments,
                    parsedData.bActive,
                    parsedData.bCMSBank,
                    parsedData.bDirectRemit,
                    parsedData.vBranchCode,
                    parsedData.nAccID
                ]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error updating accounts profile', error);
        }
    }

    static async deleteAccountsProfile(profileId) {
        try {
            const parsedId = this.parseInput(profileId, 'integer');
            const [result] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}"
                SET "bIsDeleted" = true
                WHERE "nAccID" = $1
                RETURNING *`,
                [parsedId]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error deleting accounts profile', error);
        }
    }
}

module.exports = { AccountsProfileModel };
