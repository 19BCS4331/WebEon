// APIs index file - Export all API modules
import transactionsApi from './transactions';
import masterApi from './master';

// Export all API modules
export {
  transactionsApi,
  masterApi
};

// Export default as a combined API object
export default {
  transactions: transactionsApi,
  master: masterApi
};
