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

  if (!mounted) return <div className="bg-carbon-layer border border-carbon-border p-5 h-64 animate-pulse bg-carbon-bg"></div>;

  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-lg"> تقييمات الأسبوع</h3>
        <p className="text-sm text-carbon-textSecondary font-semibold">متوسط التقييم اليومي</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={ratings}>
          <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 700 }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 12, fontWeight: 700 }} />
          <Bar dataKey="rating" radius={[8, 8, 0, 0]} strokeWidth={2} stroke="#1A1A1A">
            {ratings.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.rating >= 4.8
                    ? "#00E676"
                    : entry.rating >= 4.5
                    ? "#FFD700"
                    : "#FF6B35"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#defbe6] text-[#198038] rounded border border-carbon-border"></div>
          <span className="text-xs font-medium">ممتاز (4.8+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-carbon-layer rounded border border-carbon-border"></div>
          <span className="text-xs font-medium">جيد (4.5+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#fcf4d6] text-[#b47a00] rounded border border-carbon-border"></div>
          <span className="text-xs font-medium">متوسط</span>
        </div>
      </div>
    </div>
  );
}
