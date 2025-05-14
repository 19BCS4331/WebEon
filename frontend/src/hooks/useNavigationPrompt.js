import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useBeforeUnload } from 'react-router-dom';

export const useNavigationPrompt = (shouldBlock, onNavigate) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useBeforeUnload(
    useCallback(
      (event) => {
        if (shouldBlock) {
          event.preventDefault();
          return '';
        }
      },
      [shouldBlock]
    )
  );

  useEffect(() => {
    if (!shouldBlock) return;

    let currentPath = location.pathname;
    
    const handlePopState = (event) => {
      if (shouldBlock) {
        // Prevent the immediate navigation
        event.preventDefault();
        
        // Show confirmation dialog
        onNavigate(() => {
          window.removeEventListener('popstate', handlePopState);
          navigate(-1);
        });
      }
    };

    // Handle browser back/forward buttons
    window.addEventListener('popstate', handlePopState);

    // Handle programmatic navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      const newPath = arguments[2];
      
      // Allow direct navigation to dashboard
      if (newPath === '/Dashboard') {
        originalPushState.apply(window.history, arguments);
        navigate(newPath);
        return;
      }

      if (shouldBlock && newPath !== currentPath) {
        onNavigate(() => {
          currentPath = newPath;
          originalPushState.apply(window.history, arguments);
          navigate(newPath);
        });
        return;
      }
      return originalPushState.apply(window.history, arguments);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, [shouldBlock, location, navigate, onNavigate]);
};
