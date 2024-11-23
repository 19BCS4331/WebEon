import { useMemo } from 'react';

export const useRightsValidation = (rights, menuItemId) => {
  const permissions = useMemo(() => {
    if (!rights || !rights[menuItemId]) {
      return {
        canAdd: false,
        canModify: false,
        canDelete: false,
        canView: false,
        canExport: false
      };
    }

    const menuRights = rights[menuItemId];
    return {
      canAdd: menuRights.add || false,
      canModify: menuRights.modify || false,
      canDelete: menuRights.delete || false,
      canView: menuRights.view || false,
      canExport: menuRights.export || false
    };
  }, [rights, menuItemId]);

  return permissions;
};
