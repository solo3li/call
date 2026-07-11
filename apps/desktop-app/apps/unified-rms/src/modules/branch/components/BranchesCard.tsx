import { useState, useEffect } from "react";
import { MapPin, Star } from "lucide-react";
import { branchesApi } from "../utils/api";
import { Branch } from "../types/api";

export default function BranchesCard() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    branchesApi.getAll().then(res => {
      if (isMounted) {
        setBranches(res.data || []);
        setLoading(false);
      }
    }).catch(err => {
      if (isMounted) {
        console.error("Failed to load branches:", err);
        setBranches([]);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="bg-carbon-layer border border-carbon-border p-5 animate-pulse">جاري تحميل الفروع...</div>;

  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-lg"> أداء الفروع</h3>
        <p className="text-sm text-carbon-textSecondary font-semibold">اليوم</p>
      </div>
      <div className="space-y-3">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="p-3 rounded-sm border border-carbon-border hover:bg-carbon-layerHover transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-carbon-warning" />
                <h4 className="font-medium text-sm">{branch.name}</h4>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium text-xs ${
                  branch.status === "Open" || branch.status === "مفتوح" ? "bg-[#defbe6] text-[#198038]" : "bg-carbon-error text-white"
                }`}
              >
                {branch.status === "Open" ? "مفتوح" : branch.status === "Closed" ? "مغلق" : branch.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center p-2 bg-carbon-bg rounded-sm border border-gray-200">
                <p className="text-xs text-carbon-textSecondary font-semibold">طلبات</p>
                <p className="font-semibold text-sm">{branch.ordersCount}</p>
              </div>
              <div className="text-center p-2 bg-carbon-bg rounded-sm border border-gray-200">
                <p className="text-xs text-carbon-textSecondary font-semibold">إيرادات</p>
                <p className="font-semibold text-sm">{(branch.revenue / 1000).toFixed(1)}K</p>
              </div>
              <div className="text-center p-2 bg-carbon-bg rounded-sm border border-gray-200">
                <p className="text-xs text-carbon-textSecondary font-semibold">تقييم</p>
                <div className="flex items-center justify-center gap-1">
                  <Star size={12} className="text-[#f1c21b] fill-brand-yellow" />
                  <p className="font-semibold text-sm">{branch.rating}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
