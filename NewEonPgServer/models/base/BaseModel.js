const pool = require("../../config/db");

class DatabaseError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

class BaseModel {
    static async executeQuery(query, params = []) {
        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new DatabaseError(`Query execution failed: ${query}`, error);
        }
    }

    static async executeTransactionQuery(queryOrCallback) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let result;
            if (typeof queryOrCallback === 'function') {
                // Handle callback pattern
                result = await queryOrCallback(client);
            } else {
                // Handle array of queries pattern
                const results = [];
                for (const { query, params } of queryOrCallback) {
                    const queryResult = await client.query(query, params);
                    results.push(queryResult.rows);
                }
                result = results;
            }
            
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new DatabaseError('Transaction failed', error);
        } finally {
            client.release();
        }
    }

    static async generateCode(prefix, tableName, columnName) {
        try {
            // Get the current maximum code
            const query = `
                SELECT MAX(CAST(SUBSTRING(${columnName} FROM ${prefix.length + 1}) AS INTEGER)) as max_num 
                FROM "${tableName}"
                WHERE ${columnName} LIKE '${prefix}%'
            `;
            const result = await this.executeQuery(query);
            
            // Get the next number
            const maxNum = result[0]?.max_num || 0;
            const nextNum = maxNum + 1;
            
            // Format the new code with leading zeros (e.g., PAX0001)
            const paddedNum = nextNum.toString().padStart(4, '0');
            return `${prefix}${paddedNum}`;
        } catch (error) {
            throw new DatabaseError(`Failed to generate code for ${prefix}`, error);
        }
    }

    static buildWhereClause(conditions = {}) {
        const params = [];
        const clauses = [];
        
        Object.entries(conditions).forEach(([key, value], index) => {
            if (value !== undefined && value !== null) {
                params.push(value);
                clauses.push(`"${key}" = $${params.length}`);
            }
        });
        
        return {
            whereClause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
            params
        };
    }
}

module.exports = { BaseModel, DatabaseError };
