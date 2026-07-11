import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigateToTab: (tabId: string, path?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState('dashboard');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTabState(tabParam);
    } else {
      const path = location.pathname;
      if (path.startsWith('/hq')) setActiveTabState('hq');
      else if (path.startsWith('/branch')) setActiveTabState('branch');
      else if (path.startsWith('/pos')) setActiveTabState('pos');
      else if (path.startsWith('/inventory')) setActiveTabState('inventory');
      else setActiveTabState('dashboard');
    }
  }, [searchParams, location.pathname]);

  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('tab', tab);
      return params;
    });
  };

  const navigateToTab = (tabId: string, path?: string) => {
    if (path) {
      // If we are navigating to a new root route, we do a full router navigation
      // This allows role-based redirects to handle properly.
      navigate(`${path}?tab=${tabId}`);
    } else {
      // Just swap the tab on the current screen
      setActiveTab(tabId);
    }
  };

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, navigateToTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
