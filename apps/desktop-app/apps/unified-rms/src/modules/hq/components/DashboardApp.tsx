import { useRouter } from "../../../hooks/useRouter";
'use client';

import { useState, useEffect } from "react";

import { WifiOff } from "lucide-react";
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
import SmartDeliveryView from "../views/SmartDeliveryView";
import KdsMonitorPage from "../views/KdsMonitorPage";
import KdsStationPage from "../views/KdsStationPage";
import DeliveryDriverView from "../views/DeliveryDriverView";
import AiSettingsView from "../views/AiSettingsView";
import {
  BranchesPage,
  MenuPage,
  OrdersPage,
  SettingsPage,
  StaffPage,
  KitchenStationsPage,
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
import ExternalCompaniesSettings from '../app/settings/external-companies/page';
import CallRecordsPage from "../views/CallRecordsPage";

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
    <div className="space-y-6 text-carbon-text">
      {/* Welcome Banner */}
      <div className="bg-carbon-layer border border-carbon-border p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-carbon-text">
              صباح الخير، {userName}! ☀️
            </h2>
            <p className="font-normal text-carbon-textSecondary mt-1">
              إليك ملخص أداء مطعمك اليوم. أداء رائع! 🚀
            </p>
          </div>
          <div>
            <button 
              onClick={toggleBusinessDay}
              disabled={dayLoading}
              className={`px-4 py-2 font-bold text-white transition-colors ${isActiveDay ? 'bg-[#da1e28] hover:bg-[#ba1b23]' : 'bg-[#24a148] hover:bg-[#198038]'}`}
            >
              {dayLoading ? 'جاري التحميل...' : (isActiveDay ? '🛑 إنهاء اليوم التشغيلي' : '▶️ بدء اليوم التشغيلي')}
            </button>
          </div>
        </div>
      </div>

      <LiveStatus />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-carbon-layer border border-carbon-border p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-carbon-text">المبيعات والأرباح 📈</h3>
            <span className="bg-[#f1c21b] text-black px-2 py-0.5 text-xs font-semibold">مباشر</span>
          </div>
          <RevenueChart data={stats?.revenueData || []} />
        </div>
        <div className="bg-carbon-layer border border-carbon-border p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-carbon-text">حركة الطلبات 🚀</h3>
            <span className="bg-[#24a148] text-white px-2 py-0.5 text-xs font-semibold">اليوم</span>
          </div>
          <OrdersChart data={stats?.ordersPerHour || []} />
        </div>
      </div>

      <div className="bg-carbon-layer border border-carbon-border p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-carbon-text">أحدث الطلبات 🍔</h3>
          <button className="text-carbon-blue hover:text-carbon-blueHover text-sm font-semibold transition-colors">
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
    case "kds-monitor":
      return <KdsMonitorPage />;
    case "kds-station":
      return <KdsStationPage />;
    case "orders":
      return <OrdersPage onEditOrder={(id: string) => { setEditOrderId(id); setActiveTab("callcenter"); }} />;
    case "menu":
      return <MenuPage />;
    case "branches":
      return <BranchesPage />;
    case "delivery-zones":
      return <DeliveryZonesPage />;
    case "kitchen-stations":
      return <KitchenStationsPage />;
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
    case "external-companies":
      return <ExternalCompaniesSettings />;
    case "ai-settings":
      return <AiSettingsView />;
    case "call-records":
      return <CallRecordsPage />;
    case "smart-delivery":
      return <div className="space-y-6"><SmartDeliveryView /></div>;
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
  const { isDisconnected } = useDashboard();
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
    return <div className="min-h-screen bg-carbon-bg text-carbon-text flex items-center justify-center font-bold">جاري التحميل...</div>;
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-carbon-bg text-carbon-text font-cairo" dir="rtl">
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
          sidebarCollapsed ? "lg:mr-14" : "lg:mr-52"
        }`}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleMobile={() => setMobileMenuOpen(true)}
        />
        
        {isDisconnected && (
          <div className="bg-[#da1e28] text-white border-b border-[#ba1b23] p-2 text-center font-bold text-sm flex items-center justify-center gap-2 relative z-20">
            <WifiOff size={16} /> 
            انقطع الاتصال المباشر بالخادم! يرجى التحقق من الشبكة أو إعادة تحميل الصفحة.
          </div>
        )}

        <div className="p-4 md:p-6">{getPageContent(activeTab, setActiveTab, editOrderId, setEditOrderId)}</div>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-carbon-border mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2 text-carbon-textSecondary">
            <span className="text-xl">🍽️</span>
            <span className="font-bold text-carbon-text">أوبنو</span>
            <span className="text-carbon-border">|</span>
            <span className="text-xs">
              نظام إدارة المطاعم والكافيهات © {currentYear}
            </span>
          </div>
          <p className="text-[10px] text-carbon-textSecondary mt-2">
            صُنع بـ ❤️ لأصحاب المطاعم والكافيهات
          </p>
        </footer>
      </main>
    </div>
  );
}
