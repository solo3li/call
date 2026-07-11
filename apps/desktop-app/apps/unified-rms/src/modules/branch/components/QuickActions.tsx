import { Plus, FileText, QrCode, Megaphone, Gift, Receipt } from "lucide-react";

const actions = [
 { label: "طلب جديد", icon: Plus, color: "bg-carbon-success/10 text-carbon-success", emoji: "➕" },
 { label: "تقرير يومي", icon: FileText, color: "bg-carbon-blue/10 text-carbon-blue", emoji: "📄" },
 { label: "كود QR", icon: QrCode, color: "bg-carbon-layerHover text-carbon-text", emoji: "📱" },
 { label: "عرض ترويجي", icon: Megaphone, color: "bg-carbon-warning/10 text-carbon-warning", emoji: "📢" },
 { label: "كوبون خصم", icon: Gift, color: "bg-carbon-purple/10 text-carbon-purple", emoji: "🎁" },
 { label: "فاتورة", icon: Receipt, color: "bg-carbon-layer", emoji: "" },
];

export default function QuickActions() {
 return (
 <div className="bg-carbon-layer border-carbon-border p-5">
 <div className="mb-4">
 <h3 className="font-semibold text-lg">⚡ إجراءات سريعة</h3>
 </div>
 <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
 {actions.map((action, index) => (
 <button
 key={index}
 className={`${action.color} p-3 flex flex-col items-center gap-2 text-center`}
 >
 <span className="text-2xl">{action.emoji}</span>
 <span className="text-xs font-medium leading-tight">{action.label}</span>
 </button>
 ))}
 </div>
 </div>
 );
}
