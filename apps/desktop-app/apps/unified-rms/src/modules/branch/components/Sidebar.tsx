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
 Truck
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
 { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, color: "bg-carbon-layer" },
 { id: "pos", label: "نقطة بيع (POS)", icon: ShoppingBag, color: "bg-carbon-layerHover text-carbon-text text-white" },
 ]
 },
 {
 title: "إدارة العمليات",
 items: [
 { id: "orders", label: "الطلبات", icon: ShoppingBag, color: "bg-carbon-warning/10 text-carbon-warning" },
 { id: "kds-monitor", label: "مراقبة المطبخ", icon: ChefHat, color: "bg-carbon-error text-white" },
 { id: "kds-station", label: "محطة الطهي", icon: UtensilsCrossed, color: "bg-carbon-warning/10 text-carbon-warning text-white" },
 { id: "delivery", label: "إدارة التوصيل", icon: Store, color: "bg-carbon-layer" },
 { id: "smart-delivery", label: "التوصيل الذكي", icon: Zap, color: "bg-carbon-error text-white" },
 { id: "delivery-driver", label: "شاشة المندوب", icon: Users, color: "bg-[#e5f6ff] text-[#00a68f]" },
 { id: "menu", label: "قائمة الطعام", icon: UtensilsCrossed, color: "bg-carbon-success/10 text-carbon-success" },
 { id: "customers", label: "العملاء", icon: Users, color: "bg-[#e5f6ff] text-[#00a68f]" },
 { id: "support", label: "دعم العملاء والشكاوى", icon: MessageSquare, color: "bg-carbon-layerHover text-carbon-text text-white" },
 ]
 },
 {
 title: "إدارة المنشأة",
 items: [
 { id: "branches", label: "الفروع", icon: Store, color: "bg-carbon-blue/10 text-carbon-blue", restricted: true },
 { id: "delivery-zones", label: "مناطق التوصيل", icon: MapPin, color: "bg-carbon-warning/10 text-carbon-warning text-white", restricted: true },
 { id: "kitchen-stations", label: "محطات المطبخ", icon: ChefHat, color: "bg-carbon-error text-white", restricted: true },
 { id: "staff", label: "الموظفين", icon: Users, color: "bg-carbon-purple/10 text-carbon-purple", restricted: true },
 { id: "roles", label: "الصلاحيات", icon: ShieldCheck, color: "bg-carbon-layerHover text-carbon-text text-white", restricted: true },
 ]
 },
 {
 title: "التحليل والتقييم",
 items: [
 { id: "analytics", label: "التقارير", icon: BarChart3, color: "bg-carbon-layerHover text-carbon-text", restricted: true },
 ]
 },
 {
 title: "النظام",
 items: [
 { id: "settings", label: "الإعدادات", icon: Settings, color: "text-white" },
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
 className={`fixed right-0 top-0 h-screen bg-carbon-layer border-l border-carbon-border z-50 flex flex-col transition-all duration-300 ${
 collapsed ? "w-14" : "w-52"
 }`}
 >
 {/* Logo */}
 <div className="p-4 border-b border-carbon-border flex items-center gap-2">
 <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden bg-carbon-layer">
 <img src="/logo.png" alt="OPNO Logo" className="w-full h-full object-contain p-0.5" />
 </div>
 {!collapsed && (
 <div className="overflow-hidden">
 <h1 className="font-medium text-base leading-tight truncate text-white">أوبنو</h1>
 <p className="text-[10px] font-normal text-carbon-textSecondary truncate">إدارة المطاعم</p>
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
 <h3 className="px-2 text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
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
 className={`w-full flex items-center gap-2 px-3 py-2 rounded-none font-medium transition-colors ${
 isActive
 ? `bg-carbon-blue text-white border-r-4 border-white`
 : "text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white border-r-4 border-transparent"
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
 <div className="p-3 border-t border-carbon-border space-y-1 bg-carbon-layer">
 <button
 onClick={() => window.dispatchEvent(new Event('manual-update-check'))}
 className="w-full text-carbon-textSecondary hover:text-white hover:bg-carbon-layerHover py-2 px-3 flex items-center justify-center gap-2 transition-colors rounded-none"
 >
 <RefreshCw size={14} />
 {!collapsed && <span className="font-medium text-xs whitespace-nowrap">فحص التحديثات</span>}
 </button>

 <button
 onClick={onLogout}
 className="w-full bg-carbon-error text-white hover:bg-[#ba1b23] py-2 px-3 flex items-center justify-center gap-2 transition-colors rounded-none"
 >
 <LogOut size={14} />
 {!collapsed && <span className="font-medium text-xs whitespace-nowrap">تسجيل الخروج</span>}
 </button>
 
 <button
 onClick={() => setCollapsed(!collapsed)}
 className="w-full text-carbon-textSecondary hover:text-white hover:bg-carbon-layerHover py-2 px-3 flex items-center justify-center gap-2 transition-colors rounded-none mt-2"
 >
 {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
 {!collapsed && <span className="font-medium text-xs whitespace-nowrap">تصغير القائمة</span>}
 </button>
 </div>
 </aside>
 );
}

