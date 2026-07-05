import { LogOut } from "lucide-react";

export default function Header() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-neo-bg border-b-4 border-neo-border px-6 py-4 flex justify-between items-center shadow-[0px_4px_0px_#1A1A1A]">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="OPNO" className="w-10 h-10 object-contain" />
        <h1 className="text-xl font-black text-neo-text">أوبنو</h1>
      </div>
      
      <button
        onClick={handleLogout}
        className="neo-btn bg-brand-red text-white p-2 md:px-4 md:py-2 flex items-center gap-2"
      >
        <span className="hidden md:inline font-black">تسجيل الخروج</span>
        <LogOut size={20} strokeWidth={3} />
      </button>
    </header>
  );
}
