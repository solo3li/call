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
  ShieldCheck,
  ChefHat,
  LifeBuoy,
  Zap,
  Boxes,
  AppWindow
} from "lucide-react";

export type Role = 'admin' | 'cashier' | 'agent' | 'inventory_manager' | 'branch_manager';

export type MenuItem = {
  id: string;
  label: string;
  icon: any;
  color: string;
  roles: Role[];
  path?: string;
  modules?: ('hq' | 'branch' | 'pos' | 'inventory')[];
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const NAVIGATION_SECTIONS: MenuSection[] = [
  {
    title: "الرئيسية",
    items: [
      { id: "hq", label: "اللوحة الرئيسية للإدارة", icon: LayoutDashboard, color: "text-carbon-blue", roles: ["admin"], modules: ["hq"] },
      { id: "branch", label: "اللوحة الرئيسية للفرع", icon: LayoutDashboard, color: "text-carbon-blue", roles: ["admin", "branch_manager"], modules: ["branch"] },
      { id: "pos", label: "شاشة الكاشير", icon: ShoppingBag, color: "text-[#8a3ffc]", roles: ["admin", "cashier", "branch_manager"], modules: ["pos"] },
      { id: "inventory", label: "شاشة المخزون", icon: Boxes, color: "text-[#da1e28]", roles: ["admin", "inventory_manager", "branch_manager"], modules: ["inventory"] },
    ]
  },
  {
    title: "إدارة العمليات",
    items: [
      { id: "orders", label: "الطلبات الحية", icon: ShoppingBag, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager", "cashier", "agent"], modules: ["branch", "pos"] },
      { id: "kds-monitor", label: "مراقبة المطبخ", icon: ChefHat, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["branch"] },
      { id: "kds-station", label: "محطة الطهي", icon: UtensilsCrossed, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["branch"] },
      { id: "delivery", label: "إدارة التوصيل", icon: Store, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["branch"] },
      { id: "smart-delivery", label: "التوصيل الذكي", icon: Zap, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["branch"] },
      { id: "delivery-driver", label: "شاشة المندوب", icon: Users, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["branch"] },
      { id: "menu", label: "قائمة الطعام", icon: UtensilsCrossed, color: "text-carbon-darkTextSecondary", roles: ["admin"], modules: ["hq"] },
      { id: "customers", label: "العملاء", icon: Users, color: "text-carbon-darkTextSecondary", roles: ["admin", "agent"], modules: ["hq"] },
      { id: "support", label: "دعم العملاء والشكاوى", icon: MessageSquare, color: "text-carbon-darkTextSecondary", roles: ["admin", "agent", "branch_manager"], modules: ["hq", "branch"] },
    ]
  },
  {
    title: "إدارة المنشأة",
    items: [
      { id: "branches", label: "الفروع", icon: Store, color: "text-carbon-darkTextSecondary", roles: ["admin"], modules: ["hq"] },
      { id: "delivery-zones", label: "مناطق التوصيل", icon: MapPin, color: "text-carbon-darkTextSecondary", roles: ["admin"], modules: ["hq"] },
      { id: "kitchen-stations", label: "محطات المطبخ", icon: ChefHat, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["branch"] },
      { id: "staff", label: "الموظفين", icon: Users, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["hq", "branch"] },
      { id: "roles", label: "الصلاحيات", icon: ShieldCheck, color: "text-carbon-darkTextSecondary", roles: ["admin"], modules: ["hq"] },
    ]
  },
  {
    title: "التحليل والتقييم",
    items: [
      { id: "analytics", label: "التقارير", icon: BarChart3, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["hq", "branch"] },
    ]
  },
  {
    title: "النظام",
    items: [
      { id: "settings", label: "الإعدادات", icon: Settings, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"], modules: ["hq", "branch"] },
      { id: "external-companies", label: "شركات التوصيل", icon: Store, color: "text-carbon-darkTextSecondary", roles: ["admin"], modules: ["hq"] },
      { id: "helpdesk", label: "الدعم الفني للمنصة", icon: LifeBuoy, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager", "cashier", "agent", "inventory_manager"], modules: ["hq", "branch", "pos", "inventory"] }
    ]
  },
  {
    title: "تطبيقات أوبنو",
    items: [
      { id: "hq", label: "اللوحة الرئيسية للإدارة", icon: LayoutDashboard, color: "text-carbon-blue", roles: ["admin"], path: "/hq" },
      { id: "branch", label: "إدارة الفرع", icon: Store, color: "text-carbon-blue", roles: ["admin", "branch_manager"], path: "/branch" },
      { id: "pos", label: "نقطة بيع (POS)", icon: ShoppingBag, color: "text-[#8a3ffc]", roles: ["admin", "cashier", "branch_manager"], path: "/pos" },
      { id: "inventory", label: "إدارة المخزون", icon: Boxes, color: "text-[#da1e28]", roles: ["admin", "inventory_manager", "branch_manager"], path: "/inventory" },
    ]
  }
];

export const getNavigationForRole = (role: Role | null, currentModule: 'hq' | 'branch' | 'pos' | 'inventory' = 'hq'): MenuSection[] => {
  if (!role) return [];
  
  return NAVIGATION_SECTIONS.map(section => {
    // If it's the App Switcher section, hide the link for the current module
    if (section.title === "تطبيقات أوبنو") {
      return {
        ...section,
        items: section.items.filter(item => item.roles.includes(role) && item.id !== currentModule)
      };
    }
    
    // Otherwise filter by roles and module
    return {
      ...section,
      items: section.items.filter(item => 
        item.roles.includes(role) && (!item.modules || item.modules.includes(currentModule))
      )
    };
  }).filter(section => section.items.length > 0);
};
