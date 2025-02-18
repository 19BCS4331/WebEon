const { BaseModel, DatabaseError } = require('../../../base/BaseModel');

class CurrencyProfileModel extends BaseModel {
    static TABLE_NAME = 'mCurrency';
    static MASTERS_TABLE = 'MMASTERS';

    static async getAllCurrencies() {
        try {
            const result = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "bIsDeleted" = false ORDER BY "nCurrencyID"`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching currencies', error);
        }
    }

    static async getCountries() {
        try {
            const result = await this.executeQuery(
                `SELECT "vCode" FROM "${this.MASTERS_TABLE}" WHERE "vType" = 'CTRY' ORDER BY "vCode" ASC`
            );
            return result.map(row => row.vCode);
        } catch (error) {
            throw new DatabaseError('Error fetching countries', error);
        }
    }

    static async createCurrency(currencyData) {
        const {
            vCncode,
            vCnName,
            nPriority,
            nRatePer,
            nDefaultMinRate,
            nDefaultMaxRate,
            vCalculationMethod,
            nOpenRatePremium,
            nGulfDiscFactor,
            bIsActive,
            vAmexCode,
            vCountryName,
            bTradedCurrency,
            RBI_Code,
        } = currencyData;

        try {
            const result = await this.executeTransactionQuery([{
                query: `INSERT INTO "${this.TABLE_NAME}" (
                    "vCncode",
                    "vCnName",
                    "nPriority",
                    "nRatePer",
                    "nDefaultMinRate",
                    "nDefaultMaxRate",
                    "vCalculationMethod",
                    "nOpenRatePremium",
                    "nGulfDiscFactor",
                    "bIsActive",
                    "vAmexCode",
                    "vCountryName",
                    "bTradedCurrency",
                    "RBI_Code"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14) RETURNING *`,
                params: [
                    vCncode || null,
                    vCnName || null,
                    nPriority || null,
                    nRatePer || null,
                    nDefaultMinRate || null,
                    nDefaultMaxRate || null,
                    vCalculationMethod || null,
                    nOpenRatePremium || null,
                    nGulfDiscFactor || null,
                    bIsActive || null,
                    vAmexCode || null,
                    vCountryName || null,
                    bTradedCurrency || null,
                    RBI_Code || null
                ]
            }]);
            return result[0][0];
        } catch (error) {
            throw new DatabaseError('Error creating currency', error);
        }
    }

    static async updateCurrency(currencyData) {
        const {
            nCurrencyID,
            vCncode,
            vCnName,
            nPriority,
            nRatePer,
            nDefaultMinRate,
            nDefaultMaxRate,
            vCalculationMethod,
            nOpenRatePremium,
            nGulfDiscFactor,
            bIsActive,
            vAmexCode,
            vCountryName,
            bTradedCurrency,
            RBI_Code,
        } = currencyData;

        try {
            const result = await this.executeTransactionQuery([{
                query: `UPDATE "${this.TABLE_NAME}" SET
                    "vCncode" = $2,
                    "vCnName" = $3,
                    "nPriority" = $4,
                    "nRatePer" = $5,
                    "nDefaultMinRate" = $6,
                    "nDefaultMaxRate" = $7,
                    "vCalculationMethod" = $8,
                    "nOpenRatePremium" = $9,
                    "nGulfDiscFactor" = $10,
                    "bIsActive" = $11,
                    "vAmexCode" = $12,
                    "vCountryName" = $13,
                    "bTradedCurrency" = $14,
                    "RBI_Code" = $15
                WHERE "nCurrencyID" = $1 RETURNING *`,
                params: [
                    nCurrencyID,
                    vCncode || null,
                    vCnName || null,
                    nPriority || null,
                    nRatePer || null,
                    nDefaultMinRate || null,
                    nDefaultMaxRate || null,
                    vCalculationMethod || null,
                    nOpenRatePremium || null,
                    nGulfDiscFactor || null,
                    bIsActive || null,
                    vAmexCode || null,
                    vCountryName || null,
                    bTradedCurrency || null,
                    RBI_Code || null
                ]
            }]);
            return result[0][0];
        } catch (error) {
            throw new DatabaseError('Error updating currency', error);
        }
    }

    static async deleteCurrency(currencyId) {
        try {
            const result = await this.executeTransactionQuery([{
                query: `UPDATE "${this.TABLE_NAME}" SET "bIsDeleted" = true WHERE "nCurrencyID" = $1 RETURNING *`,
                params: [currencyId]
            }]);
            return result[0][0];
        } catch (error) {
            throw new DatabaseError('Error deleting currency', error);
        }
    }
}

module.exports = { CurrencyProfileModel };
