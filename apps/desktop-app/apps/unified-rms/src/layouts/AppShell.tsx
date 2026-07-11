import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-carbon-bg text-carbon-text font-cairo" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed right-0 top-0 h-screen z-50 transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <Sidebar collapsed={false} setCollapsed={() => {}} />
      </div>

      {/* Main Content Area */}
      <main className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? "lg:mr-16" : "lg:mr-64"}`}>
        <Header 
          pageTitle={pageTitle}
          onToggleMobileMenu={() => setMobileMenuOpen(true)} 
        />
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
        
        {/* Global Footer */}
        <footer className="p-6 text-center border-t border-carbon-border mt-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 text-carbon-textSecondary">
            <span className="font-bold text-carbon-text text-sm">أوبنو للإدارة الموحدة</span>
            <span className="text-carbon-border">|</span>
            <span className="text-xs text-carbon-textSecondary">
              © {new Date().getFullYear()} جميع الحقوق محفوظة
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
