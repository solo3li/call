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
  LifeBuoy
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
    ]
  },
  {
    title: "إدارة العمليات",
    items: [
      { id: "orders", label: "الطلبات", icon: ShoppingBag, color: "bg-brand-orange" },
      { id: "kds", label: "شاشة المطبخ", icon: ChefHat, color: "bg-brand-red text-white" },
      { id: "delivery", label: "إدارة التوصيل", icon: Store, color: "bg-brand-yellow" },
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
      { id: "settings", label: "الإعدادات", icon: Settings, color: "bg-brand-lime" },
      { id: "helpdesk", label: "الدعم الفني للمنصة", icon: LifeBuoy, color: "bg-[#FF69B4] text-white" }
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
      className={`fixed right-0 top-0 h-screen bg-neo-card border-l-2 border-neo-border z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b-2 border-neo-border flex items-center gap-3">
        <div className="w-12 h-12 neo-card-flat flex items-center justify-center shrink-0 overflow-hidden p-0 bg-[#FFFBEB]">
          <img src="/logo.png" alt="OPNO Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-black text-lg leading-tight">أوبنو</h1>
            <p className="text-xs font-bold text-gray-500">إدارة المطاعم</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-scrollbar">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(item => !item.restricted || isOwner);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                      isActive
                        ? `${item.color} neo-btn text-neo-text scale-[1.02]`
                        : "hover:bg-gray-100 text-gray-600 hover:text-neo-text"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={22} className="shrink-0" />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout & Collapse toggle */}
      <div className="p-3 border-t-2 border-neo-border space-y-2 bg-gray-50/50">
        <button
          onClick={onLogout}
          className="w-full neo-btn bg-brand-red text-white p-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-bold text-sm">تسجيل الخروج</span>}
        </button>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full neo-btn bg-gray-100 p-2 flex items-center justify-center gap-2 transition-all"
        >
          {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          {!collapsed && <span className="font-bold text-sm">تصغير القائمة</span>}
        </button>
      </div>
    </aside>
  );
}
