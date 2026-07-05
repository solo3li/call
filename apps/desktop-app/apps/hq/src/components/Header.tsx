import { Menu } from "lucide-react";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleMobile: () => void;
}

export default function Header({ onToggleMobile }: HeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-neo-bg/80 backdrop-blur-md border-b-2 border-neo-border px-4 py-3">
      <button
        onClick={onToggleMobile}
        className="neo-btn bg-brand-yellow p-2 shadow-[2px_2px_0px_#1A1A1A]"
      >
        <Menu size={22} />
      </button>
    </header>
  );
}
