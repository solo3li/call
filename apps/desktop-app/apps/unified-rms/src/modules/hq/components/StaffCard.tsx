import { useState, useEffect } from "react";
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

  if (loading) return <div className="bg-carbon-layer border border-carbon-border p-5 h-64 animate-pulse"></div>;

  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="mb-4 border-b border-carbon-border pb-3">
        <h3 className="font-semibold text-base text-carbon-text">فريق العمل</h3>
      </div>
      <div className="space-y-0 divide-y divide-carbon-border">
        {staff.map((member) => (
          <div
            key={member.id}
            className="py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-carbon-layerHover flex items-center justify-center font-medium text-xs text-carbon-text">
              {member.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-carbon-text truncate">{member.fullName}</h4>
                <div className="flex items-center gap-2">
                   <span
                    className={`w-2 h-2 rounded-full ${
                      member.status === "Available" || member.status === "متاح" ? "bg-carbon-success" : "bg-carbon-warning"
                    }`}
                  ></span>
                </div>
              </div>
              <p className="text-xs text-carbon-textSecondary mt-0.5">{member.role}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-carbon-textSecondary">
                <span>{member.ordersHandled} طلب</span>
                <span>{member.rating} / 5 تقييم</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
