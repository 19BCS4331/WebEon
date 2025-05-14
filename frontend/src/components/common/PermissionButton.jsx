import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { hasPermission } from '../../services/permissionService';
import { Colortheme } from '../../theme/ColorTheme';

/**
 * A button that is automatically disabled if the user doesn't have the required permission
 * 
 * @param {Object} props
 * @param {string} props.permission - The permission to check ('add', 'edit', 'delete', etc.)
 * @param {string} props.path - Optional path to check permissions for (defaults to current URL)
 * @param {string} props.tooltip - Optional tooltip to show when button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @returns {React.ReactNode}
 */
const PermissionButton = ({ 
  permission = 'view',
  path,
  tooltip = 'You do not have permission for this action',
  children,
  ...buttonProps
}) => {
  const [hasAccess, setHasAccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        // Use current path if not specified
        const targetPath = path || window.location.pathname;
        const result = await hasPermission(targetPath, permission);
        setHasAccess(result);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [path, permission]);
  
  const button = (
    <Button
      {...buttonProps}
      disabled={loading || !hasAccess || buttonProps.disabled}
      sx={{
        ...buttonProps.sx,
        backgroundColor: Colortheme.primary,
        color: Colortheme.white,
        '&:hover': {
          backgroundColor: Colortheme.primaryDark,
        },
        '&.Mui-disabled': {
          backgroundColor: Colortheme.disabled,
          color: Colortheme.disabledText,
        }
      }}
    >
      {children}
    </Button>
  );
  
  if (!hasAccess && !loading) {
    return (
      <Tooltip title={tooltip}>
        <span>{button}</span>
      </Tooltip>
    );
  }
  
  return button;
};

export default PermissionButton;
