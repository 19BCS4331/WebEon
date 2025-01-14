import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [advSettings, setAdvSettings] = useState([]);
  const [branchSettings, setBranchSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { branch, isAuthenticated } = useAuth();

  // Fetch settings only when authenticated
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const [advResponse, branchResponse] = await Promise.all([
          apiClient.post('/pages/Master/SystemSetup/advSettings', {
            nBranchID: 0,
          }),
          apiClient.post('/pages/Master/SystemSetup/advSettings', {
            nBranchID: branch?.nBranchID || 0,
          })
        ]);
        
        // Store the settings data directly as received from the API
        setAdvSettings(advResponse.data);
        setBranchSettings(branchResponse.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated, branch?.nBranchID]);

  // Convert Yes/No values to boolean
  const convertToBoolean = (value) => {
    if (typeof value === 'string') {
      const normalizedValue = value.toLowerCase();
      return normalizedValue === 'yes' || normalizedValue === 'y';
    }
    return value;
  };

  // Get setting value with fallback
  const getSetting = (dataCode, type = 'advanced', fallback = null) => {
    const settings = type === 'advanced' ? advSettings : branchSettings;
    const setting = settings.find(s => s.DATACODE === dataCode);
    const value = setting?.DATAVALUE ?? fallback;
    
    // Check if it's a boolean setting (Yes/No or Y/N)
    if (setting?.DATATYPE === 'B') {
      return convertToBoolean(value);
    }
    
    return value;
  };

  return (
    <SettingsContext.Provider value={{
      advSettings,
      branchSettings,
      loading,
      getSetting,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
