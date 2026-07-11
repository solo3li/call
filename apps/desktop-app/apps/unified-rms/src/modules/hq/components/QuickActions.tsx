import { Plus, FileText, QrCode, Megaphone, Gift, Receipt } from "lucide-react";

const actions = [
 { label: "طلب جديد", icon: Plus, color: "bg-brand-green", emoji: "➕" },
 { label: "تقرير يومي", icon: FileText, color: "bg-brand-blue", emoji: "📄" },
 { label: "كود QR", icon: QrCode, color: "bg-carbon-purple", emoji: "📱" },
 { label: "عرض ترويجي", icon: Megaphone, color: "bg-carbon-warning", emoji: "📢" },
 { label: "كوبون خصم", icon: Gift, color: "bg-carbon-purple", emoji: "🎁" },
 { label: "فاتورة", icon: Receipt, color: "bg-carbon-warning", emoji: "🧾" },
];

export default function QuickActions() {
 return (
 <div className="neo-card p-5">
 <div className="mb-4">
 <h3 className="font-black text-lg">⚡ إجراءات سريعة</h3>
 </div>
 <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
 {actions.map((action, index) => (
 <button
 key={index}
 className={`${action.color} neo-btn p-3 flex flex-col items-center gap-2 text-center`}
 >
 <span className="text-2xl">{action.emoji}</span>
 <span className="text-xs font-bold leading-tight">{action.label}</span>
 </button>
 ))}
 </div>
 </div>
 );
}
