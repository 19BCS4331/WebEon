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
