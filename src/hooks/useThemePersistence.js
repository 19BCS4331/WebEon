import { useCallback } from 'react';
import { apiClient } from '../services/apiClient';

export const useThemePersistence = () => {
  const saveTheme = useCallback(async (theme, mode) => {
    // Skip API call if on login page
    if (window.location.pathname === '/') {
      localStorage.setItem('localTheme', JSON.stringify({ theme, mode }));
      return;
    }

    try {
      await apiClient.post("/user/theme", { theme, mode });
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }, []);

  const loadTheme = useCallback(async () => {
    // Use local storage theme if on login page
    if (window.location.pathname === '/') {
      const localTheme = localStorage.getItem('localTheme');
      return localTheme ? JSON.parse(localTheme) : null;
    }

    try {
      const response = await apiClient.get("/user/theme");
      return response.data;
    } catch (error) {
      console.error("Error fetching theme:", error);
      // Fallback to local storage theme if API fails
      const localTheme = localStorage.getItem('localTheme');
      return localTheme ? JSON.parse(localTheme) : null;
    }
  }, []);

  return { saveTheme, loadTheme };
};
