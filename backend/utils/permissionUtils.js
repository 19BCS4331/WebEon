/**
 * Permission utility functions for checking user access rights
 */

const pool = require('../config/db');
const { BaseModel } = require('../models/base/BaseModel');

/**
 * Check user permissions for a specific menu
 * 
 * @param {number} userId - The user ID
 * @param {number|string} menuIdentifier - Either menu ID or menu path
 * @returns {Promise<Object>} Object containing permission flags
 */
async function checkUserPermissions(userId, menuIdentifier) {
  try {
    // Determine if menuIdentifier is a menu ID (number) or a path (string)
    let menuId = menuIdentifier;
    let menuQuery = '';
    let menuParams = [];

    if (typeof menuIdentifier === 'string') {
      // If it's a path, get the menu ID from the path
      menuQuery = `
        SELECT id 
        FROM "mstNavigation" 
        WHERE link = $1 AND "bIsdeleted" = FALSE
      `;
      menuParams = [menuIdentifier];
      
      const menuResult = await BaseModel.executeQuery(menuQuery, menuParams);
      
      if (!menuResult || menuResult.length === 0) {
        return {
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
          error: 'Menu not found'
        };
      }
      
      menuId = menuResult[0].id;
    }

    // Get user's group ID
    const userGroupQuery = `
      SELECT u."nGroupID"
      FROM "mstUser" u
      WHERE u."nUserID" = $1 AND u."bActive" = TRUE
    `;
    
    const userGroupResult = await BaseModel.executeQuery(userGroupQuery, [userId]);
    
    if (!userGroupResult || userGroupResult.length === 0) {
      return {
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        error: 'User not found or inactive'
      };
    }
    
    const groupId = userGroupResult[0].nGroupID;

    // Get combined permissions (user permissions take precedence over group permissions)
    const permissionsQuery = `
      SELECT 
        COALESCE(ur."bViewRights", gr."bViewRights", FALSE) as "canView",
        COALESCE(ur."bAddRights", gr."bAddRights", FALSE) as "canAdd",
        COALESCE(ur."bModifyRights", gr."bModifyRights", FALSE) as "canEdit",
        COALESCE(ur."bDeleteRights", gr."bDeleteRights", FALSE) as "canDelete",
        COALESCE(ur."bExportRights", gr."bExportRights", FALSE) as "canExport",
        COALESCE(ur."bAuthorised", gr."bAuthorised", FALSE) as "canAuthorize",
        COALESCE(ur."bRejected", gr."bRejected", FALSE) as "canReject"
      FROM 
        (SELECT $1::integer as "nMenuID") m
      LEFT JOIN "mstUserRights" ur ON ur."nMenuID" = m."nMenuID" AND ur."nUserID" = $2
      LEFT JOIN "mstGroupRights" gr ON gr."nMenuID" = m."nMenuID" AND gr."nGroupID" = $3
    `;
    
    const permissionsResult = await BaseModel.executeQuery(permissionsQuery, [menuId, userId, groupId]);
    
    if (!permissionsResult || permissionsResult.length === 0) {
      return {
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canAuthorize: false,
        canReject: false,
        error: 'No permissions found'
      };
    }
    
    // Return the permissions
    return {
      canView: permissionsResult[0].canView || false,
      canAdd: permissionsResult[0].canAdd || false,
      canEdit: permissionsResult[0].canEdit || false,
      canDelete: permissionsResult[0].canDelete || false,
      canExport: permissionsResult[0].canExport || false,
      canAuthorize: permissionsResult[0].canAuthorize || false,
      canReject: permissionsResult[0].canReject || false,
      menuId: menuId
    };
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return {
      canView: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      canAuthorize: false,
      canReject: false,
      error: error.message
    };
  }
}

/**
 * Check if user has specific permission for a menu
 * 
 * @param {number} userId - The user ID
 * @param {number|string} menuIdentifier - Either menu ID or menu path
 * @param {string} permission - Permission to check ('view', 'add', 'edit', 'delete', 'export', 'authorize', 'reject')
 * @returns {Promise<boolean>} Whether user has the specified permission
 */
async function hasPermission(userId, menuIdentifier, permission) {
  const permissions = await checkUserPermissions(userId, menuIdentifier);
  
  switch (permission.toLowerCase()) {
    case 'view':
      return permissions.canView;
    case 'add':
      return permissions.canAdd;
    case 'edit':
      return permissions.canEdit;
    case 'delete':
      return permissions.canDelete;
    case 'export':
      return permissions.canExport;
    case 'authorize':
      return permissions.canAuthorize;
    case 'reject':
      return permissions.canReject;
    default:
      return false;
  }
}

/**
 * Get menu ID from a path
 * 
 * @param {string} path - The menu path
 * @returns {Promise<number|null>} The menu ID or null if not found
 */
async function getMenuIdFromPath(path) {
  try {
    const query = `
      SELECT id 
      FROM "mstNavigation" 
      WHERE link = $1 AND "bIsdeleted" = FALSE
    `;
    
    const result = await BaseModel.executeQuery(query, [path]);
    
    if (!result || result.length === 0) {
      return null;
    }
    
    return result[0].id;
  } catch (error) {
    console.error('Error getting menu ID from path:', error);
    return null;
  }
}

module.exports = {
  checkUserPermissions,
  hasPermission,
  getMenuIdFromPath
};
