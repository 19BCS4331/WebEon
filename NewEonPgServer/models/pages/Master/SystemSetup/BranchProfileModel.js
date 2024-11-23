const { BaseModel, DatabaseError } = require("../../../base/BaseModel");

class BranchProfileModel extends BaseModel {
    static async getAllBranchProfiles() {
        try {
            return await this.executeQuery(
                'SELECT * FROM "mstCompany" WHERE "bIsdeleted" = false ORDER BY "nBranchID" ASC'
            );
        } catch (error) {
            throw new DatabaseError("Error fetching branch profiles", error);
        }
    }

    static async createBranchProfile(data) {
        try {
            const {
                nCompID, vBranchCode, vAddress1, vAddress2, vAddress3, vOperationalGrp,
                vLocation, vCity, vPinCode, STDCode, vTelNo1, vTelNo2, vFaxNo1,
                vFaxNo2, vEmailID, nLocationType, vContactPerson, vContactPersonNo,
                nOperationalUserID, nAccountUSERID, vAIINO, vWUAIINo,
                bServiceTaxApplicable, vServiceTaxRegNo, vRBILicenseNo, dRBIRegDate,
                vAuthorizedSignatory, nReportingBranchID, nWUBranchID, nCashLimit,
                vIBMNo1, vIBMNo2, bActive, nBranchIBMID, bHasShifts, nLastTCSettRefNo,
                nCurrencyLimit, ntempCashLimit, ntempCurrencyLimit
            } = data;

            const vCityValue = vCity?.value || null;

            return await this.executeTransactionQuery(async (client) => {
                const result = await client.query(
                    `INSERT INTO "mstCompany" (
                        "nCompID", "vBranchCode", "vAddress1", "vAddress2", "vAddress3",
                        "vOperationalGrp", "vLocation", "vCity", "vPinCode", "STDCode",
                        "vTelNo1", "vTelNo2", "vFaxNo1", "vFaxNo2", "vEmailID",
                        "nLocationType", "vContactPerson", "vContactPersonNo",
                        "nOperationalUserID", "nAccountUSERID", "vAIINO", "vWUAIINo",
                        "bServiceTaxApplicable", "vServiceTaxRegNo", "vRBILicenseNo",
                        "dRBIRegDate", "vAuthorizedSignatory", "nReportingBranchID",
                        "nWUBranchID", "nCashLimit", "vIBMNo1", "vIBMNo2", "bActive",
                        "nBranchIBMID", "bHasShifts", "nLastTCSettRefNo", "nCurrencyLimit",
                        "ntempCashLimit", "ntempCurrencyLimit"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                            $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39)
                    RETURNING *`,
                    [
                        nCompID, vBranchCode, vAddress1, vAddress2, vAddress3,
                        vOperationalGrp, vLocation, vCityValue, vPinCode, STDCode,
                        vTelNo1, vTelNo2, vFaxNo1, vFaxNo2, vEmailID, nLocationType,
                        vContactPerson, vContactPersonNo, nOperationalUserID,
                        nAccountUSERID, vAIINO, vWUAIINo, bServiceTaxApplicable,
                        vServiceTaxRegNo, vRBILicenseNo, dRBIRegDate,
                        vAuthorizedSignatory, nReportingBranchID, nWUBranchID,
                        nCashLimit, vIBMNo1, vIBMNo2, bActive, nBranchIBMID,
                        bHasShifts, nLastTCSettRefNo, nCurrencyLimit,
                        ntempCashLimit, ntempCurrencyLimit
                    ]
                );
                return result.rows[0];
            });
        } catch (error) {
            throw new DatabaseError("Error creating branch profile", error);
        }
    }

    static async updateBranchProfile(data) {
        try {
            const {
                nBranchID, vBranchCode, vAddress1, vAddress2, vAddress3,
                vOperationalGrp, vLocation, vCity, vPinCode, STDCode, vTelNo1,
                vTelNo2, vFaxNo1, vFaxNo2, vEmailID, nLocationType,
                vContactPerson, vContactPersonNo, nOperationalUserID,
                nAccountUSERID, vAIINO, vWUAIINo, bServiceTaxApplicable,
                vServiceTaxRegNo, vRBILicenseNo, dRBIRegDate,
                vAuthorizedSignatory, nReportingBranchID, nWUBranchID,
                nCashLimit, vIBMNo1, vIBMNo2, bActive, nBranchIBMID,
                bHasShifts, nLastTCSettRefNo, nCurrencyLimit,
                ntempCashLimit, ntempCurrencyLimit
            } = data;

            const vCityValue = vCity?.value || null;

            return await this.executeTransactionQuery(async (client) => {
                const result = await client.query(
                    `UPDATE "mstCompany"
                    SET "vBranchCode"=$2, "vAddress1"=$3, "vAddress2"=$4,
                        "vAddress3"=$5, "vOperationalGrp"=$6, "vLocation"=$7,
                        "vCity"=$8, "vPinCode"=$9, "STDCode"=$10, "vTelNo1"=$11,
                        "vTelNo2"=$12, "vFaxNo1"=$13, "vFaxNo2"=$14, "vEmailID"=$15,
                        "nLocationType"=$16, "vContactPerson"=$17, "vContactPersonNo"=$18,
                        "nOperationalUserID"=$19, "nAccountUSERID"=$20, "vAIINO"=$21,
                        "vWUAIINo"=$22, "bServiceTaxApplicable"=$23,
                        "vServiceTaxRegNo"=$24, "vRBILicenseNo"=$25, "dRBIRegDate"=$26,
                        "vAuthorizedSignatory"=$27, "nReportingBranchID"=$28,
                        "nWUBranchID"=$29, "nCashLimit"=$30, "vIBMNo1"=$31,
                        "vIBMNo2"=$32, "bActive"=$33, "nBranchIBMID"=$34,
                        "bHasShifts"=$35, "nLastTCSettRefNo"=$36, "nCurrencyLimit"=$37,
                        "ntempCashLimit"=$38, "ntempCurrencyLimit"=$39
                    WHERE "nBranchID" = $1
                    RETURNING *`,
                    [
                        nBranchID, vBranchCode, vAddress1, vAddress2, vAddress3,
                        vOperationalGrp, vLocation, vCityValue, vPinCode, STDCode,
                        vTelNo1, vTelNo2, vFaxNo1, vFaxNo2, vEmailID, nLocationType,
                        vContactPerson, vContactPersonNo, nOperationalUserID,
                        nAccountUSERID, vAIINO, vWUAIINo, bServiceTaxApplicable,
                        vServiceTaxRegNo, vRBILicenseNo, dRBIRegDate,
                        vAuthorizedSignatory, nReportingBranchID, nWUBranchID,
                        nCashLimit, vIBMNo1, vIBMNo2, bActive, nBranchIBMID,
                        bHasShifts, nLastTCSettRefNo, nCurrencyLimit,
                        ntempCashLimit, ntempCurrencyLimit
                    ]
                );

                if (result.rows.length === 0) {
                    throw new DatabaseError("Branch profile not found");
                }

                return result.rows[0];
            });
        } catch (error) {
            throw new DatabaseError("Error updating branch profile", error);
        }
    }

    static async deleteBranchProfile(nBranchID) {
        try {
            const result = await this.executeQuery(
                `UPDATE "mstCompany"
                SET "bIsdeleted" = true
                WHERE "nBranchID" = $1
                RETURNING *`,
                [nBranchID]
            );

            if (result.length === 0) {
                throw new DatabaseError("Branch profile not found");
            }

            return result[0];
        } catch (error) {
            throw new DatabaseError("Error deleting branch profile", error);
        }
    }
}

module.exports = BranchProfileModel;
