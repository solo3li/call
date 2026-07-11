import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RevenuePoint, HourlyOrders } from "../types/api";

interface RevenueChartProps {
  data: RevenuePoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-carbon-layer h-full">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="0" stroke="var(--carbon-border, #393939)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--carbon-textSecondary, #c6c6c6)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--carbon-textSecondary, #c6c6c6)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--carbon-layer, #161616)",
              border: "1px solid var(--carbon-border, #393939)",
              borderRadius: "0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              fontSize: "12px",
              color: "var(--carbon-text, #f4f4f4)"
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name="إيرادات"
            stroke="#0f62fe"
            strokeWidth={2}
            dot={{ stroke: '#0f62fe', strokeWidth: 2, fill: '#ffffff', r: 4 }}
            activeDot={{ stroke: '#0f62fe', strokeWidth: 2, fill: '#0f62fe', r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface OrdersChartProps {
  data: HourlyOrders[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <div className="bg-carbon-layer h-full">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="0" stroke="var(--carbon-border, #393939)" vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--carbon-textSecondary, #c6c6c6)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--carbon-textSecondary, #c6c6c6)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--carbon-layer, #161616)",
              border: "1px solid var(--carbon-border, #393939)",
              borderRadius: "0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              fontSize: "12px",
              color: "var(--carbon-text, #f4f4f4)"
            }}
            cursor={{ fill: '#f4f4f4' }}
          />
          <Bar dataKey="orders" name="طلبات" fill="#0f62fe" radius={[0, 0, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart() {
  const categoryData = [
    { name: "مشروبات ساخنة", value: 35, color: "#0f62fe" },
    { name: "مشروبات باردة", value: 25, color: "#1192e8" },
    { name: "وجبات رئيسية", value: 20, color: "#005d5d" },
    { name: "حلويات", value: 12, color: "#9f1853" },
    { name: "مقبلات", value: 8, color: "#fa4d56" },
  ];

  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="mb-4 border-b border-carbon-border pb-3">
        <h3 className="font-semibold text-base text-carbon-text">المبيعات حسب الفئة</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            dataKey="value"
            stroke="none"
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={{ strokeWidth: 1, stroke: "#c6c6c6" }}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--carbon-layer, #161616)",
              border: "1px solid var(--carbon-border, #393939)",
              borderRadius: "0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              fontSize: "12px",
              color: "var(--carbon-text, #f4f4f4)"
            }}
            itemStyle={{ color: "var(--carbon-text, #f4f4f4)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
