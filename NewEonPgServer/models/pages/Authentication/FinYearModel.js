const { BaseModel, DatabaseError } = require('../../base/BaseModel');

class FinYearModel extends BaseModel {
    static TABLE_NAME = 'yrMaster';

    static async finYearFetch() {
        try {
            const result = await this.executeQuery(
                `SELECT "nUniqCode","fromDate","tillDate" FROM "${this.TABLE_NAME}"`
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error fetching financial years', error);
        }
    }
}

module.exports = { FinYearModel };
