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
import { useNavigation } from "../../../context/NavigationContext";
import DeliveryDashboard from "./DeliveryDashboard";
import SmartDeliveryView from "../views/SmartDeliveryView";
import KdsMonitorPage from "../views/KdsMonitorPage";
import KdsStationPage from "../views/KdsStationPage";
import DeliveryDriverView from "../views/DeliveryDriverView";
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
import CustomersPage from "../views/CustomersPage";
import KdsPage from "../views/KdsPage";
import SupportComplaintsPage from "../views/SupportComplaintsPage";
import HelpDeskPage from "../views/HelpDeskPage";

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
            <h2 className="text-2xl font-bold text-white">
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
            <h3 className="font-bold text-lg text-white">المبيعات والأرباح 📈</h3>
            <span className="bg-[#f1c21b] text-black px-2 py-0.5 text-xs font-semibold">مباشر</span>
          </div>
          <RevenueChart data={stats?.revenueData || []} />
        </div>
        <div className="bg-carbon-layer border border-carbon-border p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">حركة الطلبات 🚀</h3>
            <span className="bg-[#24a148] text-white px-2 py-0.5 text-xs font-semibold">اليوم</span>
          </div>
          <OrdersChart data={stats?.ordersPerHour || []} />
        </div>
      </div>

      <div className="bg-carbon-layer border border-carbon-border p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-white">أحدث الطلبات 🍔</h3>
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
    case "kds-monitor":
      return <KdsMonitorPage />;
    case "kds-station":
      return <KdsStationPage />;
    case "orders":
      return <OrdersPage onEditOrder={(id: string) => { setEditOrderId(id); setActiveTab("pos"); }} />;
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
  const { isDisconnected } = useDashboard();
  const { activeTab, setActiveTab } = useNavigation();
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  return (
    <>
      {isDisconnected && (
        <div className="bg-[#da1e28] text-white border-b border-[#ba1b23] p-2 text-center font-bold text-sm flex items-center justify-center gap-2 mb-4 rounded">
          <WifiOff size={16} /> 
          انقطع الاتصال المباشر بالخادم! يرجى التحقق من الشبكة أو إعادة تحميل الصفحة.
        </div>
      )}

      {getPageContent(activeTab, setActiveTab, editOrderId, setEditOrderId)}
    </>
  );
}
