import { apiClient } from './apiClient';
import React from 'react';

/**
 * Normalize a path to match the format stored in the database
 * Removes the domain and ensures the path starts with a slash
 * 
 * @param {string} path - The path to normalize
 * @returns {string} The normalized path
 */
export const normalizePath = (path) => {
  // If it's a full URL, extract just the path
  if (path.startsWith('http')) {
    try {
      const url = new URL(path);
      path = url.pathname;
    } catch (e) {
      console.error('Invalid URL:', path);
    }
  }
  
  // Ensure path starts with a slash
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  return path;
};

/**
 * Check all permissions for a user on a specific menu path
 * 
 * @param {string} path - The menu path (will be normalized)
 * @returns {Promise<Object>} Object containing permission flags
 */
export const checkPermissions = async (path) => {
  try {
    const normalizedPath = normalizePath(path);
    
    const response = await apiClient.get('/api/permissions/check', {
      params: { path: normalizedPath }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return {
      canView: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      canAuthorize: false,
      canReject: false,
      error: error.response?.data?.error || error.message
    };
  }
};

/**
 * Check if user has a specific permission for a menu path
 * 
 * @param {string} path - The menu path (will be normalized)
 * @param {string} permission - Permission to check ('view', 'add', 'edit', 'delete', 'export', 'authorize', 'reject')
 * @returns {Promise<boolean>} Whether user has the specified permission
 */
export const hasPermission = async (path, permission) => {
  try {
    const normalizedPath = normalizePath(path);
    
    const response = await apiClient.get('/api/permissions/has-permission', {
      params: { 
        path: normalizedPath,
        permission
      }
    });
    
    return response.data.hasPermission;
  } catch (error) {
    console.error(`Error checking ${permission} permission:`, error);
    return false;
  }
};

/**
 * React hook to check permissions for the current route
 * 
 * @param {string} path - Optional path override, defaults to current location
 * @returns {Object} Object containing permission flags and loading state
 */
export const usePermissions = (path) => {
  const [permissions, setPermissions] = React.useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canAuthorize: false,
    canReject: false
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Use current location if path not provided
  const location = window.location.pathname;
  const targetPath = path || location;
  
  React.useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const result = await checkPermissions(targetPath);
        setPermissions(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermissions();
  }, [targetPath]);
  
  return { ...permissions, loading, error };
};

export default {
  checkPermissions,
  hasPermission,
  usePermissions,
  normalizePath
};
