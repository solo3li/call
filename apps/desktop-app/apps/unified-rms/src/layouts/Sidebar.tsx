import React from "react";
import { useLocation } from "react-router-dom";
import { LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import { getNavigationForRole } from "../config/navigation";
import { useAuth, Role } from "../AuthContext";
import { useNavigation } from "../context/NavigationContext";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { role, logout } = useAuth();

  const { activeTab, navigateToTab } = useNavigation();

  const sections = getNavigationForRole(role as Role | null);

  return (
    <aside
      className={`fixed right-0 top-0 h-screen bg-carbon-darkBg border-l border-carbon-darkBorder z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header / Logo Area */}
      <div className="h-16 border-b border-carbon-darkBorder flex items-center px-4 bg-carbon-darkBg">
        <div className="flex-shrink-0 w-8 h-8 bg-carbon-darkLayer flex items-center justify-center font-bold text-white">
          أ
        </div>
        {!collapsed && (
          <div className="mr-3 overflow-hidden">
            <h1 className="font-bold text-white leading-tight">أوبنو</h1>
            <p className="text-[10px] text-carbon-darkTextSecondary">الإدارة الموحدة</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="px-4 text-xs font-semibold text-carbon-darkTextSecondary mb-2 tracking-wide">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigateToTab(item.id, item.path)}
                      className={`w-full flex items-center px-4 py-2.5 transition-colors group ${
                        isActive 
                          ? "bg-carbon-darkLayer border-r-4 border-carbon-blue text-white" 
                          : "text-carbon-darkTextSecondary hover:bg-carbon-darkHover hover:text-white border-r-4 border-transparent"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon 
                        size={20} 
                        className={`flex-shrink-0 ${isActive ? item.color : "text-carbon-darkTextSecondary group-hover:text-white"}`} 
                      />
                      {!collapsed && (
                        <span className="mr-3 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis text-right">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Area */}
      <div className="border-t border-carbon-darkBorder bg-carbon-darkBg">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-carbon-darkTextSecondary hover:bg-carbon-darkHover hover:text-white transition-colors"
          title={collapsed ? "تسجيل الخروج" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0 text-carbon-error" />
          {!collapsed && <span className="mr-3 text-sm font-medium text-carbon-error">تسجيل الخروج</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-3 border-t border-carbon-darkBorder text-carbon-darkTextSecondary hover:bg-carbon-darkHover transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}
