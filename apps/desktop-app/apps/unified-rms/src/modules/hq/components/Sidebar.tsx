import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  BarChart3,
  Settings,
  Store,
  MessageSquare,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PhoneCall,
  ShieldCheck,
  ChefHat,
  LifeBuoy,
  RefreshCw,
  Zap,
  Mic
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  color: string;
  restricted?: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: "الرئيسية",
    items: [
      { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, color: "bg-brand-yellow" },
      { id: "pos", label: "نقطة بيع (POS)", icon: ShoppingBag, color: "bg-brand-purple text-white" },
      { id: "callcenter", label: "مركز الاتصال", icon: PhoneCall, color: "bg-brand-orange text-white" },
      { id: "call-records", label: "المكالمات المسجلة", icon: Mic, color: "bg-brand-purple text-white" },
    ]
  },
  {
    title: "إدارة العمليات",
    items: [
      { id: "orders", label: "الطلبات", icon: ShoppingBag, color: "bg-brand-orange" },
      { id: "kds-monitor", label: "مراقبة المطبخ", icon: ChefHat, color: "bg-brand-red text-white" },
      { id: "kds-station", label: "محطة الطهي", icon: UtensilsCrossed, color: "bg-brand-orange text-white" },
      { id: "delivery", label: "إدارة التوصيل", icon: Store, color: "bg-brand-yellow" },
      { id: "smart-delivery", label: "التوصيل الذكي", icon: Zap, color: "bg-brand-red text-white" },
      { id: "delivery-driver", label: "شاشة المندوب", icon: Users, color: "bg-brand-cyan" },
      { id: "menu", label: "قائمة الطعام", icon: UtensilsCrossed, color: "bg-brand-green" },
      { id: "customers", label: "العملاء", icon: Users, color: "bg-brand-cyan" },
      { id: "support", label: "دعم العملاء والشكاوى", icon: MessageSquare, color: "bg-brand-purple text-white" },
    ]
  },
  {
    title: "إدارة المنشأة",
    items: [
      { id: "branches", label: "الفروع", icon: Store, color: "bg-brand-blue", restricted: true },
      { id: "delivery-zones", label: "مناطق التوصيل", icon: MapPin, color: "bg-brand-orange text-white", restricted: true },
      { id: "kitchen-stations", label: "محطات المطبخ", icon: ChefHat, color: "bg-brand-red text-white", restricted: true },
      { id: "staff", label: "الموظفين", icon: Users, color: "bg-brand-pink", restricted: true },
      { id: "roles", label: "الصلاحيات", icon: ShieldCheck, color: "bg-brand-purple text-white", restricted: true },
    ]
  },
  {
    title: "التحليل والتقييم",
    items: [
      { id: "analytics", label: "التقارير", icon: BarChart3, color: "bg-brand-purple", restricted: true },
    ]
  },
  {
    title: "النظام",
    items: [
      { id: "settings", label: "الإعدادات", icon: Settings, color: "text-white" },
      { id: "ai-settings", label: "الذكاء الاصطناعي والمكالمات", icon: MessageSquare, color: "text-white", restricted: true },
      { id: "external-companies", label: "شركات التوصيل", icon: Store, color: "text-white", restricted: true },
      { id: "helpdesk", label: "الدعم الفني للمنصة", icon: LifeBuoy, color: "text-white" }
    ]
  }
];

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, onLogout }: SidebarProps) {
  const [userRole, setUserRole] = useState("Staff");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setUserRole(localStorage.getItem("userRole") || "Staff");
  }, []);

  if (!isMounted) return null;

  const isOwner = userRole.includes("Owner") || userRole.includes("Admin") || userRole.includes("Manager");

  return (
    <aside
      className={`fixed right-0 top-0 h-screen bg-carbon-darkLayer border-l border-carbon-darkBorder z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-14" : "w-52"
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-carbon-darkBorder flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden bg-white">
          <img src="/logo.png" alt="OPNO Logo" className="w-full h-full object-contain p-0.5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-base leading-tight truncate text-carbon-darkText">أوبنو</h1>
            <p className="text-[10px] font-normal text-carbon-darkTextSecondary truncate">إدارة المطاعم</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(item => !item.restricted || isOwner);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <h3 className="px-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  {section.title}
                </h3>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-none font-bold transition-colors ${
                      isActive
                        ? `bg-carbon-blue text-white border-r-4 border-white`
                        : "text-carbon-darkTextSecondary hover:bg-carbon-darkHover hover:text-carbon-darkText border-r-4 border-transparent"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={16} className={collapsed ? "mx-auto shrink-0" : "shrink-0"} />
                    {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout & Collapse toggle */}
      <div className="p-3 border-t border-carbon-darkBorder space-y-1 bg-carbon-darkLayer">
        <button
          onClick={() => window.dispatchEvent(new Event('manual-update-check'))}
          className="w-full text-carbon-darkTextSecondary hover:text-carbon-darkText hover:bg-carbon-darkHover py-2 px-3 flex items-center justify-center gap-2 transition-colors rounded-none"
        >
          <RefreshCw size={14} />
          {!collapsed && <span className="font-bold text-xs whitespace-nowrap">فحص التحديثات</span>}
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-[#da1e28] text-white hover:bg-[#ba1b23] py-2 px-3 flex items-center justify-center gap-2 transition-colors rounded-none"
        >
          <LogOut size={14} />
          {!collapsed && <span className="font-bold text-xs whitespace-nowrap">تسجيل الخروج</span>}
        </button>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-carbon-darkTextSecondary hover:text-carbon-darkText hover:bg-carbon-darkHover py-2 px-3 flex items-center justify-center gap-2 transition-colors rounded-none mt-2"
        >
          {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          {!collapsed && <span className="font-bold text-xs whitespace-nowrap">تصغير القائمة</span>}
        </button>
      </div>
    </aside>
  );
}

