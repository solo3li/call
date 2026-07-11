import { useDashboard } from "../context/DashboardContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useState, useEffect } from "react";

export default function WeeklyRatings() {
  const { stats } = useDashboard();
  const ratings = stats?.weeklyRatings || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-carbon-layer border border-carbon-border p-5 h-64 animate-pulse"></div>;

  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="mb-4 border-b border-carbon-border pb-3">
        <h3 className="font-semibold text-base text-carbon-text">تقييمات الأسبوع</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={ratings}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#525252" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#525252" }} axisLine={false} tickLine={false} />
          <Bar dataKey="rating" radius={[2, 2, 0, 0]}>
            {ratings.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.rating >= 4.8
                    ? "#24a148"
                    : entry.rating >= 4.5
                    ? "#0f62fe"
                    : "#8a3ffc"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#24a148] rounded-full"></div>
          <span className="text-[11px] text-carbon-textSecondary">ممتاز (4.8+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#0f62fe] rounded-full"></div>
          <span className="text-[11px] text-carbon-textSecondary">جيد (4.5+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#8a3ffc] rounded-full"></div>
          <span className="text-[11px] text-carbon-textSecondary">متوسط</span>
        </div>
      </div>
    </div>
  );
}
