'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCards from "./StatsCards";
import { RevenueChart, OrdersChart, CategoryChart } from "./Charts";
import OrdersTable from "./OrdersTable";
import TopItems from "./TopItems";
import BranchesCard from "./BranchesCard";
import StaffCard from "./StaffCard";
import LiveStatus from "./LiveStatus";
import QuickActions from "./QuickActions";
import WeeklyRatings from "./WeeklyRatings";
import MobileSidebar from "./MobileSidebar";
import { useDashboard } from "../context/DashboardContext";
import DeliveryDashboard from "./DeliveryDashboard";
import {
  BranchesPage,
  MenuPage,
  OrdersPage,
  SettingsPage,
  StaffPage,
  DeliveryZonesPage
} from "../views/ManagementPages";
import { RolesPermissionsPage } from "../views/RolesPermissionsPage";
import { AnalyticsPage } from "../views/AnalyticsPage";
import PosPage from "../views/PosPage";
import CallCenterPage from "../views/CallCenterPage";
import CustomersPage from "../views/CustomersPage";
import KdsPage from "../views/KdsPage";
import SupportComplaintsPage from "../views/SupportComplaintsPage";
import HelpDeskPage from "../views/HelpDeskPage";
import DeliveryDriverView from "../views/DeliveryDriverView";

import { businessDaysApi } from "../utils/api";

function DashboardPage() {
  const { stats, recentOrders, loading, error } = useDashboard();
  const [userName, setUserName] = useState<string>("عبدالله");
  const [isActiveDay, setIsActiveDay] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    checkBusinessDay();
  }, []);

  const checkBusinessDay = async () => {
    try {
      const res = await businessDaysApi.getActive();
      setIsActiveDay(res.data.isActive);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBusinessDay = async () => {
    setDayLoading(true);
    try {
      if (isActiveDay) {
        await businessDaysApi.end();
      } else {
        await businessDaysApi.start();
      }
      setIsActiveDay(!isActiveDay);
    } catch (e: any) {
      alert(e.response?.data || "حدث خطأ في الاتصال بالخادم");
    } finally {
      setDayLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل البيانات... 🍽️</div>;
  if (error) return <div className="p-20 text-center font-black text-2xl text-brand-red">⚠️ {error}</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="neo-card bg-gradient-to-l from-brand-yellow via-brand-orange to-brand-pink p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-neo-text">
              صباح الخير، {userName}! ☀️
            </h2>
            <p className="font-bold text-neo-text/80 mt-1">
              إليك ملخص أداء مطعمك اليوم. أداء رائع! 🚀
            </p>
          </div>
          <div>
            <button 
              onClick={toggleBusinessDay}
              disabled={dayLoading}
              className={`neo-btn px-6 py-3 font-black text-lg text-white ${isActiveDay ? 'bg-brand-red hover:bg-red-600' : 'bg-brand-green hover:bg-green-600'}`}
            >
              {dayLoading ? 'جاري التحميل...' : (isActiveDay ? '🛑 إنهاء اليوم التشغيلي' : '▶️ بدء اليوم التشغيلي')}
            </button>
          </div>
        </div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 animate-float hidden sm:block w-28 h-28 mix-blend-overlay pointer-events-none">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      <LiveStatus />
      
      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card bg-neo-card p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-lg">المبيعات والأرباح 📈</h3>
            <span className="neo-badge bg-brand-yellow">مباشر</span>
          </div>
          <RevenueChart data={stats?.revenueData || []} />
        </div>
        <div className="neo-card bg-neo-card p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-lg">حركة الطلبات 🚀</h3>
            <span className="neo-badge bg-brand-green text-white">اليوم</span>
          </div>
          <OrdersChart data={stats?.ordersPerHour || []} />
        </div>
      </div>

      <div className="neo-card bg-neo-card p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-lg">أحدث الطلبات 🍔</h3>
          <button className="neo-btn bg-brand-orange text-white px-4 py-1.5 text-xs">
            عرض الكل
          </button>
        </div>
        <OrdersTable orders={recentOrders || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TopItems />
        <BranchesCard />
        <StaffCard />
      </div>

      <WeeklyRatings />
    </div>
  );
}

function getPageContent(activeTab: string, setActiveTab: any, editOrderId: string | null, setEditOrderId: any) {
  switch (activeTab) {
    case "pos":
      return <PosPage />;
    case "callcenter":
      return <CallCenterPage editOrderId={editOrderId} setEditOrderId={setEditOrderId} />;
    case "kds":
      return <KdsPage />;
    case "orders":
      return <OrdersPage onEditOrder={(id: string) => { setEditOrderId(id); setActiveTab("callcenter"); }} />;
    case "menu":
      return <MenuPage />;
    case "branches":
      return <BranchesPage />;
    case "delivery-zones":
      return <DeliveryZonesPage />;
    case "staff":
      return <StaffPage />;
    case "roles":
      return <RolesPermissionsPage />;
    case "customers":
      return <CustomersPage />;
    case "analytics":
      return <AnalyticsPage />;
    case "support":
      return <SupportComplaintsPage />;
    case "settings":
      return <SettingsPage />;
    case "helpdesk":
      return <HelpDeskPage />;
    case "delivery":
      return <div className="space-y-6"><DeliveryDashboard /></div>;
    case "delivery-driver":
      return <DeliveryDriverView />;
    default:
      return <DashboardPage />;
  }
}

export default function DashboardApp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // 1. Intercept URL tokens from cross-domain login
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("tenantId", params.get("tenantId") || "");
      localStorage.setItem("userName", params.get("userName") || "");
      localStorage.setItem("userRole", params.get("userRole") || "Owner");
      
      // Clean up URL without triggering a full page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      router.replace("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    router.push("/");
  };

  if (!mounted || !isLoggedIn) {
    return <div className="min-h-screen bg-neo-bg flex items-center justify-center font-black">جاري التحميل...</div>;
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-neo-bg font-cairo" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:mr-20" : "lg:mr-64"
        }`}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleMobile={() => setMobileMenuOpen(true)}
        />
        <div className="p-4 md:p-6">{getPageContent(activeTab, setActiveTab, editOrderId, setEditOrderId)}</div>

        {/* Footer */}
        <footer className="p-6 text-center border-t-2 border-neo-border mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-black">أوبنو</span>
            <span className="text-gray-400 font-bold">|</span>
            <span className="text-sm text-gray-500 font-bold">
              نظام إدارة المطاعم والكافيهات © {currentYear}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            صُنع بـ ❤️ لأصحاب المطاعم والكافيهات
          </p>
        </footer>
      </main>
    </div>
  );
}
