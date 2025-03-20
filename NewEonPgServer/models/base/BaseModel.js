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

    /**
     * Builds an advanced WHERE clause with support for various operators
     * @param {Object} conditions - Object with field conditions
     * @returns {Object} Object with whereClause string and params array
     */
    static buildAdvancedWhereClause(conditions = {}) {
        try {
            const params = [];
            const clauses = [];
            
            Object.entries(conditions).forEach(([key, value]) => {
                // Skip undefined/null values
                if (value === undefined || value === null) return;
                
                // Handle objects with operator specifications
                if (typeof value === 'object' && !Array.isArray(value)) {
                    Object.entries(value).forEach(([operator, operand]) => {
                        if (operand === undefined || operand === null) return;
                        
                        switch(operator) {
                            case 'eq':
                                params.push(operand);
                                clauses.push(`"${key}" = $${params.length}`);
                                break;
                            case 'neq':
                                params.push(operand);
                                clauses.push(`"${key}" != $${params.length}`);
                                break;
                            case 'gt':
                                params.push(operand);
                                clauses.push(`"${key}" > $${params.length}`);
                                break;
                            case 'gte':
                                params.push(operand);
                                clauses.push(`"${key}" >= $${params.length}`);
                                break;
                            case 'lt':
                                params.push(operand);
                                clauses.push(`"${key}" < $${params.length}`);
                                break;
                            case 'lte':
                                params.push(operand);
                                clauses.push(`"${key}" <= $${params.length}`);
                                break;
                            case 'like':
                                params.push(`%${operand}%`);
                                clauses.push(`"${key}" LIKE $${params.length}`);
                                break;
                            case 'startsWith':
                                params.push(`${operand}%`);
                                clauses.push(`"${key}" LIKE $${params.length}`);
                                break;
                            case 'endsWith':
                                params.push(`%${operand}`);
                                clauses.push(`"${key}" LIKE $${params.length}`);
                                break;
                            case 'in':
                                if (Array.isArray(operand) && operand.length > 0) {
                                    const placeholders = operand.map((_, i) => `$${params.length + i + 1}`).join(', ');
                                    clauses.push(`"${key}" IN (${placeholders})`);
                                    params.push(...operand);
                                }
                                break;
                            case 'between':
                                if (Array.isArray(operand) && operand.length === 2) {
                                    params.push(operand[0], operand[1]);
                                    clauses.push(`"${key}" BETWEEN $${params.length - 1} AND $${params.length}`);
                                }
                                break;
                            case 'isNull':
                                clauses.push(operand ? `"${key}" IS NULL` : `"${key}" IS NOT NULL`);
                                break;
                        }
                    });
                } else if (Array.isArray(value)) {
                    // Handle arrays as IN conditions
                    if (value.length > 0) {
                        const placeholders = value.map((_, i) => `$${params.length + i + 1}`).join(', ');
                        clauses.push(`"${key}" IN (${placeholders})`);
                        params.push(...value);
                    }
                } else {
                    // Handle simple equality
                    params.push(value);
                    clauses.push(`"${key}" = $${params.length}`);
                }
            });
            
            return {
                whereClause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
                params
            };
        } catch (error) {
            throw new DatabaseError('Failed to build advanced WHERE clause', error);
        }
    }

    /**
     * Builds a pagination clause for SQL queries
     * @param {number} page - Page number (1-based)
     * @param {number} pageSize - Number of items per page
     * @returns {Object} Object with limitClause string and offset number
     */
    static buildPaginationClause(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            return {
                limitClause: `LIMIT ${pageSize} OFFSET ${offset}`,
                offset
            };
        } catch (error) {
            throw new DatabaseError('Failed to build pagination clause', error);
        }
    }

    /**
     * Builds a search clause for text search across multiple columns
     * @param {string} searchTerm - Term to search for
     * @param {Array<string>} searchFields - Array of field names to search in
     * @returns {Object} Object with searchClause string and params array
     */
    static buildSearchClause(searchTerm, searchFields = []) {
        try {
            if (!searchTerm || !searchFields.length) {
                return { searchClause: '', params: [] };
            }
            
            const params = [];
            const clauses = searchFields.map(field => {
                params.push(`%${searchTerm}%`);
                return `"${field}" ILIKE $${params.length}`;
            });
            
            return {
                searchClause: clauses.length ? `(${clauses.join(' OR ')})` : '',
                params
            };
        } catch (error) {
            throw new DatabaseError('Failed to build search clause', error);
        }
    }

    /**
     * Gets paginated results with optional search and filtering
     * @param {Object} options - Query options
     * @param {string} options.tableName - Table name
     * @param {Array<string>} [options.selectFields=['*']] - Fields to select
     * @param {Object} [options.whereConditions={}] - Where conditions
     * @param {string} [options.searchTerm] - Search term
     * @param {Array<string>} [options.searchFields=[]] - Fields to search in
     * @param {number} [options.page=1] - Page number
     * @param {number} [options.pageSize=10] - Page size
     * @param {string} [options.orderBy] - Order by clause
     * @param {boolean} [options.countTotal=true] - Whether to count total records
     * @returns {Promise<Object>} Paginated results with metadata
     */
    static async getPaginatedResults(options = {}) {
        try {
            const {
                tableName,
                selectFields = ['*'],
                whereConditions = {},
                searchTerm,
                searchFields = [],
                page = 1,
                pageSize = 10,
                orderBy,
                countTotal = true
            } = options;
            
            if (!tableName) {
                throw new Error('tableName is required');
            }
            
            // Build select clause
            const selectClause = Array.isArray(selectFields) ? selectFields.join(', ') : selectFields;
            
            // Build where clause
            const { whereClause, params: whereParams } = this.buildAdvancedWhereClause(whereConditions);
            
            // Build search clause
            const { searchClause, params: searchParams } = this.buildSearchClause(searchTerm, searchFields);
            
            // Combine where and search clauses
            let combinedWhereClause = whereClause;
            if (searchClause) {
                combinedWhereClause = whereClause 
                    ? `${whereClause} AND ${searchClause}` 
                    : `WHERE ${searchClause}`;
            }
            
            // Build pagination clause
            const { limitClause } = this.buildPaginationClause(page, pageSize);
            
            // Build order by clause
            const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
            
            // Combine all params
            const allParams = [...whereParams, ...searchParams];
            
            // Build and execute main query
            const query = `
                SELECT ${selectClause}
                FROM "${tableName}"
                ${combinedWhereClause}
                ${orderByClause}
                ${limitClause}
            `;
            
            const results = await this.executeQuery(query, allParams);
            
            // Get total count if requested
            let totalCount = 0;
            let totalPages = 0;
            
            if (countTotal) {
                const countQuery = `
                    SELECT COUNT(*) as total
                    FROM "${tableName}"
                    ${combinedWhereClause}
                `;
                
                const countResult = await this.executeQuery(countQuery, allParams);
                totalCount = parseInt(countResult[0].total, 10);
                totalPages = Math.ceil(totalCount / pageSize);
            }
            
            return {
                data: results,
                pagination: {
                    page,
                    pageSize,
                    totalCount,
                    totalPages,
                    hasMore: page < totalPages
                }
            };
        } catch (error) {
            throw new DatabaseError('Failed to get paginated results', error);
        }
    }

    /**
     * Builds a complete SQL query with various clauses
     * @param {Object} options - Query options
     * @param {string|Array} [options.select='*'] - SELECT clause
     * @param {string} options.from - FROM clause (table name)
     * @param {Array} [options.join=[]] - JOIN clauses
     * @param {Object} [options.where={}] - WHERE conditions
     * @param {Array} [options.groupBy=[]] - GROUP BY fields
     * @param {Object} [options.having={}] - HAVING conditions
     * @param {Array} [options.orderBy=[]] - ORDER BY fields
     * @param {number} [options.limit] - LIMIT value
     * @param {number} [options.offset] - OFFSET value
     * @returns {Object} Object with query string and params array
     */
    static buildQuery(options = {}) {
        try {
            const {
                select = '*',
                from,
                join = [],
                where = {},
                groupBy = [],
                having = {},
                orderBy = [],
                limit,
                offset
            } = options;
            
            if (!from) {
                throw new Error('FROM clause is required');
            }
            
            // Build SELECT clause
            const selectClause = Array.isArray(select) ? select.join(', ') : select;
            
            // Build JOIN clauses
            const joinClauses = join.map(j => {
                const { type = 'INNER', table, on } = j;
                return `${type} JOIN ${table} ON ${on}`;
            }).join(' ');
            
            // Build WHERE clause
            const { whereClause, params } = this.buildAdvancedWhereClause(where);
            
            // Build GROUP BY clause
            const groupByClause = groupBy.length ? `GROUP BY ${groupBy.join(', ')}` : '';
            
            // Build HAVING clause
            const { whereClause: havingClause, params: havingParams } = this.buildAdvancedWhereClause(having);
            const finalHavingClause = havingClause ? havingClause.replace('WHERE', 'HAVING') : '';
            
            // Build ORDER BY clause
            const orderByClause = orderBy.length 
                ? `ORDER BY ${orderBy.map(o => typeof o === 'string' ? o : `${o.field} ${o.direction || 'ASC'}`).join(', ')}` 
                : '';
            
            // Build LIMIT and OFFSET
            const limitClause = limit !== undefined ? `LIMIT ${limit}` : '';
            const offsetClause = offset !== undefined ? `OFFSET ${offset}` : '';
            
            // Combine all parts
            const query = [
                `SELECT ${selectClause}`,
                `FROM ${from}`,
                joinClauses,
                whereClause,
                groupByClause,
                finalHavingClause,
                orderByClause,
                limitClause,
                offsetClause
            ].filter(Boolean).join(' ');
            
            // Combine all params
            const allParams = [...params, ...havingParams];
            
            return { query, params: allParams };
        } catch (error) {
            throw new DatabaseError('Failed to build query', error);
        }
    }
}

module.exports = { BaseModel, DatabaseError };
