/**
 * Utility functions for handling HTTP requests
 */

/**
 * Extracts the frontend path from the request
 * Looks for the X-Frontend-Path header or a frontendPath query parameter
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} The frontend path or null if not found
 */
const getFrontendPath = (req) => {
  // First check for the custom header
  const headerPath = req.headers['x-frontend-path'];
  if (headerPath) {
    return headerPath;
  }
  
  // Then check for query parameter
  const queryPath = req.query.frontendPath;
  if (queryPath) {
    return queryPath;
  }
  
  // Finally check for body parameter (for POST/PUT requests)
  const bodyPath = req.body?.frontendPath;
  if (bodyPath) {
    return bodyPath;
  }
  
  return null;
};

/**
 * Maps API endpoints to their corresponding frontend paths
 * This is useful when the frontend path cannot be determined from the request
 * 
 * @type {Object}
 */
const endpointToPathMap = {
  // Buy/Sell Transactions
  '/pages/Transactions/transactions': '/transactions/buying-selling',
  '/pages/Transactions/transactions/nextNumber': '/transactions/buying-selling',
  '/pages/Transactions/save-transaction': '/transactions/buying-selling',
  '/pages/Transactions/update-transaction': '/transactions/buying-selling',
  '/pages/Transactions/transaction': '/transactions/buying-selling',
  
  // Transaction related endpoints
  '/pages/Transactions/getPurposeOptions': '/transactions/buying-selling',
  '/pages/Transactions/getCategoryOptions': '/transactions/buying-selling',
  '/pages/Transactions/party-type-options': '/transactions/buying-selling',
  '/pages/Transactions/nationality-options': '/transactions/buying-selling',
  '/pages/Transactions/city-options': '/transactions/buying-selling',
  '/pages/Transactions/getProductTypes': '/transactions/buying-selling',
  '/pages/Transactions/getRate': '/transactions/buying-selling',
  '/pages/Transactions/getRateWithMargin': '/transactions/buying-selling',
  '/pages/Transactions/getOtherChargeAccounts': '/transactions/buying-selling',
  '/pages/Transactions/getPaymentCodes': '/transactions/buying-selling',
  '/pages/Transactions/getPaymentCodesSell': '/transactions/buying-selling',
  '/pages/Transactions/check-balance': '/transactions/buying-selling',
  
  // Other transaction types can be added here as needed
  '/pages/Transactions/remittance': '/transactions/remittance',
  '/pages/Transactions/travellers-cheque': '/transactions/travellers-cheque',
  
  // Add more mappings as needed for other sections of the application
};

/**
 * Gets the frontend path based on the API endpoint
 * Falls back to the endpoint-to-path map if the frontend path is not in the request
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} The frontend path or null if not found
 */
const getFrontendPathForEndpoint = (req) => {
  // First try to get the path from the request
  const requestPath = getFrontendPath(req);
  if (requestPath) {
    return requestPath;
  }
  
  // If not found, try to map the API endpoint to a frontend path
  const endpoint = req.originalUrl.split('?')[0]; // Remove query parameters
  return endpointToPathMap[endpoint] || null;
};

module.exports = {
  getFrontendPath,
  getFrontendPathForEndpoint
};
