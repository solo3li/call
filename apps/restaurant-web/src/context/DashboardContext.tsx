'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dashboardApi, ordersApi, customersApi } from '../utils/api';
import { DashboardStats, Order, Customer } from '../types/api';
import * as signalR from '@microsoft/signalr';

interface DashboardContextType {
  stats: DashboardStats | null;
  recentOrders: Order[];
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [authData, setAuthData] = useState<{ token: string | null, tenantId: string | null }>({
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    tenantId: typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null
  });

  const fetchCustomers = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await customersApi.getAll();
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error fetching customers: ', err);
    }
  };

  const fetchData = async () => {
    if (!localStorage.getItem('token')) return;

    try {
      setLoading(true);
      const [statsRes, ordersRes, custRes] = await Promise.all([
        dashboardApi.getStats(),
        ordersApi.getAll(),
        customersApi.getAll(),
      ]);
      setStats(statsRes.data || null);
      setRecentOrders(ordersRes.data || []);
      setCustomers(custRes.data || []);
      setError(null);
    } catch (err) {
      setError('فشل تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Poll localStorage for token/tenantId changes (since it's not reactive in React)
    const interval = setInterval(() => {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const currentTenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
      
      if (currentToken !== authData.token || currentTenantId !== authData.tenantId) {
        setAuthData({ token: currentToken, tenantId: currentTenantId });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [authData]);

  useEffect(() => {
    if (!mounted) return;

    if (!authData.token) {
      setLoading(false);
      return;
    }

    fetchData();

    // SignalR Connection
    const { token, tenantId } = authData;
    if (!token || !tenantId) return;

    let isMounted = true;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/api/orderHub', {
        accessTokenFactory: () => token,
      })
      .configureLogging(signalR.LogLevel.None)
      .withAutomaticReconnect()
      .build();

    connection.serverTimeoutInMilliseconds = 60000;
    connection.keepAliveIntervalInMilliseconds = 15000;

    const startConnection = async () => {
      try {
        await connection.start();
        if (!isMounted) {
          await connection.stop();
          return;
        }
        
        await connection.invoke('JoinTenantGroup', tenantId);
        
        connection.on('ReceiveOrderUpdate', (order: Order) => {
          if (!isMounted) return;
          setRecentOrders(prev => [order, ...prev.slice(0, 5)]);
          dashboardApi.getStats().then(res => {
            if (isMounted) setStats(res.data);
          }).catch(err => {
            console.error('SignalR getStats Error: ', err);
          });
        });
      } catch (err: any) {
        if (isMounted && err.name !== 'AbortError') {
          console.error('SignalR Connection Error: ', err);
        }
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected || 
          connection.state === signalR.HubConnectionState.Reconnecting) {
        connection.stop().catch(err => console.error('SignalR Stop Error: ', err));
      }
    };
  }, [mounted, authData.token, authData.tenantId]);

  return (
    <DashboardContext.Provider value={{ stats, recentOrders, customers, loading, error, refresh: fetchData, refreshCustomers: fetchCustomers }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
