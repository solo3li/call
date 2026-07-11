import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigateToTab: (tabId: string, path?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Sync active tab with location path for main routes
  useEffect(() => {
    const path = location.pathname;
    if (path === '/hq') setActiveTab('hq');
    else if (path === '/branch') setActiveTab('branch');
    else if (path === '/pos') setActiveTab('pos');
    else if (path === '/call-center') setActiveTab('callcenter');
    else if (path === '/inventory') setActiveTab('inventory');
  }, [location.pathname]);

  const navigateToTab = (tabId: string, path?: string) => {
    setActiveTab(tabId);
    if (path) {
      navigate(path);
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
