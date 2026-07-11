import { Plus, FileText, QrCode, Megaphone, Gift, Receipt } from "lucide-react";

const actions = [
  { label: "طلب جديد", icon: Plus, color: "bg-[#defbe6] text-[#198038]", emoji: "➕" },
  { label: "تقرير يومي", icon: FileText, color: "bg-[#edf5ff] text-[#0f62fe]", emoji: "📄" },
  { label: "كود QR", icon: QrCode, color: "bg-[#e8daff] text-[#6929c4]", emoji: "📱" },
  { label: "عرض ترويجي", icon: Megaphone, color: "bg-[#fcf4d6] text-[#b47a00]", emoji: "📢" },
  { label: "كوبون خصم", icon: Gift, color: "bg-[#fff0f7] text-[#ff7eb6]", emoji: "🎁" },
  { label: "فاتورة", icon: Receipt, color: "bg-carbon-layer", emoji: "" },
];

export default function QuickActions() {
  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">⚡ إجراءات سريعة</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`${action.color} px-4 py-2 text-sm font-medium transition-colors bg-carbon-blue text-white hover:bg-carbon-blueHover p-3 flex flex-col items-center gap-2 text-center`}
          >
            <span className="text-2xl">{action.emoji}</span>
            <span className="text-xs font-medium leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
