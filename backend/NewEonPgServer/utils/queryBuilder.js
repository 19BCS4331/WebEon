const buildUpdateQuery = (tableName, data, primaryKey) => {
  const columns = Object.keys(data).filter((key) => key !== primaryKey);
  const setClause = columns
    .map((col, index) => `"${col}" = $${index + 2}`)
    .join(", ");

  return {
    text: `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKey}" = $1 RETURNING *`,
    values: [data[primaryKey], ...columns.map((col) => data[col])],
  };
};

module.exports = {
  buildUpdateQuery,
};

// ___________________TESTING DYNAMIC UPDATE ROUTE________________________________________

// router.put("/:tableName", authMiddleware, async (req, res) => {
//   const { tableName } = req.params;
//   const tableConfig = tableConfigs[tableName];

//   if (!tableConfig) {
//     return res.status(400).json({ error: "Invalid table name" });
//   }

//   try {
//     const query = buildUpdateQuery(
//       tableConfig.tableName,
//       req.body,
//       tableConfig.primaryKey
//     );

//     const result = await pool.query(query.text, query.values);

//     if (result.rowCount === 0) {
//       return res.status(404).json({
//         error: `No ${tableConfig.tableName} record found with ID ${
//           req.body[tableConfig.primaryKey]
//         }`,
//       });
//     }

//     res.status(200).json({
//       message: `${tableConfig.tableName} updated successfully`,
//       data: result.rows[0],
//     });
//   } catch (error) {
//     console.error(`Error updating ${tableConfig.tableName}:`, error);
//     res.status(500).json({
//       error: `Error updating ${tableConfig.tableName}`,
//       details: error.message,
//     });
//   }
// });

// ___________________TESTING DYNAMIC UPDATE ROUTE________________________________________
