import React from 'react';
import { usePermissions } from '../../services/permissionService';
import { CircularProgress, Box, Typography } from '@mui/material';
import { Colortheme } from '../../theme/ColorTheme';

/**
 * A component that conditionally renders children based on user permissions
 * 
 * @param {Object} props
 * @param {string} props.permission - The permission to check ('view', 'add', 'edit', 'delete', 'export')
 * @param {string} props.path - Optional path to check permissions for (defaults to current URL)
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Optional content to render if user doesn't have permission
 * @returns {React.ReactNode}
 */
const PermissionGuard = ({ 
  permission = 'view', 
  path, 
  children, 
  fallback = null,
  showLoading = true
}) => {
  const { loading, error, ...permissions } = usePermissions(path);
  
  // Map permission string to the corresponding property
  const permissionMap = {
    view: 'canView',
    add: 'canAdd',
    edit: 'canEdit',
    delete: 'canDelete',
    export: 'canExport',
    authorize: 'canAuthorize',
    reject: 'canReject'
  };
  
  const permissionKey = permissionMap[permission.toLowerCase()] || 'canView';
  const hasAccess = permissions[permissionKey];
  
  if (loading && showLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} style={{ color: Colortheme.primary }} />
      </Box>
    );
  }
  
  if (error) {
    console.error('Permission check error:', error);
    return fallback;
  }
  
  return hasAccess ? children : fallback;
};

/**
 * A component that renders an unauthorized message when user doesn't have permission
 */
export const Unauthorized = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    p={3}
    sx={{ 
      height: '100%', 
      color: Colortheme.text,
      fontFamily: 'Poppins'
    }}
  >
    <Typography variant="h6" fontFamily="Poppins">
      You don't have permission to access this resource
    </Typography>
  </Box>
);

export default PermissionGuard;
