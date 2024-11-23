const { BaseModel, DatabaseError } = require('../../base/BaseModel');

class BranchModel extends BaseModel {
    static TABLE_NAME = 'mstBranchUserLink';

    static async findBranchByUsername(username) {
        try {
            const result = await this.executeQuery(
                `SELECT "nBranchID","vBranchCode" FROM "${this.TABLE_NAME}" 
                WHERE "vUID" = $1 AND "bIsActive" = true 
                ORDER BY "nBranchID" ASC`,
                [username]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error finding branches by username', error);
        }
    }
}

module.exports = { BranchModel };
