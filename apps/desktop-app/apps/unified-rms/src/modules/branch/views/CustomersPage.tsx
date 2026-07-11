import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useState, useEffect } from "react";
import { Users, Search, Plus, Phone, MapPin, Trash2, History, ExternalLink, ShoppingBag, ArrowRight, Eye, Package } from "lucide-react";
import { customersApi, ordersApi } from "../utils/api";
import { Customer } from "../types/api";


import { useDashboard } from "../context/DashboardContext";


// Robust phone normalization
const normalizePhone = (phone: string) => {
 if (!phone) return "";
 let clean = phone.replace(/\D/g, "");
 if (clean.startsWith("00966")) clean = clean.substring(5);
 if (clean.startsWith("966")) clean = clean.substring(3);
 if (clean.startsWith("0")) clean = clean.substring(1);
 return clean;
};

export default function CustomersPage() {
 const formatCurrency = useFormatCurrency();
 const { customers, refreshCustomers, loading } = useDashboard();
 const [searchQuery, setSearchQuery] = useState("");
 const [showAddForm, setShowAddForm] = useState(false);
 const [newCustomer, setNewCustomer] = useState({ name: "", phoneNumber: "", address: "" });
 const [mounted, setMounted] = useState(false);
 const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
 const [customerOrders, setCustomerOrders] = useState<any[]>([]);
 const [loadingOrders, setLoadingOrders] = useState(false);
 const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
 const [orderDetails, setOrderDetails] = useState<any | null>(null);
 const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

 const handleCustomerClick = async (customer: Customer) => {
 setSelectedCustomer(customer);
 setLoadingOrders(true);
 try {
 const res = await ordersApi.getCustomerOrders(customer.id);
 setCustomerOrders(res.data || []);
 } catch (err) {
 console.error(err);
 alert("فشل في تحميل طلبات العميل");
 } finally {
 setLoadingOrders(false);
 }
 };

 const handleOrderClick = async (order: any) => {
 setSelectedOrder(order);
 setLoadingOrderDetails(true);
 try {
 const res = await ordersApi.getById(order.id);
 setOrderDetails(res.data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoadingOrderDetails(false);
 }
 };

 const closeDetails = () => {
 setSelectedCustomer(null);
 setCustomerOrders([]);
 };

 const closeOrderModal = () => {
 setSelectedOrder(null);
 setOrderDetails(null);
 };

 useEffect(() => {
 setMounted(true);
 refreshCustomers();
 }, []);

 const handleAdd = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await customersApi.create({
 name: newCustomer.name,
 phoneNumber: newCustomer.phoneNumber,
 customerAddresses: [{ addressDetails: newCustomer.address }] as any
 });
 setShowAddForm(false);
 setNewCustomer({ name: "", phoneNumber: "", address: "" });
 refreshCustomers();
 } catch (err) {
 alert("فشل الإضافة");
 }
 };

 const handleDelete = async (id: string) => {
 if (confirm("هل أنت متأكد من حذف العميل؟")) {
 try {
 await customersApi.delete(id);
 refreshCustomers();
 } catch (err) {
 alert("فشل الحذف");
 }
 }
 };

 const filteredCustomers = (customers || []).filter((c) => {
 const query = searchQuery.toLowerCase();
 const nameMatch = c.name.toLowerCase().includes(query);
 const phoneMatch = normalizePhone(c.phoneNumber).includes(normalizePhone(searchQuery));
 return nameMatch || phoneMatch;
 });

 if (!mounted || loading) return <div className="p-20 text-center font-semibold text-2xl animate-pulse">جاري تحميل العملاء... 👥</div>;

 return (
 <div className="space-y-4">

 {selectedCustomer && (
 <div className="bg-carbon-layer border-carbon-border p-4 mb-4 animate-in fade-in zoom-in-95 duration-200">
 <button onClick={closeDetails} className="mb-4 flex items-center gap-1 text-xs text-carbon-textSecondary hover:text-carbon-text transition-colors">
 <ArrowRight size={14} /> عودة للقائمة
 </button>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-carbon-bg border-carbon-border p-3">
 <h3 className="text-sm font-semibold mb-2 text-carbon-text flex items-center gap-2">
 <Users size={14} /> تفاصيل العميل
 </h3>
 <div className="text-xs space-y-2 text-carbon-textSecondary">
 <p><strong className="text-carbon-text">الاسم:</strong> {selectedCustomer.name}</p>
 <p><strong className="text-carbon-text">الهاتف:</strong> {selectedCustomer.phoneNumber}</p>
 <p><strong className="text-carbon-text">إجمالي الطلبات:</strong> {selectedCustomer.totalOrders}</p>
 <p><strong className="text-carbon-text">إجمالي المدفوعات:</strong> {formatCurrency(selectedCustomer.totalSpent)}</p>
 </div>
 </div>

 <div className="bg-carbon-bg border-carbon-border p-3">
 <h3 className="text-sm font-semibold mb-2 text-carbon-text flex items-center gap-2">
 <MapPin size={14} /> عناوين العميل
 </h3>
 {selectedCustomer.customerAddresses && selectedCustomer.customerAddresses.length > 0 ? (
 <ul className="text-xs space-y-2 text-carbon-textSecondary">
 {selectedCustomer.customerAddresses.map((addr, idx) => (
 <li key={idx} className="flex gap-2 items-start bg-carbon-layer p-2 border-carbon-border">
 <MapPin size={12} className="mt-0.5 shrink-0 text-carbon-warning" />
 <div>
 <p>{addr.addressDetails}</p>
 {addr.deliveryZoneName && <p className="text-[10px] text-carbon-success mt-1">المنطقة: {addr.deliveryZoneName}</p>}
 </div>
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-xs text-carbon-textSecondary italic">لا توجد عناوين مسجلة</p>
 )}
 </div>
 </div>

 <div className="mt-4 bg-carbon-bg border-carbon-border p-3">
 <h3 className="text-sm font-semibold mb-3 text-carbon-text flex items-center gap-2">
 <History size={14} /> سجل الطلبات
 </h3>
 {loadingOrders ? (
 <p className="text-xs text-center p-4 text-carbon-textSecondary animate-pulse">جاري تحميل الطلبات...</p>
 ) : customerOrders.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-right text-xs">
 <thead>
 <tr className="border-b border-carbon-border text-carbon-textSecondary">
 <th className="pb-2 px-2 font-medium">رقم الطلب</th>
 <th className="pb-2 px-2 font-medium">التاريخ</th>
 <th className="pb-2 px-2 font-medium">النوع</th>
 <th className="pb-2 px-2 font-medium">الحالة</th>
 <th className="pb-2 px-2 font-medium">الإجمالي</th>
 <th className="pb-2 px-2 font-medium text-center">التفاصيل</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-carbon-border">
 {customerOrders.map(order => (
 <tr key={order.id} className="hover:bg-carbon-layerHover transition-colors">
 <td className="py-2 px-2 font-medium dir-ltr text-right">{order.orderNumber}</td>
 <td className="py-2 px-2 text-carbon-textSecondary">{new Date(order.createdAt).toLocaleString('ar-EG')}</td>
 <td className="py-2 px-2">{order.orderType}</td>
 <td className="py-2 px-2">
 <span className={`px-2 py-0.5 rounded text-[10px] ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-carbon-success/10 text-carbon-success border-carbon-success/20' : 'bg-carbon-warning/10 text-carbon-warning border-carbon-warning/20'}`}>
 {order.status}
 </span>
 </td>
 <td className="py-2 px-2 font-medium text-carbon-success">{formatCurrency(order.totalAmount)}</td>
 <td className="py-2 px-2 text-center">
 <button onClick={() => handleOrderClick(order)} className="p-1 bg-carbon-layer text-carbon-blue border-carbon-border hover:bg-carbon-blue hover:text-white transition-colors">
 <Eye size={12} />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <p className="text-xs text-center p-4 text-carbon-textSecondary">لا توجد طلبات سابقة</p>
 )}
 </div>
 </div>
 )}

 {selectedOrder && (
 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeOrderModal}>
 <div className="bg-carbon-layer border-carbon-border w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
 <div className="p-4 border-b border-carbon-border flex items-center justify-between sticky top-0 bg-carbon-layer z-10">
 <h3 className="font-semibold text-sm flex items-center gap-2 text-carbon-text">
 <Package size={16} />
 تفاصيل الطلب {selectedOrder.orderNumber}
 </h3>
 <button onClick={closeOrderModal} className="text-carbon-textSecondary hover:text-carbon-text">✕</button>
 </div>
 <div className="p-4 space-y-4">
 {loadingOrderDetails ? (
 <div className="py-10 text-center text-xs text-carbon-textSecondary animate-pulse">جاري تحميل التفاصيل...</div>
 ) : orderDetails ? (
 <>
 <div className="bg-carbon-bg border-carbon-border p-3 text-xs space-y-2">
 <p><span className="text-carbon-textSecondary">النوع:</span> {orderDetails.orderType}</p>
 <p><span className="text-carbon-textSecondary">التاريخ:</span> {new Date(orderDetails.createdAt).toLocaleString('ar-EG')}</p>
 {orderDetails.driverName && <p><span className="text-carbon-textSecondary">السائق:</span> {orderDetails.driverName}</p>}
 {orderDetails.kitchenNotes && <p><span className="text-carbon-textSecondary">ملاحظات:</span> <span className="text-carbon-warning">{orderDetails.kitchenNotes}</span></p>}
 </div>
 
 <div>
 <h4 className="text-xs font-semibold mb-2 text-carbon-text">المنتجات</h4>
 <ul className="space-y-2">
 {orderDetails.items?.map((item: any) => (
 <li key={item.id} className="flex items-center justify-between bg-carbon-bg border-carbon-border p-2 text-xs">
 <div className="flex items-center gap-2">
 <span className="bg-carbon-layer px-1.5 py-0.5 border-carbon-border font-medium">{item.quantity}x</span>
 <span>{item.menuItemName}</span>
 </div>
 <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
 </li>
 ))}
 </ul>
 </div>
 
 <div className="border-t border-carbon-border pt-3 mt-3 text-xs space-y-1">
 <div className="flex justify-between text-carbon-textSecondary">
 <span>تكلفة التوصيل</span>
 <span>{formatCurrency(orderDetails.deliveryCost || 0)}</span>
 </div>
 <div className="flex justify-between font-bold text-sm text-carbon-success pt-1">
 <span>الإجمالي</span>
 <span>{formatCurrency(orderDetails.totalAmount)}</span>
 </div>
 </div>
 </>
 ) : (
 <div className="py-10 text-center text-xs text-carbon-error">فشل في تحميل التفاصيل</div>
 )}
 </div>
 <div className="p-3 border-t border-carbon-border bg-carbon-bg text-center">
 <button onClick={closeOrderModal} className="bg-carbon-layer border-carbon-border text-carbon-text px-6 py-1.5 text-xs font-medium hover:bg-carbon-layerHover transition-colors">إغلاق</button>
 </div>
 </div>
 </div>
 )}

 <div className={`bg-carbon-layer border-carbon-border p-3 flex flex-row items-center justify-between`}>
 <div className="flex items-center gap-3">
 <Users size={20} />
 <h2 className="text-lg font-semibold">قاعدة بيانات العملاء</h2>
 </div>
 <div className="flex gap-2 w-1/2">
 <div className="relative flex-1">
 <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
 <input
 type="text"
 placeholder="ابحث بالاسم أو الهاتف..."
 className="w-full border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary w-full pr-8 text-xs py-1 h-8 border-carbon-border"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <button onClick={() => setShowAddForm(!showAddForm)} className="px-3 py-1 flex items-center justify-center gap-1 shadow-sm h-8">
 <Plus size={14} />
 <span className="text-xs">جديد</span>
 </button>
 </div>
 </div>

 {showAddForm && (
 <form onSubmit={handleAdd} className="bg-carbon-layer border-carbon-border p-4 flex flex-col gap-3">
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
 <div>
 <label className="block text-[10px] font-semibold text-carbon-textSecondary mb-1">اسم العميل</label>
 <input required type="text" className="w-full border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary w-full text-xs py-1 h-8" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
 </div>
 <div>
 <label className="block text-[10px] font-semibold text-carbon-textSecondary mb-1">رقم الهاتف</label>
 <input required type="text" className="w-full border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary w-full text-xs py-1 h-8" value={newCustomer.phoneNumber} onChange={e => setNewCustomer({...newCustomer, phoneNumber: e.target.value})} />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-[10px] font-semibold text-carbon-textSecondary mb-1 flex items-center justify-between">
 <span>العنوان أو الإحداثيات</span>
 {newCustomer.address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) && (
 <span className="text-[9px] font-medium text-carbon-success bg-carbon-success/10 px-1 rounded border-green-200 flex items-center gap-1">
 <MapPin size={10} /> إحداثيات ✓
 </span>
 )}
 </label>
 <div className="flex gap-2">
 <input required type="text" className="w-full border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary flex-1 text-xs py-1 h-8" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
 <button type="submit" className="py-1 px-4 h-8 text-xs shadow-sm">حفظ</button>
 </div>
 </div>
 </div>
 </form>
 )}

 {!selectedCustomer && (<div className="bg-carbon-layer border-carbon-border p-0 overflow-hidden">
 <table className="w-full text-right border-collapse">
 <thead>
 <tr className="bg-carbon-bg text-carbon-textSecondary border-b border-carbon-border text-[10px]">
 <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">العميل</th>
 <th className="px-2 py-1.5 font-semibold border-l border-carbon-border w-28">الهاتف</th>
 <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">العنوان</th>
 <th className="px-2 py-1.5 font-semibold border-l border-carbon-border w-32">النشاط</th>
 <th className="px-2 py-1.5 font-semibold text-center w-16">إجراء</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-carbon-border text-xs">
 {filteredCustomers.length === 0 ? (
 <tr>
 <td colSpan={5} className="p-4 text-center font-semibold text-[10px] text-carbon-textSecondary bg-carbon-bg">لا توجد نتائج</td>
 </tr>
 ) : (
 filteredCustomers.map((customer) => (
 <tr key={customer.id} onClick={() => handleCustomerClick(customer)} className="hover:bg-carbon-layerHover text-carbon-text transition-colors cursor-pointer">
 <td className="px-2 py-1.5 border-l border-carbon-border align-middle font-semibold">
 <div className="flex items-center gap-1.5">
 <div className="w-5 h-5 bg-carbon-layer text-carbon-text rounded border-carbon-border flex items-center justify-center text-[10px]">
 {customer.name?.[0] || '👤'}
 </div>
 <span className="text-[11px]">{customer.name}</span>
 </div>
 </td>
 <td className="px-2 py-1.5 border-l border-carbon-border align-middle">
 <div className="flex items-center gap-1 font-medium text-[10px] dir-ltr text-right">
 <Phone size={10} className="text-gray-400" />
 <span>{customer.phoneNumber}</span>
 </div>
 </td>
 <td className="px-2 py-1.5 border-l border-carbon-border align-middle">
 <div className="flex flex-col">
 <div className="flex items-center gap-1 font-medium text-[10px] truncate max-w-[200px]">
 <MapPin size={10} className="text-gray-400 shrink-0" />
 <span className="truncate">{customer.customerAddresses?.[0]?.addressDetails || 'لا يوجد عنوان'}</span>
 </div>
 {(customer.customerAddresses?.[0]?.latitude && customer.customerAddresses?.[0]?.longitude) && (
 <span className="text-[9px] text-carbon-success font-semibold flex items-center gap-0.5 mt-0.5">
 <MapPin size={8} /> إحداثيات
 </span>
 )}
 </div>
 </td>
 <td className="px-2 py-1.5 border-l border-carbon-border align-middle">
 <div className="flex flex-col gap-0.5">
 <div className="flex items-center gap-1 font-medium text-[9px]">
 <ShoppingBag size={10} className="text-carbon-warning" />
 <span>{customer.totalOrders} طلبات</span>
 </div>
 <div className="flex items-center gap-1 font-medium text-[9px]">
 <span className="text-carbon-success text-[10px]"></span>
 <span>{formatCurrency(customer.totalSpent)}</span>
 </div>
 </div>
 </td>
 <td className="px-1 py-1.5 align-middle text-center">
 <button onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="p-1 bg-carbon-error/10 text-carbon-error border-brand-red/30 shadow-sm hover:translate-y-px transition-all">
 <Trash2 size={12} strokeWidth={3} />
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>)}
 </div>
 );
}
