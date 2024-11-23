import React, { createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AppActionsContext = createContext();

export const AppActionsProvider = ({ children }) => {
  const navigate = useNavigate();

  const handleNavigation = useCallback((path) => {
    // Remove any leading http://localhost:3000 if present
    const cleanPath = path.replace(/^https?:\/\/[^\/]+/, '');
    
    // Ensure path starts with /
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    // Use navigate instead of window.location for smoother navigation
    navigate(normalizedPath);
  }, [navigate]);

  const handleFormSubmit = useCallback((formId, data) => {
    const form = document.getElementById(formId);
    if (form) {
      Object.entries(data).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) {
          input.value = value;
          // Trigger change event to ensure React form handlers are notified
          const event = new Event('change', { bubbles: true });
          input.dispatchEvent(event);
        }
      });
      // Trigger form submission
      const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
      form.dispatchEvent(submitEvent);
    }
  }, []);

  const handleButtonClick = useCallback((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      // Trigger click event
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      button.dispatchEvent(clickEvent);
    }
  }, []);

  const handleFieldChange = useCallback((fieldId, value) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value;
      // Trigger change event
      const event = new Event('change', { bubbles: true });
      field.dispatchEvent(event);
    }
  }, []);

  const actions = {
    navigate: handleNavigation,
    submitForm: handleFormSubmit,
    clickButton: handleButtonClick,
    updateField: handleFieldChange,
  };

  return (
    <AppActionsContext.Provider value={actions}>
      {children}
    </AppActionsContext.Provider>
  );
};

export const useAppActions = () => {
  const context = useContext(AppActionsContext);
  if (!context) {
    throw new Error('useAppActions must be used within an AppActionsProvider');
  }
  return context;
};
