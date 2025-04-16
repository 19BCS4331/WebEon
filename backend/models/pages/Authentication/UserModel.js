const { BaseModel, DatabaseError } = require('../../base/BaseModel');

class UserModel extends BaseModel {
    static TABLE_NAME = 'mstUser';

    static async findUserByUsername(username) {
        try {
            const [user] = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "vUID" = $1`,
                [username]
            );
            return user;
        } catch (error) {
            throw new DatabaseError('Error finding user by username', error);
        }
    }

    static async findUserById(userId) {
        try {
            const [user] = await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "nUserID" = $1`,
                [userId]
            );
            return user;
        } catch (error) {
            throw new DatabaseError('Error finding user by ID', error);
        }
    }

    static async createUser(userData) {
        const { username, hashedPassword, isAdmin, bIsGroup, bActive, name } = userData;
        try {
            const [user] = await this.executeQuery(
                `INSERT INTO "${this.TABLE_NAME}" ("vUID", "vPassword", "bIsAdministrator", "bIsGroup", "bActive", "vName")
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [username, hashedPassword, isAdmin, bIsGroup, bActive, name]
            );
            return user;
        } catch (error) {
            throw new DatabaseError('Error creating user', error);
        }
    }

    static async updateUserToken(userId, token) {
        try {
            await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}" SET token = $1 WHERE "nUserID" = $2`,
                [token, userId]
            );
        } catch (error) {
            throw new DatabaseError('Error updating user token', error);
        }
    }

    static async updateUserPassword(userId, hashedPassword) {
        try {
            const [user] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}" SET "vPassword" = $1 WHERE "nUserID" = $2 RETURNING *`,
                [hashedPassword, userId]
            );
            return user;
        } catch (error) {
            throw new DatabaseError('Error updating user password', error);
        }
    }

    static async getUsersByGroup(groupId) {
        try {
            return await this.executeQuery(
                `SELECT * FROM "${this.TABLE_NAME}" WHERE "nGroupID" = $1 AND "bIsdeleted" = false`,
                [groupId]
            );
        } catch (error) {
            throw new DatabaseError('Error fetching users by group', error);
        }
    }

    static async updateUserStatus(userId, isActive) {
        try {
            const [user] = await this.executeQuery(
                `UPDATE "${this.TABLE_NAME}" SET "bActive" = $1 WHERE "nUserID" = $2 RETURNING *`,
                [isActive, userId]
            );
            return user;
        } catch (error) {
            throw new DatabaseError('Error updating user status', error);
        }
    }
}

// For backward compatibility
const {
    findUserByUsername,
    findUserById,
    createUser,
    updateUserToken,
    updateUserPassword
} = UserModel;

module.exports = {
    UserModel,
    // Exported functions for backward compatibility
    findUserByUsername,
    findUserById,
    createUser,
    updateUserToken,
    updateUserPassword
};
