const { BaseModel, DatabaseError } = require("../../base/BaseModel");

class DashboardModel extends BaseModel {
  // Get dashboard statistics
  static async getDashboardStats(nBranchID, vBranchCode) {
    try {
      // Validate branch parameters
      if (!nBranchID || typeof nBranchID !== 'number' || nBranchID <= 0) {
        throw new DatabaseError('Branch ID must be a positive number');
      }
      if (!vBranchCode || typeof vBranchCode !== 'string' || vBranchCode.trim().length === 0) {
        throw new DatabaseError('Branch Code must be a non-empty string');
      }

      // Clean branch parameters
      const branchId = Math.floor(nBranchID); // Ensure integer
      const branchCode = vBranchCode.trim(); // Remove whitespace
      // Get today's date range
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      // Get start of last month for comparison
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString();

      // Get total transactions and volume
      const statsQuery = `
        SELECT 
          COUNT(*) as "totalTransactions",
          COALESCE(SUM("Amount"), 0) as "totalVolume",
          COALESCE(AVG("Amount"), 0) as "avgTransactionValue"
        FROM "Transact"
        WHERE "date" >= $1
        AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        AND "nBranchID" = $2
        AND "vBranchCode" = $3
      `;

      // Get previous month's volume for growth calculation
      const prevMonthQuery = `
        SELECT COALESCE(SUM("Amount"), 0) as "prevMonthVolume"
        FROM "Transact"
        WHERE "date" >= $1 AND "date" < $2
        AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        AND "nBranchID" = $3
        AND "vBranchCode" = $4
      `;

      // Get today's transactions by type
      const todayTransactionsQuery = `
        SELECT 
          "vTrntype" as "currency",
          COUNT(*) as "value",
          COALESCE(SUM("Amount"), 0) as "volume"
        FROM "Transact"
        WHERE "date" >= $1 AND "date" < $2
        AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        AND "nBranchID" = $3
        AND "vBranchCode" = $4
        GROUP BY "vTrntype"
      `;

      // Get recent transactions (last 7 days)
      const recentTransactionsQuery = `
        SELECT 
          DATE("date") as "date",
          COALESCE(SUM("Amount"), 0) as "amount"
        FROM "Transact"
        WHERE "date" >= $1
        AND ("bIsDeleted" = false OR "bIsDeleted" IS NULL)
        AND "nBranchID" = $2
        AND "vBranchCode" = $3
        GROUP BY DATE("date")
        ORDER BY "date" DESC
        LIMIT 7
      `;

      // Get currency rates
      const currencyRatesQuery = `
        SELECT DISTINCT ON ("CnCode")
          "CnCode" as "currency",
          CAST("Rate" AS DECIMAL(10,2)) as "rate"
        FROM "APIrates"
        WHERE "Rate" IS NOT NULL
        ORDER BY "CnCode"
      `;

      // Execute all queries in parallel
      const [
        statsResult,
        prevMonthResult,
        todayTransactions,
        recentTransactions,
        currencyRates
      ] = await Promise.all([
        this.executeQuery(statsQuery, [lastMonth, branchId, branchCode]),
        this.executeQuery(prevMonthQuery, [lastMonth, today.toISOString(), branchId, branchCode]),
        this.executeQuery(todayTransactionsQuery, [startOfToday, endOfToday, branchId, branchCode]),
        this.executeQuery(recentTransactionsQuery, [new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString(), branchId, branchCode]),
        this.executeQuery(currencyRatesQuery)
      ]);

      // Calculate growth percentage
      const currentVolume = statsResult[0].totalVolume;
      const prevVolume = prevMonthResult[0].prevMonthVolume;
      const growth = prevVolume > 0 ? ((currentVolume - prevVolume) / prevVolume) * 100 : 0;

      // Format numeric values in results
      const formattedTodayTransactions = todayTransactions.map(t => ({
        ...t,
        type: t.currency,
        value: parseInt(t.value),
        volume: parseFloat(t.volume)
      }));

      const formattedRecentTransactions = recentTransactions.map(t => ({
        ...t,
        amount: parseFloat(t.amount)
      }));

      const formattedCurrencyRates = currencyRates.map(r => ({
        ...r,
        rate: parseFloat(r.rate)
      }));

      return {
        stats: {
          totalTransactions: parseInt(statsResult[0].totalTransactions),
          totalVolume: parseFloat(statsResult[0].totalVolume || 0),
          avgTransactionValue: parseFloat(statsResult[0].avgTransactionValue || 0),
          growth: parseFloat(growth.toFixed(2))
        },
        todayTransactions: formattedTodayTransactions,
        recentTransactions: formattedRecentTransactions,
        currencyRates: formattedCurrencyRates
      };
    } catch (error) {
      // Handle specific database errors
      if (error.code === '23503') { // Foreign key violation
        throw new DatabaseError('Invalid branch reference');
      } else if (error.code === '22P02') { // Invalid text representation
        throw new DatabaseError('Invalid data type in query parameters');
      } else if (error instanceof DatabaseError) {
        throw error;
      } else {
        throw new DatabaseError("Failed to fetch dashboard statistics", error);
      }
    }
  }
}

module.exports = DashboardModel;
