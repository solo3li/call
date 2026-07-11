import React from "react";
import { Bell, User, Menu } from "lucide-react";
import { useAuth } from "../AuthContext";

interface HeaderProps {
  onToggleMobileMenu: () => void;
  pageTitle?: string;
}

export default function Header({ onToggleMobileMenu, pageTitle }: HeaderProps) {
  const { role } = useAuth();
  const userName = localStorage.getItem("userName") || "المستخدم";

  return (
    <header className="h-16 bg-carbon-layer border-b border-carbon-border flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-carbon-text hover:bg-carbon-layerHover transition-colors"
        >
          <Menu size={24} />
        </button>
        {pageTitle && (
          <h2 className="text-xl font-bold text-carbon-text hidden sm:block">
            {pageTitle}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-carbon-textSecondary hover:text-carbon-text hover:bg-carbon-layerHover transition-colors rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-carbon-error rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-r border-carbon-border">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-carbon-text">{userName}</p>
            <p className="text-xs text-carbon-textSecondary capitalize">{role?.replace('_', ' ')}</p>
          </div>
          <div className="w-10 h-10 bg-carbon-bg border border-carbon-border rounded-full flex items-center justify-center">
            <User size={20} className="text-carbon-textSecondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
