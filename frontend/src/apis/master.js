// master.js - API module for master data endpoints
import { apiClient } from '../services/apiClient';

/**
 * Master API module
 * Contains all API calls related to master data (profiles, settings, etc.)
 */
const masterApi = {
  /**
   * Currency Profile APIs
   */
  currency: {
    /**
     * Get all currency profiles
     * @returns {Promise} - Promise with currency data
     */
    getAll: () => {
      return apiClient.get('/pages/Master/MasterProfiles/currency');
    },
    
    /**
     * Get currency by ID
     * @param {number} id - Currency ID
     * @returns {Promise} - Promise with currency data
     */
    getById: (id) => {
      return apiClient.get(`/pages/Master/MasterProfiles/currency/${id}`);
    },
    
    /**
     * Create new currency
     * @param {Object} currencyData - Currency data
     * @returns {Promise} - Promise with created currency
     */
    create: (currencyData) => {
      return apiClient.post('/pages/Master/MasterProfiles/currency', currencyData);
    },
    
    /**
     * Update currency
     * @param {number} id - Currency ID
     * @param {Object} currencyData - Currency data
     * @returns {Promise} - Promise with updated currency
     */
    update: (id, currencyData) => {
      return apiClient.put(`/pages/Master/MasterProfiles/currency/${id}`, currencyData);
    },
    
    /**
     * Delete currency
     * @param {number} id - Currency ID
     * @returns {Promise} - Promise with deletion result
     */
    delete: (id) => {
      return apiClient.delete(`/pages/Master/MasterProfiles/currency/${id}`);
    }
  },
  
  /**
   * Party Profile APIs
   */
  party: {
    /**
     * Get all party profiles
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with party data
     */
    getAll: (params = {}) => {
      return apiClient.get('/pages/Master/PartyProfiles/party', { params });
    },
    
    /**
     * Get party by ID
     * @param {string} id - Party ID
     * @returns {Promise} - Promise with party data
     */
    getById: (id) => {
      return apiClient.get(`/pages/Master/PartyProfiles/party/${id}`);
    },
    
    /**
     * Create new party
     * @param {Object} partyData - Party data
     * @returns {Promise} - Promise with created party
     */
    create: (partyData) => {
      return apiClient.post('/pages/Master/PartyProfiles/party', partyData);
    },
    
    /**
     * Update party
     * @param {string} id - Party ID
     * @param {Object} partyData - Party data
     * @returns {Promise} - Promise with updated party
     */
    update: (id, partyData) => {
      return apiClient.put(`/pages/Master/PartyProfiles/party/${id}`, partyData);
    },
    
    /**
     * Delete party
     * @param {string} id - Party ID
     * @returns {Promise} - Promise with deletion result
     */
    delete: (id) => {
      return apiClient.delete(`/pages/Master/PartyProfiles/party/${id}`);
    }
  },
  
  /**
   * System Setup APIs
   */
  systemSetup: {
    /**
     * Company Profile APIs
     */
    company: {
      /**
       * Get company profile
       * @returns {Promise} - Promise with company data
       */
      get: () => {
        return apiClient.get('/pages/Master/SystemSetup/company');
      },
      
      /**
       * Update company profile
       * @param {Object} companyData - Company data
       * @returns {Promise} - Promise with updated company
       */
      update: (companyData) => {
        return apiClient.put('/pages/Master/SystemSetup/company', companyData);
      }
    },
    
    /**
     * Branch Location APIs
     */
    branch: {
      /**
       * Get all branches
       * @returns {Promise} - Promise with branch data
       */
      getAll: () => {
        return apiClient.get('/pages/Master/SystemSetup/branch');
      },
      
      /**
       * Get branch by ID
       * @param {number} id - Branch ID
       * @returns {Promise} - Promise with branch data
       */
      getById: (id) => {
        return apiClient.get(`/pages/Master/SystemSetup/branch/${id}`);
      },
      
      /**
       * Create new branch
       * @param {Object} branchData - Branch data
       * @returns {Promise} - Promise with created branch
       */
      create: (branchData) => {
        return apiClient.post('/pages/Master/SystemSetup/branch', branchData);
      },
      
      /**
       * Update branch
       * @param {number} id - Branch ID
       * @param {Object} branchData - Branch data
       * @returns {Promise} - Promise with updated branch
       */
      update: (id, branchData) => {
        return apiClient.put(`/pages/Master/SystemSetup/branch/${id}`, branchData);
      },
      
      /**
       * Delete branch
       * @param {number} id - Branch ID
       * @returns {Promise} - Promise with deletion result
       */
      delete: (id) => {
        return apiClient.delete(`/pages/Master/SystemSetup/branch/${id}`);
      }
    },
    
    /**
     * User Profile APIs
     */
    user: {
      /**
       * Get all users
       * @returns {Promise} - Promise with user data
       */
      getAll: () => {
        return apiClient.get('/pages/Master/SystemSetup/user');
      },
      
      /**
       * Get user by ID
       * @param {number} id - User ID
       * @returns {Promise} - Promise with user data
       */
      getById: (id) => {
        return apiClient.get(`/pages/Master/SystemSetup/user/${id}`);
      },
      
      /**
       * Create new user
       * @param {Object} userData - User data
       * @returns {Promise} - Promise with created user
       */
      create: (userData) => {
        return apiClient.post('/pages/Master/SystemSetup/user', userData);
      },
      
      /**
       * Update user
       * @param {number} id - User ID
       * @param {Object} userData - User data
       * @returns {Promise} - Promise with updated user
       */
      update: (id, userData) => {
        return apiClient.put(`/pages/Master/SystemSetup/user/${id}`, userData);
      },
      
      /**
       * Delete user
       * @param {number} id - User ID
       * @returns {Promise} - Promise with deletion result
       */
      delete: (id) => {
        return apiClient.delete(`/pages/Master/SystemSetup/user/${id}`);
      }
    }
  }
};

export default masterApi;
