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
  PhoneCall,
  ShieldCheck,
  ChefHat,
  LifeBuoy,
  Mic,
  Zap,
  Boxes,
  ArrowRightLeft,
  AlertOctagon,
  TrendingUp,
} from "lucide-react";

export type Role = 'admin' | 'cashier' | 'agent' | 'inventory_manager' | 'branch_manager';

export type MenuItem = {
  id: string;
  label: string;
  icon: any;
  color: string;
  roles: Role[];
  path?: string;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const NAVIGATION_SECTIONS: MenuSection[] = [
  {
    title: "الرئيسية",
    items: [
      { id: "hq", label: "اللوحة الرئيسية", icon: LayoutDashboard, color: "text-carbon-blue", roles: ["admin"], path: "/hq" },
      { id: "branch", label: "إدارة الفرع", icon: LayoutDashboard, color: "text-carbon-blue", roles: ["admin", "branch_manager"], path: "/branch" },
      { id: "pos", label: "نقطة بيع (POS)", icon: ShoppingBag, color: "text-[#8a3ffc]", roles: ["admin", "cashier", "branch_manager"], path: "/pos" },
      { id: "callcenter", label: "مركز الاتصال", icon: PhoneCall, color: "text-[#009d9a]", roles: ["admin", "agent"], path: "/call-center" },
      { id: "inventory", label: "إدارة المخزون", icon: Boxes, color: "text-[#da1e28]", roles: ["admin", "inventory_manager", "branch_manager"], path: "/inventory" },
    ]
  },
  {
    title: "إدارة العمليات",
    items: [
      { id: "orders", label: "الطلبات الحية", icon: ShoppingBag, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager", "cashier", "agent"] },
      { id: "kds", label: "شاشة المطبخ (KDS)", icon: ChefHat, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"] },
      { id: "delivery", label: "إدارة التوصيل", icon: Store, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"] },
      { id: "menu", label: "قائمة الطعام", icon: UtensilsCrossed, color: "text-carbon-darkTextSecondary", roles: ["admin"] },
      { id: "customers", label: "العملاء", icon: Users, color: "text-carbon-darkTextSecondary", roles: ["admin", "agent"] },
    ]
  },
  {
    title: "إدارة المنشأة",
    items: [
      { id: "branches", label: "الفروع", icon: Store, color: "text-carbon-darkTextSecondary", roles: ["admin"] },
      { id: "delivery-zones", label: "مناطق التوصيل", icon: MapPin, color: "text-carbon-darkTextSecondary", roles: ["admin"] },
      { id: "staff", label: "الموظفين", icon: Users, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"] },
      { id: "roles", label: "الصلاحيات", icon: ShieldCheck, color: "text-carbon-darkTextSecondary", roles: ["admin"] },
    ]
  },
  {
    title: "النظام",
    items: [
      { id: "analytics", label: "التقارير", icon: BarChart3, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"] },
      { id: "settings", label: "الإعدادات", icon: Settings, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager"] },
      { id: "helpdesk", label: "الدعم الفني", icon: LifeBuoy, color: "text-carbon-darkTextSecondary", roles: ["admin", "branch_manager", "cashier", "agent", "inventory_manager"] }
    ]
  }
];

export const getNavigationForRole = (role: Role | null): MenuSection[] => {
  if (!role) return [];
  
  return NAVIGATION_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(role))
  })).filter(section => section.items.length > 0);
};
