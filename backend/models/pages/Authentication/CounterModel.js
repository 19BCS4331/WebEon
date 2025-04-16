const { BaseModel, DatabaseError } = require('../../base/BaseModel');

class CounterModel extends BaseModel {
    static BCL_TABLE_NAME = 'mstBranchCounterLink';
    static CUL_TABLE_NAME = 'mstCounterUserLink';

    static async findCounterByBranchAndUser(vBranchCode,
        vUID,
        nBranchID,
        nUserID) {
        try {
            const result = await this.executeQuery(
                `SELECT bcl."nCounterID" 
    FROM "${this.BCL_TABLE_NAME}" AS bcl
    JOIN "${this.CUL_TABLE_NAME}" AS cul
    ON bcl."nCounterID" = cul."nCounterID"
    WHERE bcl."vBranchCode" = $1 AND cul."vUID" = $2 AND cul."nBranchID" = $3 AND cul."nUserID"= $4 AND cul."bIsActive" = true AND bcl."bIsActive" = true ORDER BY bcl."nCounterID" ASC`,
    [vBranchCode, vUID, nBranchID, nUserID]
            );
            return result;
        } catch (error) {
            throw new DatabaseError('Error finding branches by username', error);
        }
    }
}

module.exports = { CounterModel };
