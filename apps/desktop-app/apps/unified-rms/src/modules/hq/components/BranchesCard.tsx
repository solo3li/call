import { useState, useEffect } from "react";
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

 if (loading) return <div className="bg-carbon-layer border-carbon-border p-5 h-64 animate-pulse"></div>;

 return (
 <div className="bg-carbon-layer border-carbon-border p-5">
 <div className="mb-4 border-b border-carbon-border pb-3">
 <h3 className="font-semibold text-base text-carbon-text">أداء الفروع</h3>
 </div>
 <div className="space-y-0 divide-y divide-carbon-border">
 {branches.map((branch) => (
 <div
 key={branch.id}
 className="py-3"
 >
 <div className="flex items-center justify-between mb-2">
 <h4 className="font-medium text-sm text-carbon-text">{branch.name}</h4>
 <span
 className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
 branch.status === "Open" || branch.status === "مفتوح" ? "bg-carbon-success/10 text-carbon-success" : "bg-[#fff1f1] text-[#da1e28]"
 }`}
 >
 {branch.status === "Open" ? "مفتوح" : branch.status === "Closed" ? "مغلق" : branch.status}
 </span>
 </div>
 <div className="flex items-center justify-between mt-1 text-carbon-textSecondary">
 <div className="flex flex-col">
 <span className="text-[10px] font-medium">الطلبات</span>
 <span className="font-medium text-xs text-carbon-text">{branch.ordersCount}</span>
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-medium">الإيرادات</span>
 <span className="font-medium text-xs text-carbon-text">{(branch.revenue / 1000).toFixed(1)}K</span>
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-medium">التقييم</span>
 <span className="font-medium text-xs text-carbon-text">{branch.rating} / 5</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
