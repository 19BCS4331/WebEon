// transactions.js - API module for transaction-related endpoints
import { apiClient } from '../services/apiClient';

/**
 * Transactions API module
 * Contains all API calls related to transactions
 */
const transactionsApi = {
  /**
   * Get transactions based on type and filters
   * @param {Object} params - Query parameters
   * @param {string} params.vTrnwith - Transaction with
   * @param {string} params.vTrntype - Transaction type
   * @param {string} params.fromDate - Start date
   * @param {string} params.toDate - End date
   * @param {number} params.branchId - Branch ID
   * @returns {Promise} - Promise with transaction data
   */
  getTransactions: (params) => {
    return apiClient.get('/pages/Transactions/getTransactions', { params });
  },

  /**
   * Get transaction by ID
   * @param {string} vNo - Transaction number
   * @param {string} vTrnwith - Transaction with
   * @param {string} vTrntype - Transaction type
   * @returns {Promise} - Promise with transaction data
   */
  getTransactionById: (vNo, vTrnwith, vTrntype) => {
    return apiClient.get('/pages/Transactions/getTransaction', {
      params: { vNo, vTrnwith, vTrntype }
    });
  },

  /**
   * Get exchange data for a transaction
   * @param {string} vNo - Transaction number
   * @param {string} vTrnwith - Transaction with
   * @param {string} vTrntype - Transaction type
   * @returns {Promise} - Promise with exchange data
   */
  getExchangeData: (vNo, vTrnwith, vTrntype) => {
    return apiClient.get('/pages/Transactions/getExchangeData', {
      params: { vNo, vTrnwith, vTrntype }
    });
  },

  /**
   * Get pax details by pax code
   * @param {string} paxCode - Pax code
   * @returns {Promise} - Promise with pax details
   */
  getPaxDetails: (paxCode) => {
    return apiClient.get(`/pages/Transactions/pax-details/${paxCode}`);
  },

  /**
   * Submit transaction (create or update)
   * @param {Object} params - Transaction parameters
   * @param {string} params.method - HTTP method (POST or PUT)
   * @param {Object} params.data - Transaction data
   * @returns {Promise} - Promise with transaction result
   */
  submitTransaction: (params) => {
    const endpoint = params.method === 'PUT' 
      ? `/pages/Transactions/update-transaction/${params.data.nTranID}` 
      : '/pages/Transactions/save-transaction';
    
    return apiClient({
      method: params.method,
      url: endpoint,
      data: params.data
    });
  },

  /**
   * Get next transaction number
   * @param {string} vTrnwith - Transaction with
   * @param {string} vTrntype - Transaction type
   * @param {number} nBranchID - Branch ID
   * @returns {Promise} - Promise with next transaction number
   */
  getNextTransactionNumber: (vTrnwith, vTrntype, nBranchID) => {
    return apiClient.get('/pages/Transactions/transactions/nextNumber', {
      params: { vTrnwith, vTrntype, nBranchID }
    });
  }
};

export default transactionsApi;
