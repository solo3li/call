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
 ShieldCheck,
 ChefHat,
 LifeBuoy,
 RefreshCw,
 Zap
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
 { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
 { id: "pos", label: "نقطة بيع (POS)", icon: ShoppingBag },
 ]
 },
 {
 title: "إدارة العمليات",
 items: [
 { id: "orders", label: "الطلبات", icon: ShoppingBag },
 { id: "kds-monitor", label: "مراقبة المطبخ", icon: ChefHat },
 { id: "kds-station", label: "محطة الطهي", icon: UtensilsCrossed },
 { id: "delivery", label: "إدارة التوصيل", icon: Store },
 { id: "smart-delivery", label: "التوصيل الذكي", icon: Zap },
 { id: "delivery-driver", label: "شاشة المندوب", icon: Users },
 { id: "menu", label: "قائمة الطعام", icon: UtensilsCrossed },
 { id: "customers", label: "العملاء", icon: Users },
 { id: "support", label: "دعم العملاء والشكاوى", icon: MessageSquare },
 ]
 },
 {
 title: "إدارة المنشأة",
 items: [
 { id: "branches", label: "الفروع", icon: Store, restricted: true },
 { id: "delivery-zones", label: "مناطق التوصيل", icon: MapPin, restricted: true },
 { id: "kitchen-stations", label: "محطات المطبخ", icon: ChefHat, restricted: true },
 { id: "staff", label: "الموظفين", icon: Users, restricted: true },
 { id: "roles", label: "الصلاحيات", icon: ShieldCheck, restricted: true },
 ]
 },
 {
 title: "التحليل والتقييم",
 items: [
 { id: "analytics", label: "التقارير", icon: BarChart3, restricted: true },
 ]
 },
 {
 title: "النظام",
 items: [
 { id: "settings", label: "الإعدادات", icon: Settings },
 { id: "external-companies", label: "شركات التوصيل", icon: Store, restricted: true },
 { id: "helpdesk", label: "الدعم الفني للمنصة", icon: LifeBuoy }
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
 className={`fixed right-0 top-0 h-screen bg-carbon-darkBg border-l border-carbon-darkBorder z-50 flex flex-col transition-all duration-300 ${
 collapsed ? "w-14" : "w-52"
 }`}
 >
 {/* Logo */}
 <div className="p-4 flex items-center gap-3">
 <div className="w-8 h-8 flex items-center justify-center shrink-0">
 <div className="w-full h-full bg-carbon-blue text-white flex items-center justify-center font-bold text-sm">O</div>
 </div>
 {!collapsed && (
 <div className="overflow-hidden flex-1">
 <h1 className="font-semibold text-sm leading-tight text-carbon-darkText truncate tracking-wide">أوبنو RMS</h1>
 </div>
 )}
 </div>

 {/* Menu */}
 <nav className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
 {menuSections.map((section, idx) => {
 const visibleItems = section.items.filter(item => !item.restricted || isOwner);
 if (visibleItems.length === 0) return null;

 return (
 <div key={section.title} className="mb-4">
 {!collapsed && (
 <h3 className="px-4 text-[11px] font-medium text-carbon-darkTextSecondary mb-2">
 {section.title}
 </h3>
 )}
 <ul className="space-y-0">
 {visibleItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <li key={item.id}>
 <button
 onClick={() => setActiveTab(item.id)}
 className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
 isActive
 ? "bg-carbon-darkHover text-carbon-darkText border-r-4 border-carbon-blue"
 : "text-carbon-darkTextSecondary hover:bg-carbon-darkLayer hover:text-carbon-darkText border-r-4 border-transparent"
 }`}
 title={collapsed ? item.label : undefined}
 >
 <Icon size={18} className={collapsed ? "mx-auto shrink-0" : "shrink-0"} strokeWidth={1.5} />
 {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>}
 </button>
 </li>
 );
 })}
 </ul>
 {idx < menuSections.length - 1 && <hr className="mx-4 mt-4 border-carbon-darkBorder" />}
 </div>
 );
 })}
 </nav>

 {/* Footer / Utilities */}
 <div className="border-t border-carbon-darkBorder">
 <button
 onClick={() => window.dispatchEvent(new Event('manual-update-check'))}
 className="w-full text-carbon-darkTextSecondary hover:text-carbon-darkText hover:bg-carbon-darkLayer py-3 px-4 flex items-center gap-3 transition-colors"
 >
 <RefreshCw size={18} strokeWidth={1.5} />
 {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap">تحديث النظام</span>}
 </button>

 <button
 onClick={onLogout}
 className="w-full text-carbon-darkTextSecondary hover:text-white hover:bg-carbon-error py-3 px-4 flex items-center gap-3 transition-colors"
 >
 <LogOut size={18} strokeWidth={1.5} />
 {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap">تسجيل الخروج</span>}
 </button>
 
 <button
 onClick={() => setCollapsed(!collapsed)}
 className="w-full text-carbon-darkTextSecondary hover:text-carbon-darkText hover:bg-carbon-darkLayer py-3 px-4 flex items-center gap-3 transition-colors border-t border-carbon-darkBorder"
 >
 {collapsed ? <ChevronLeft size={18} strokeWidth={1.5} /> : <ChevronRight size={18} strokeWidth={1.5} />}
 {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap">تصغير القائمة</span>}
 </button>
 </div>
 </aside>
 );
}
