const { BaseModel, DatabaseError } = require('../../../base/BaseModel');

class UserProfileModel extends BaseModel {
    // Fetch user profile data
    static async getUserProfiles(isGroup) {
        try {
            const query = `
                SELECT 
                    "nUserID","nGroupID","vUID", "vName", "vCellNo", "vMailID", "bActive", "dValidTill", 
                    "bIsGroup", "nGroupPriority", "nBranchID", "bIsAdministrator", "bCanClearCounter", 
                    "bComplianceAuthorization", "bDataEntryAuthorization", "bCreditLimitAuthorization", 
                    "bMiscLimitAuthorization", "nCreatedBy", "dCreationDate", "nLastUpdateBy", "dLastUpdateDate", 
                    "nTrackingID", "nAPID", "bCanOptCentralM", "BDATAENTRYPRIVILEGE", "bSpecialRights", 
                    "nSanctionLimit", "bIsVerified", "nVerifyedby", "dVerifiedDate", "nDeletedby", "bIsDeleted", 
                    "dDeleteddate", "isCorporate", "CrpCode", "ref_branchlogin", "ref_finyearlogin", 
                    "bIsOrderCreation", "bIsOrderAllotment", "Permission", "Ref_BranchCode", "Ref_finyear", 
                    "Otausername", "biskeyuser", "OktaUserName", "DBName"
                FROM "mstUser"
                WHERE "bIsGroup" = $1 AND "bIsDeleted" = false;
            `;
            return await BaseModel.executeQuery(query, [isGroup]);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching user profiles', error);
        }
    }

    // Check if vUID exists
    static async checkUIDExists(vUID) {
        try {
            const query = `SELECT EXISTS (SELECT 1 FROM "mstUser" WHERE LOWER("vUID") = LOWER($1)) AS "exists"`;
            const result = await BaseModel.executeQuery(query, [vUID]);
            return result[0].exists;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error checking UID existence', error);
        }
    }

    // Check if vName exists
    static async checkNameExists(vName) {
        try {
            const query = `SELECT EXISTS (SELECT 1 FROM "mstUser" WHERE LOWER("vName") = LOWER($1)) AS "exists"`;
            const result = await BaseModel.executeQuery(query, [vName]);
            return result[0].exists;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error checking name existence', error);
        }
    }

    // Get branch options
    static async getBranchOptions() {
        try {
            const query = `
                SELECT "nBranchID","vBranchCode" 
                FROM "mstCompany" 
                WHERE "bIsdeleted"=false AND "bActive"= true
            `;
            const rows = await BaseModel.executeQuery(query);
            return rows.map(row => ({
                value: row.nBranchID,
                label: row.vBranchCode,
            }));
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching branch options', error);
        }
    }

    // Get group options
    static async getGroupOptions() {
        try {
            const query = `
                SELECT "nUserID","vName" 
                FROM "mstUser" 
                WHERE "bIsGroup" = true AND "bActive" = true
            `;
            const rows = await BaseModel.executeQuery(query);
            return rows.map(row => ({
                value: row.nUserID,
                label: row.vName,
            }));
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching group options', error);
        }
    }

    // Get all navigation items
    static async getAllNavigation() {
        try {
            const query = `
                SELECT *
                FROM "mstNavigation"
                WHERE "bIsdeleted" = FALSE
                ORDER BY "order"
            `;
            const navItems = await BaseModel.executeQuery(query);
            return this.buildNavigationTree(navItems);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching navigation items', error);
        }
    }

    // Helper method to build navigation tree
    static buildNavigationTree(items, parentId = null) {
        return items
            .filter(item => item.parent_id === parentId)
            .map(item => ({
                ...item,
                subItems: this.buildNavigationTree(items, item.id),
            }));
    }

    // Get user rights
    static async getUserRights(userID, parentId) {
        try {
            const userRightsQuery = `
                SELECT gr."nUserID", gr."nMenuID", gr."bAddRights" AS "add", gr."bModifyRights" AS "modify",
                       gr."bDeleteRights" AS "delete", gr."bViewRights" AS "view", gr."bExportRights" AS "export",
                       n."id", n."name", n."parent_id"
                FROM "mstUserRights" gr
                JOIN "mstNavigation" n ON gr."nMenuID" = n."id"
                WHERE gr."nUserID" = $1 AND n."parent_id" = $2
            `;
            const userRights = await BaseModel.executeQuery(userRightsQuery, [userID, parentId]);

            if (userRights.length === 0) {
                const userGroupQuery = `SELECT "nGroupID" FROM "mstUser" WHERE "nUserID" = $1`;
                const userGroup = await BaseModel.executeQuery(userGroupQuery, [userID]);

                if (userGroup.length === 0) {
                    throw new Error('User not found');
                }

                const groupId = userGroup[0].nGroupID;
                return await this.getGroupRights(groupId, parentId);
            }

            return userRights;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching user rights', error);
        }
    }

    // Get group rights
    static async getGroupRights(groupId, parentId) {
        try {
            const query = `
                SELECT gr."nGroupID", gr."nMenuID", gr."bAddRights" AS "add", gr."bModifyRights" AS "modify",
                       gr."bDeleteRights" AS "delete", gr."bViewRights" AS "view", gr."bExportRights" AS "export",
                       n."id", n."name", n."parent_id"
                FROM "mstGroupRights" gr
                JOIN "mstNavigation" n ON gr."nMenuID" = n."id"
                WHERE gr."nGroupID" = $1 AND n."parent_id" = $2
            `;
            return await BaseModel.executeQuery(query, [groupId, parentId]);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching group rights', error);
        }
    }

    // Update group rights
    static async updateGroupRights(groupId, parentId, rights) {
        const queryCallback = async (client) => {
            const query = `
                INSERT INTO "mstGroupRights" ("nGroupID", "nMenuID", "bAddRights", "bModifyRights", "bDeleteRights", "bViewRights", "bExportRights")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT ("nGroupID", "nMenuID")
                DO UPDATE SET
                    "bAddRights" = EXCLUDED."bAddRights",
                    "bModifyRights" = EXCLUDED."bModifyRights",
                    "bDeleteRights" = EXCLUDED."bDeleteRights",
                    "bViewRights" = EXCLUDED."bViewRights",
                    "bExportRights" = EXCLUDED."bExportRights"
            `;

            for (const menuId in rights) {
                const currentRights = rights[menuId];
                await client.query(query, [
                    groupId,
                    menuId,
                    currentRights.add,
                    currentRights.modify,
                    currentRights.delete,
                    currentRights.view,
                    currentRights.export,
                ]);
            }
        };

        try {
            await BaseModel.executeTransactionQuery(queryCallback);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error updating group rights', error);
        }
    }

    // Update user rights
    static async updateUserRights(userID, parentId, rights) {
        const queryCallback = async (client) => {
            const query = `
                INSERT INTO "mstUserRights" ("nUserID", "nMenuID", "bAddRights", "bModifyRights", "bDeleteRights", "bViewRights", "bExportRights")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT ("nUserID", "nMenuID")
                DO UPDATE SET
                    "bAddRights" = EXCLUDED."bAddRights",
                    "bModifyRights" = EXCLUDED."bModifyRights",
                    "bDeleteRights" = EXCLUDED."bDeleteRights",
                    "bViewRights" = EXCLUDED."bViewRights",
                    "bExportRights" = EXCLUDED."bExportRights"
            `;

            for (const menuId in rights) {
                const currentRights = rights[menuId];
                await client.query(query, [
                    userID,
                    menuId,
                    currentRights.add,
                    currentRights.modify,
                    currentRights.delete,
                    currentRights.view,
                    currentRights.export,
                ]);
            }
        };

        try {
            await BaseModel.executeTransactionQuery(queryCallback);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error updating user rights', error);
        }
    }

    // Get user counters
    static async getUserCounters(userId) {
        try {
            const query = `
                SELECT b."nBranchID",
                       b."nCounterID",
                       b."vBranchCode",
                       COALESCE(u."bIsActive", false) AS "bIsActive"
                FROM "mstBranchCounterLink" b
                LEFT JOIN "mstCounterUserLink" u
                    ON b."nBranchID" = u."nBranchID"
                    AND b."nCounterID" = u."nCounterID"
                    AND u."nUserID" = $1
                ORDER BY b."nBranchID" ASC, b."nCounterID" ASC;
            `;
            const rows = await BaseModel.executeQuery(query, [userId]);
            return this.formatCountersByBranch(rows);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching user counters', error);
        }
    }

    // Helper method to format counters by branch
    static formatCountersByBranch(rows) {
        return rows.reduce((acc, row) => {
            const branch = acc.find(b => b.nBranchID === row.nBranchID);
            if (branch) {
                branch.counters.push({
                    nCounterID: row.nCounterID,
                    bIsActive: row.bIsActive,
                });
            } else {
                acc.push({
                    nBranchID: row.nBranchID,
                    vBranchCode: row.vBranchCode,
                    counters: [{
                        nCounterID: row.nCounterID,
                        bIsActive: row.bIsActive,
                    }],
                });
            }
            return acc;
        }, []);
    }

    // Update counter access
    static async updateCounterAccess(userId, branchId, counterId, isActive) {
        try {
            const query = `
                INSERT INTO "mstCounterUserLink" ("nUserID", "nBranchID", "nCounterID", "bIsActive", "vBranchCode", "vUID")
                VALUES (
                    $1, 
                    $2, 
                    $3, 
                    $4, 
                    (SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2),
                    (SELECT "vUID" FROM "mstUser" WHERE "nUserID" = $1)
                )
                ON CONFLICT ("nUserID", "nBranchID", "nCounterID")
                DO UPDATE SET "bIsActive" = $4
            `;
            await BaseModel.executeQuery(query, [userId, branchId, counterId, isActive]);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error updating counter access', error);
        }
    }

    // Get branches for user
    static async getBranchesForUser() {
        try {
            const query = `SELECT "nBranchID","vBranchCode" FROM "mstCompany" WHERE "bIsdeleted" = false ORDER BY "nBranchID"`;
            return await BaseModel.executeQuery(query);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching branches', error);
        }
    }

    // Get user branch links
    static async getUserBranchLinks(userId) {
        try {
            const query = `SELECT "nBranchID", "bIsActive" FROM "mstBranchUserLink" WHERE "nUserID" = $1`;
            return await BaseModel.executeQuery(query, [userId]);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error fetching user branch links', error);
        }
    }

    // Update user branch link
    static async updateUserBranchLink(userId, branchId, isActive) {
        try {
            const query = `
                INSERT INTO "mstBranchUserLink" ("nUserID", "nBranchID", "vUID", "vBranchCode", "bIsActive")
                VALUES ($1, $2, (SELECT "vUID" FROM "mstUser" WHERE "nUserID" = $1), 
                       (SELECT "vBranchCode" FROM "mstCompany" WHERE "nBranchID" = $2), $3)
                ON CONFLICT ("nUserID", "nBranchID")
                DO UPDATE SET "vUID" = EXCLUDED."vUID", "vBranchCode" = EXCLUDED."vBranchCode", "bIsActive" = EXCLUDED."bIsActive"
            `;
            await BaseModel.executeQuery(query, [userId, branchId, isActive]);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error updating user branch link', error);
        }
    }

    // Create user profile
    static async createUserProfile(userData) {
        try {
            // Remove nUserID from userData if it exists
            const { nUserID, ...dataWithoutId } = userData;
            
            // Get the next ID using MAX
            const maxIdQuery = `SELECT COALESCE(MAX("nUserID")::integer, 0) + 1 as "nextId" FROM "mstUser"`;
            const maxIdResult = await BaseModel.executeQuery(maxIdQuery);
            const nextId = maxIdResult[0].nextId;

            // Add the generated ID to the data
            const dataToInsert = {
                nUserID: nextId,
                ...dataWithoutId
            };

            const columns = Object.keys(dataToInsert).map(key => `"${key}"`).join(', ');
            const placeholders = Object.keys(dataToInsert).map((_, index) => `$${index + 1}`).join(', ');
            const values = Object.values(dataToInsert);

            const query = `
                INSERT INTO "mstUser" (${columns})
                VALUES (${placeholders})
                RETURNING *
            `;
            const result = await BaseModel.executeQuery(query, values);
            return result[0];
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error creating user profile', error);
        }
    }

    // Update user profile
    static async updateUserProfile(nUserID, userData) {
        const updates = Object.keys(userData)
            .map((key, index) => `"${key}" = $${index + 2}`)
            .join(', ');
        const values = [nUserID, ...Object.values(userData)];

        try {
            const query = `
                UPDATE "mstUser"
                SET ${updates}
                WHERE "nUserID" = $1
                RETURNING *
            `;
            const result = await BaseModel.executeQuery(query, values);
            return result[0];
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error updating user profile', error);
        }
    }

    // Delete user profile
    static async deleteUserProfile(nUserID) {
        try {
            const query = `
                UPDATE "mstUser"
                SET "bIsDeleted" = true
                WHERE "nUserID" = $1
                RETURNING *
            `;
            const result = await BaseModel.executeQuery(query, [nUserID]);
            return result[0];
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError('Error deleting user profile', error);
        }
    }
}

module.exports = UserProfileModel;
