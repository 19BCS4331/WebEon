const {BaseModel,DatabaseError} = require("../../../base/BaseModel");

class AD1MasterModel extends BaseModel {
    static TABLE_NAME = "ADIProviderMast";

    static formatValue(value) {
        switch (typeof value) {
            case "string":
                return value.trim();
            case "boolean":
                return value;
            case "number":
                return value;
            default:
                return value;
        }
    }

    // CRUD Operations
    static async getAllAD1Masters() {
        try {
            const result = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "bIsDeleted" = false ORDER BY "id"`
            );
            return result;
        } catch (error) {
            throw new DatabaseError("Error fetching AD1 masters", error);
        }
    }

    static async createAD1Master(data) {
        const {
            vCode,
            dIntdate,
            vName,
            vAddress1,
            vLocation,
            vPhone,
            vFax,
            vEmail,
            vWebsite,
            vCommRcvbl,
            vCommAccount,
            vStaxAccount,
            divfactor,
            ADType,
            vServiceChargeAcc,
            bLvalue
        } = data;

        try {
            const result = await this.executeQuery(
                `INSERT INTO "${this.TABLE_NAME}" (
                    "vCode",
                    "dIntdate",
                    "vName",
                    "vAddress1",
                    "vLocation",
                    "vPhone",
                    "vFax",
                    "vEmail",
                    "vWebsite",
                    "vCommRcvbl",
                    "vCommAccount",
                    "vStaxAccount",
                    "divfactor",
                    "ADType",
                    "vServiceChargeAcc",
                    "bLvalue",
                    "dCreationDate",
                    "bIsDeleted"
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, false
                ) RETURNING *`,
                [
                    this.formatValue(vCode),
                    dIntdate,
                    this.formatValue(vName),
                    this.formatValue(vAddress1),
                    this.formatValue(vLocation),
                    this.formatValue(vPhone),
                    this.formatValue(vFax),
                    this.formatValue(vEmail),
                    this.formatValue(vWebsite),
                    this.formatValue(vCommRcvbl),
                    this.formatValue(vCommAccount),
                    this.formatValue(vStaxAccount),
                    divfactor,
                    this.formatValue(ADType),
                    this.formatValue(vServiceChargeAcc),
                    bLvalue
                ]
            );
            return result[0];
        } catch (error) {
            throw new DatabaseError("Error creating AD1 master", error);
        }
    }

    static async updateAD1Master(id, data) {
        const {
            vCode,
            dIntdate,
            vName,
            vAddress1,
            vLocation,
            vPhone,
            vFax,
            vEmail,
            vWebsite,
            vCommRcvbl,
            vCommAccount,
            vStaxAccount,
            divfactor,
            ADType,
            vServiceChargeAcc,
            bLvalue
        } = data;

        try {
            const result = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}" SET
                    "vCode" = $1,
                    "dIntdate" = $2,
                    "vName" = $3,
                    "vAddress1" = $4,
                    "vLocation" = $5,
                    "vPhone" = $6,
                    "vFax" = $7,
                    "vEmail" = $8,
                    "vWebsite" = $9,
                    "vCommRcvbl" = $10,
                    "vCommAccount" = $11,
                    "vStaxAccount" = $12,
                    "divfactor" = $13,
                    "ADType" = $14,
                    "vServiceChargeAcc" = $15,
                    "bLvalue" = $16,
                    "dModifyDate" = CURRENT_TIMESTAMP
                WHERE "id" = $17 AND "bIsDeleted" = false
                RETURNING *`,
                [
                    this.formatValue(vCode),
                    dIntdate,
                    this.formatValue(vName),
                    this.formatValue(vAddress1),
                    this.formatValue(vLocation),
                    this.formatValue(vPhone),
                    this.formatValue(vFax),
                    this.formatValue(vEmail),
                    this.formatValue(vWebsite),
                    this.formatValue(vCommRcvbl),
                    this.formatValue(vCommAccount),
                    this.formatValue(vStaxAccount),
                    divfactor,
                    this.formatValue(ADType),
                    this.formatValue(vServiceChargeAcc),
                    bLvalue,
                    id
                ]
            );
            return result[0];
        } catch (error) {
            throw new DatabaseError("Error updating AD1 master", error);
        }
    }

    static async deleteAD1Master(id) {
        try {
            const result = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}" 
                SET "bIsDeleted" = true, 
                    "dDeleteDate" = CURRENT_TIMESTAMP 
                WHERE "id" = $1 AND "bIsDeleted" = false
                RETURNING *`,
                [id]
            );
            return result[0];
        } catch (error) {
            throw new DatabaseError("Error deleting AD1 master", error);
        }
    }
}

module.exports = {AD1MasterModel};
