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
 <div className="bg-carbon-layer border-carbon-border p-5">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="font-semibold text-lg"> الإيرادات</h3>
 <p className="text-sm text-carbon-textSecondary font-semibold">آخر 7 أشهر</p>
 </div>
 <div className="flex gap-3">
 <div className="flex items-center gap-1.5">
 <div className="w-3 h-3 bg-carbon-success/10 text-carbon-success rounded border-carbon-border"></div>
 <span className="text-xs font-medium">إيرادات</span>
 </div>
 </div>
 </div>
 <ResponsiveContainer width="100%" height={280}>
 <LineChart data={data}>
 <CartesianGrid strokeDasharray="0" stroke="#1A1A1A" vertical={false} />
 <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 900, fill: '#1A1A1A' }} axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} tickLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} />
 <YAxis tick={{ fontSize: 12, fontWeight: 900, fill: '#1A1A1A' }} axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} tickLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} />
 <Tooltip
 contentStyle={{
 background: "#FFFBEB",
 border: "2px solid #1A1A1A",
 borderRadius: "8px",
 boxShadow: "3px 3px 0px #1A1A1A",
 fontWeight: 900,
 color: "#1A1A1A"
 }}
 />
 <Line
 type="step"
 dataKey="revenue"
 name="إيرادات"
 stroke="#00E676"
 strokeWidth={4}
 dot={{ stroke: '#1A1A1A', strokeWidth: 2, fill: '#00E676', r: 6 }}
 activeDot={{ stroke: '#1A1A1A', strokeWidth: 2, fill: '#00E676', r: 8 }}
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
 <div className="bg-carbon-layer border-carbon-border p-5">
 <div className="mb-4">
 <h3 className="font-semibold text-lg"> الطلبات حسب الساعة</h3>
 <p className="text-sm text-carbon-textSecondary font-semibold">توزيع الطلبات اليوم</p>
 </div>
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={data}>
 <CartesianGrid strokeDasharray="0" stroke="#1A1A1A" vertical={false} />
 <XAxis dataKey="hour" tick={{ fontSize: 11, fontWeight: 900, fill: '#1A1A1A' }} axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} tickLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} />
 <YAxis tick={{ fontSize: 12, fontWeight: 900, fill: '#1A1A1A' }} axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} tickLine={{ stroke: '#1A1A1A', strokeWidth: 2 }} />
 <Tooltip
 contentStyle={{
 background: "#FFFBEB",
 border: "2px solid #1A1A1A",
 borderRadius: "8px",
 boxShadow: "3px 3px 0px #1A1A1A",
 fontWeight: 900,
 color: "#1A1A1A"
 }}
 cursor={{ fill: 'rgba(26, 26, 26, 0.1)' }}
 />
 <Bar dataKey="orders" name="طلبات" radius={[6, 6, 0, 0]} strokeWidth={3} stroke="#1A1A1A">
 {data.map((_, index) => (
 <Cell
 key={`cell-${index}`}
 fill={
 index % 4 === 0
 ? "#FFD700"
 : index % 4 === 1
 ? "#FF6B35"
 : index % 4 === 2
 ? "#448AFF"
 : "#00E676"
 }
 />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 );
}

export function CategoryChart() {
 const categoryData = [
 { name: "مشروبات ساخنة", value: 35, color: "#FF6B35" },
 { name: "مشروبات باردة", value: 25, color: "#448AFF" },
 { name: "وجبات رئيسية", value: 20, color: "#00E676" },
 { name: "حلويات", value: 12, color: "#FF69B4" },
 { name: "مقبلات", value: 8, color: "#FFD700" },
 ];

 return (
 <div className="bg-carbon-layer border-carbon-border p-5">
 <div className="mb-4">
 <h3 className="font-semibold text-lg"> المبيعات حسب الفئة</h3>
 <p className="text-sm text-carbon-textSecondary font-semibold">توزيع المبيعات</p>
 </div>
 <ResponsiveContainer width="100%" height={280}>
 <PieChart>
 <Pie
 data={categoryData}
 cx="50%"
 cy="50%"
 outerRadius={100}
 innerRadius={50}
 dataKey="value"
 strokeWidth={3}
 stroke="#1A1A1A"
 label={({ name, value }) => `${name} ${value}%`}
 labelLine={{ strokeWidth: 2, stroke: "#1A1A1A" }}
 >
 {categoryData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 background: "#FFFBEB",
 border: "2px solid #1A1A1A",
 borderRadius: "8px",
 boxShadow: "3px 3px 0px #1A1A1A",
 fontWeight: 900,
 color: "#1A1A1A"
 }}
 itemStyle={{ color: "#1A1A1A" }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 );
}
