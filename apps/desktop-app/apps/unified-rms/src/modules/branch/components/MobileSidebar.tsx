import { X, LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, BarChart3, Settings, Store, MessageSquare, ShieldCheck, ChefHat } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuSections = [
  {
    title: "الرئيسية",
    items: [
      { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, color: "bg-carbon-layer" },
      { id: "pos", label: "نقطة بيع (POS)", icon: ShoppingBag, color: "bg-[#e8daff] text-[#6929c4] text-white" },
    ]
  },
  {
    title: "إدارة العمليات",
    items: [
      { id: "orders", label: "الطلبات", icon: ShoppingBag, color: "bg-[#fcf4d6] text-[#b47a00]" },
      { id: "kds", label: "شاشة المطبخ", icon: ChefHat, color: "bg-carbon-error text-white" },
      { id: "delivery", label: "إدارة التوصيل", icon: Store, color: "bg-carbon-layer" },
      { id: "delivery-driver", label: "شاشة المندوب", icon: Users, color: "bg-[#e5f6ff] text-[#00a68f]" },
      { id: "menu", label: "قائمة الطعام", icon: UtensilsCrossed, color: "bg-[#defbe6] text-[#198038]" },
    ]
  },
  {
    title: "إدارة المنشأة",
    items: [
      { id: "branches", label: "الفروع", icon: Store, color: "bg-[#edf5ff] text-[#0f62fe]", restricted: true },
      { id: "staff", label: "الموظفين", icon: Users, color: "bg-[#fff0f7] text-[#ff7eb6]", restricted: true },
      { id: "roles", label: "الصلاحيات", icon: ShieldCheck, color: "bg-[#e8daff] text-[#6929c4] text-white", restricted: true },
    ]
  },
  {
    title: "التحليل والتقييم",
    items: [
      { id: "analytics", label: "التقارير", icon: BarChart3, color: "bg-[#e8daff] text-[#6929c4]", restricted: true },
      { id: "reviews", label: "التقييمات", icon: MessageSquare, color: "bg-[#e5f6ff] text-[#00a68f]" },
    ]
  },
  {
    title: "النظام",
    items: [
      { id: "settings", label: "الإعدادات", icon: Settings, color: "bg-brand-lime" },
    ]
  }
];

export default function MobileSidebar({ isOpen, onClose, activeTab, setActiveTab }: MobileSidebarProps) {
  const userRole = typeof window !== 'undefined' ? (localStorage.getItem("userRole") || "Staff") : "Staff";
  const isOwner = userRole.includes("Owner") || userRole.includes("Admin") || userRole.includes("Manager");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-72 bg-bg-carbon-layer border border-carbon-border border-l-2 border-carbon-border  overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b-2 border-carbon-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-carbon-layer border border-carbon-border-flat flex items-center justify-center shrink-0 overflow-hidden p-0 bg-[#FFFBEB]">
              <img src="/logo.png" alt="OPNO Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-semibold">أوبنو</h1>
          </div>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium transition-colors bg-carbon-error text-white hover:bg-[#ba1b23] text-white p-1.5">
            <X size={18} />
          </button>
        </div>
        <nav className="p-3 space-y-6">
          {menuSections.map((section) => {
            const visibleItems = section.items.filter(item => !item.restricted || isOwner);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <h3 className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  {section.title}
                </h3>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-sm font-medium transition-all ${
                        isActive
                          ? `${item.color} px-4 py-2 text-sm font-medium transition-colors bg-carbon-blue text-white hover:bg-carbon-blueHover text-carbon-text`
                          : "hover:bg-carbon-layerHover text-carbon-textSecondary"
                      }`}
                    >
                      <Icon size={22} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
