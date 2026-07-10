export const revenueData = [
  { name: "يناير", إيرادات: 45000, مصروفات: 28000 },
  { name: "فبراير", إيرادات: 52000, مصروفات: 31000 },
  { name: "مارس", إيرادات: 48000, مصروفات: 29000 },
  { name: "أبريل", إيرادات: 61000, مصروفات: 35000 },
  { name: "مايو", إيرادات: 55000, مصروفات: 32000 },
  { name: "يونيو", إيرادات: 67000, مصروفات: 38000 },
  { name: "يوليو", إيرادات: 72000, مصروفات: 40000 },
];

export const ordersPerHour = [
  { hour: "8ص", طلبات: 12 },
  { hour: "9ص", طلبات: 25 },
  { hour: "10ص", طلبات: 38 },
  { hour: "11ص", طلبات: 45 },
  { hour: "12م", طلبات: 68 },
  { hour: "1م", طلبات: 72 },
  { hour: "2م", طلبات: 55 },
  { hour: "3م", طلبات: 40 },
  { hour: "4م", طلبات: 35 },
  { hour: "5م", طلبات: 48 },
  { hour: "6م", طلبات: 62 },
  { hour: "7م", طلبات: 78 },
  { hour: "8م", طلبات: 85 },
  { hour: "9م", طلبات: 70 },
  { hour: "10م", طلبات: 45 },
];

export const categoryData = [
  { name: "مشروبات ساخنة", value: 35, color: "#FF6B35" },
  { name: "مشروبات باردة", value: 25, color: "#448AFF" },
  { name: "وجبات رئيسية", value: 20, color: "#00E676" },
  { name: "حلويات", value: 12, color: "#FF69B4" },
  { name: "مقبلات", value: 8, color: "#FFD700" },
];

export const topItems = [
  { id: 1, name: "كابتشينو كلاسيك", orders: 342, revenue: 10260, trend: "+12%", emoji: "☕" },
  { id: 2, name: "برجر واغيو", orders: 287, revenue: 17220, trend: "+8%", emoji: "🍔" },
  { id: 3, name: "سلطة سيزر", orders: 234, revenue: 7020, trend: "+15%", emoji: "🥗" },
  { id: 4, name: "تشيز كيك", orders: 198, revenue: 6930, trend: "+5%", emoji: "🍰" },
  { id: 5, name: "موكا آيس", orders: 176, revenue: 5280, trend: "+22%", emoji: "🧋" },
  { id: 6, name: "بيتزا مارغريتا", orders: 165, revenue: 8250, trend: "-3%", emoji: "🍕" },
];

export const recentOrders = [
  { id: "#4521", customer: "أحمد محمد", items: "2x كابتشينو، 1x كرواسون", total: 75, status: "مكتمل", time: "منذ 5 دقائق", type: "صالة" },
  { id: "#4520", customer: "سارة أحمد", items: "1x برجر واغيو، 1x عصير", total: 120, status: "جاري التحضير", time: "منذ 12 دقيقة", type: "توصيل" },
  { id: "#4519", customer: "خالد عبدالله", items: "3x لاتيه، 2x تشيز كيك", total: 165, status: "مكتمل", time: "منذ 18 دقيقة", type: "صالة" },
  { id: "#4518", customer: "نورة سعد", items: "1x سلطة سيزر، 1x موكا", total: 85, status: "قيد الانتظار", time: "منذ 25 دقيقة", type: "سفري" },
  { id: "#4517", customer: "فهد العلي", items: "2x بيتزا، 2x كولا", total: 140, status: "مكتمل", time: "منذ 30 دقيقة", type: "توصيل" },
  { id: "#4516", customer: "ريم الخالد", items: "1x شاي أخضر، 1x كعك", total: 45, status: "مكتمل", time: "منذ 45 دقيقة", type: "صالة" },
];

export const branches = [
  { id: 1, name: "الفرع الرئيسي - الرياض", orders: 156, revenue: 23400, rating: 4.8, status: "مفتوح" },
  { id: 2, name: "فرع جدة - الكورنيش", orders: 132, revenue: 19800, rating: 4.6, status: "مفتوح" },
  { id: 3, name: "فرع الدمام - العليا", orders: 98, revenue: 14700, rating: 4.7, status: "مفتوح" },
  { id: 4, name: "فرع مكة - العزيزية", orders: 87, revenue: 13050, rating: 4.5, status: "مغلق" },
];

export const staffMembers = [
  { id: 1, name: "محمد العتيبي", role: "شيف رئيسي", ordersHandled: 45, rating: 4.9, status: "متاح", avatar: "👨‍🍳" },
  { id: 2, name: "فاطمة الزهراء", role: "باريستا", ordersHandled: 67, rating: 4.8, status: "متاح", avatar: "👩‍🍳" },
  { id: 3, name: "عبدالرحمن سالم", role: "نادل", ordersHandled: 38, rating: 4.7, status: "مشغول", avatar: "🧑‍💼" },
  { id: 4, name: "ليلى أحمد", role: "كاشير", ordersHandled: 52, rating: 4.6, status: "متاح", avatar: "👩‍💻" },
];

export const notifications = [
  { id: 1, text: "طلب جديد #4522 من تطبيق التوصيل", time: "الآن", type: "order", unread: true },
  { id: 2, text: "المخزون: القهوة البرازيلية أوشكت على النفاد", time: "منذ 10 دقائق", type: "warning", unread: true },
  { id: 3, text: "تقييم جديد ⭐⭐⭐⭐⭐ من العميل أحمد", time: "منذ 30 دقيقة", type: "review", unread: true },
  { id: 4, text: "تم تحديث قائمة الطعام بنجاح", time: "منذ ساعة", type: "success", unread: false },
  { id: 5, text: "تقرير المبيعات الأسبوعي جاهز للتحميل", time: "منذ ساعتين", type: "info", unread: false },
];

export const weeklyRatings = [
  { day: "سبت", rating: 4.5 },
  { day: "أحد", rating: 4.7 },
  { day: "إثنين", rating: 4.3 },
  { day: "ثلاثاء", rating: 4.8 },
  { day: "أربعاء", rating: 4.6 },
  { day: "خميس", rating: 4.9 },
  { day: "جمعة", rating: 4.4 },
];

export const customersData = [
  { id: 1, name: "أحمد محمد", number: "0501234567", orders: 15, totalSpent: 1250, lastVisit: "2023-10-25", addresses: ["الرياض، حي العليا، شارع التحلية، مبنى ٤", "الرياض، حي السليمانية، شارع الضباب"] },
  { id: 2, name: "سارة أحمد", number: "0559876543", orders: 8, totalSpent: 840, lastVisit: "2023-10-24", addresses: ["جدة، حي الشاطئ، طريق الكورنيش"] },
  { id: 3, name: "خالد عبدالله", number: "0533334444", orders: 22, totalSpent: 3400, lastVisit: "2023-10-20", addresses: ["الدمام، حي الشاطئ، شارع الخليج العربي"] },
  { id: 4, name: "نورة سعد", number: "0509998888", orders: 5, totalSpent: 450, lastVisit: "2023-10-18", addresses: ["الرياض، حي الملقا، طريق الملك فهد، فيلا ١٢"] },
  { id: 5, name: "فهد العلي", number: "0566667777", orders: 12, totalSpent: 1500, lastVisit: "2023-10-26", addresses: ["مكة، حي العزيزية، شارع عبدالله خياط"] },
  { id: 6, name: "ريم الخالد", number: "0544445555", orders: 3, totalSpent: 210, lastVisit: "2023-10-15", addresses: ["الرياض، حي النرجس، شارع أنس بن مالك"] },
  { id: 7, name: "عبدالرحمن فهد", number: "0501112222", orders: 45, totalSpent: 6200, lastVisit: "2023-10-27", addresses: ["الرياض، حي قرطبة، طريق أبي بكر الصديق"] },
  { id: 8, name: "مها العتيبي", number: "0555556666", orders: 1, totalSpent: 75, lastVisit: "2023-10-27", addresses: ["الرياض، حي الصحافة، شارع الإمام سعود"] }
];
