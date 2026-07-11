import { Menu } from "lucide-react";

interface HeaderProps {
 sidebarCollapsed: boolean;
 onToggleMobile: () => void;
}

export default function Header({ onToggleMobile }: HeaderProps) {
 return (
 <header className="lg:hidden sticky top-0 z-40 bg-carbon-bg/80 backdrop-blur-md border-b border-carbon-border px-4 py-3">
 <button
 onClick={onToggleMobile}
 className="p-2 text-carbon-text hover:bg-carbon-layerHover transition-colors rounded-none"
 >
 <Menu size={22} />
 </button>
 </header>
 );
}
