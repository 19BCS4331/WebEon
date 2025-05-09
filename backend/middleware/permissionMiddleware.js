/**
 * Permission middleware for validating user access to API endpoints
 */

const { checkUserPermissions, hasPermission } = require('../utils/permissionUtils');

/**
 * Creates a middleware that checks if the user has the required permission for a specific menu path
 * 
 * @param {string|function} menuPath - The menu path to check permissions for, or a function that extracts it from the request
 * @param {string} permission - The permission to check (view, add, edit, delete, export, authorize, reject)
 * @returns {function} Express middleware function
 */
const requirePermission = (menuPath, permission = 'view') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.nUserID;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required',
          errorCode: 'NO_TOKEN'
        });
      }
      
      // If menuPath is a function, call it with the request to get the actual path
      const path = typeof menuPath === 'function' ? menuPath(req) : menuPath;
      
      if (!path) {
        console.error('No menu path provided for permission check');
        return res.status(403).json({ 
          success: false, 
          error: 'Permission denied - invalid menu path'
        });
      }
      
      // Check if the user has the required permission
      const hasAccess = await hasPermission(userId, path, permission);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          success: false, 
          error: `Permission denied - missing ${permission} permission for ${path}`
        });
      }
      
      // User has permission, proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error checking permissions'
      });
    }
  };
};

/**
 * Middleware that attaches the user's permissions to the request object
 * This allows route handlers to check permissions without additional database queries
 * 
 * @param {string|function} menuPath - The menu path to check permissions for, or a function that extracts it from the request
 * @returns {function} Express middleware function
 */
const attachPermissions = (menuPath) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.nUserID;
      
      if (!userId) {
        req.permissions = {
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
          canAuthorize: false,
          canReject: false
        };
        return next();
      }
      
      // If menuPath is a function, call it with the request to get the actual path
      const path = typeof menuPath === 'function' ? menuPath(req) : menuPath;
      
      if (!path) {
        req.permissions = {
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
          canAuthorize: false,
          canReject: false
        };
        return next();
      }
      
      // Get all permissions for the user and path
      const permissions = await checkUserPermissions(userId, path);
      
      // Attach permissions to the request object
      req.permissions = permissions;
      
      // Proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error('Error attaching permissions:', error);
      req.permissions = {
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canAuthorize: false,
        canReject: false
      };
      next();
    }
  };
};

module.exports = {
  requirePermission,
  attachPermissions
};
