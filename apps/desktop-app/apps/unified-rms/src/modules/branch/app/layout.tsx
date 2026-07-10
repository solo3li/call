import "./globals.css";
import React from "react";
import { DashboardProvider } from "../context/DashboardContext";

export const metadata = {
  title: "أوبنو - نظام إدارة المطاعم",
  description: "نظام إدارة المطاعم والكافيهات السحابي الأسهل والأسرع",
};

import AutoUpdater from "../components/AutoUpdater";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-neo-bg text-neo-text font-cairo min-h-screen flex flex-col">
        <DashboardProvider>
          {children}
        </DashboardProvider>
        <AutoUpdater />
      </body>
    </html>
  );
}
