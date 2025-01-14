const { BaseModel, DatabaseError } = require("../../../base/BaseModel");

class AdvSettingsModel extends BaseModel {
    static async getAdvSettings(nBranchID) {
        try {
            return await this.executeQuery(
                `SELECT * FROM "advsettings" 
                WHERE "nBranchID" = $1 
                AND "SETTINGCATEGORY" != '' 
                ORDER BY "DATACODE"`,
                [nBranchID]
            );
        } catch (error) {
            throw new DatabaseError("Error fetching advanced settings", error);
        }
    }

    static async updateAdvSettings(nBranchID, settings) {
        if (!Array.isArray(settings) || settings.length === 0) {
            throw new DatabaseError("No settings to update");
        }

        try {
            return await this.executeTransactionQuery(async (client) => {
                // Update each setting within the transaction
                for (const setting of settings) {
                    const { ID, DATAVALUE } = setting;
                    await client.query(
                        `UPDATE "advsettings" 
                        SET "DATAVALUE" = $1 
                        WHERE "ID" = $2 
                        AND "nBranchID" = $3`,
                        [DATAVALUE, ID, nBranchID]
                    );
                }
                return { message: "Settings updated successfully" };
            });
        } catch (error) {
            throw new DatabaseError("Error updating advanced settings", error);
        }
    }
}

module.exports = AdvSettingsModel;
