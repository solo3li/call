import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { staffApi } from "../utils/api";
import { Staff } from "../types/api";

export default function StaffCard() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    staffApi.getAll().then(res => {
      if (isMounted) {
        setStaff(res.data || []);
        setLoading(false);
      }
    }).catch(err => {
      if (isMounted) {
        console.error("Failed to load staff:", err);
        setStaff([]);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="neo-card p-5 animate-pulse">جاري تحميل فريق العمل...</div>;

  return (
    <div className="neo-card p-5">
      <div className="mb-4">
        <h3 className="font-black text-lg">👨‍🍳 فريق العمل</h3>
        <p className="text-sm text-gray-500 font-semibold">الحالة الحالية</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {staff.map((member) => (
          <div
            key={member.id}
            className="p-4 rounded-xl border-2 border-neo-border hover:bg-yellow-50 transition-colors flex items-center gap-3"
          >
            <div className="text-3xl">{member.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm truncate">{member.fullName}</h4>
                <span
                  className={`w-2.5 h-2.5 rounded-full border border-neo-border ${
                    member.status === "Available" || member.status === "متاح" ? "bg-brand-green" : "bg-brand-orange"
                  }`}
                ></span>
              </div>
              <p className="text-xs text-gray-500 font-semibold">{member.role}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold">{member.ordersHandled} طلب</span>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="text-brand-yellow fill-brand-yellow" />
                  <span className="text-xs font-bold">{member.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
