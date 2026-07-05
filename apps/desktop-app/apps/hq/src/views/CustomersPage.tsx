import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useState, useEffect } from "react";
import { Users, Search, Plus, Phone, MapPin, Trash2, History, ExternalLink, ShoppingBag } from "lucide-react";
import { customersApi } from "../utils/api";
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

  if (!mounted || loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل العملاء... 👥</div>;

  return (
    <div className="space-y-4">
      <div className={`bg-brand-cyan neo-card p-3 flex flex-row items-center justify-between shadow-[2px_2px_0px_#1A1A1A]`}>
        <div className="flex items-center gap-3">
          <Users size={20} />
          <h2 className="text-lg font-black">قاعدة بيانات العملاء</h2>
        </div>
        <div className="flex gap-2 w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الهاتف..."
              className="neo-input w-full pr-8 text-xs py-1 h-8 border-2 border-neo-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="neo-btn bg-white px-3 py-1 flex items-center justify-center gap-1 shadow-sm h-8">
            <Plus size={14} />
            <span className="text-xs">جديد</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="neo-card p-4 bg-[#FFFBEB] flex flex-col gap-3 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-black text-gray-700 mb-1">اسم العميل</label>
              <input required type="text" className="neo-input w-full text-xs py-1 h-8" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-700 mb-1">رقم الهاتف</label>
              <input required type="text" className="neo-input w-full text-xs py-1 h-8" value={newCustomer.phoneNumber} onChange={e => setNewCustomer({...newCustomer, phoneNumber: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-700 mb-1 flex items-center justify-between">
                <span>العنوان أو الإحداثيات</span>
                {newCustomer.address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) && (
                  <span className="text-[9px] font-bold text-brand-green bg-green-50 px-1 rounded border border-green-200 flex items-center gap-1">
                    <MapPin size={10} /> إحداثيات ✓
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input required type="text" className="neo-input flex-1 text-xs py-1 h-8" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                <button type="submit" className="neo-btn bg-brand-green py-1 px-4 h-8 text-xs shadow-sm">حفظ</button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="neo-card p-0 overflow-hidden bg-white border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-brand-cyan/10 border-b-2 border-neo-border text-[10px]">
              <th className="px-2 py-1.5 font-black border-l border-neo-border">العميل</th>
              <th className="px-2 py-1.5 font-black border-l border-neo-border w-28">الهاتف</th>
              <th className="px-2 py-1.5 font-black border-l border-neo-border">العنوان</th>
              <th className="px-2 py-1.5 font-black border-l border-neo-border w-32">النشاط</th>
              <th className="px-2 py-1.5 font-black text-center w-16">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border text-xs">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center font-black text-[10px] text-gray-500 bg-gray-50">لا توجد نتائج</td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-brand-cyan/5 transition-colors">
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle font-black">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-brand-pink/20 rounded border border-neo-border flex items-center justify-center text-[10px]">
                        {customer.name?.[0] || '👤'}
                      </div>
                      <span className="text-[11px]">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle">
                    <div className="flex items-center gap-1 font-bold text-[10px] dir-ltr text-right">
                      <Phone size={10} className="text-gray-400" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 font-bold text-[10px] truncate max-w-[200px]">
                        <MapPin size={10} className="text-gray-400 shrink-0" />
                        <span className="truncate">{customer.customerAddresses?.[0]?.addressDetails || 'لا يوجد عنوان'}</span>
                      </div>
                      {(customer.customerAddresses?.[0]?.latitude && customer.customerAddresses?.[0]?.longitude) && (
                        <span className="text-[9px] text-brand-green font-black flex items-center gap-0.5 mt-0.5">
                          <MapPin size={8} /> إحداثيات
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 font-bold text-[9px]">
                        <ShoppingBag size={10} className="text-brand-orange" />
                        <span>{customer.totalOrders} طلبات</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-[9px]">
                        <span className="text-brand-green text-[10px]">💰</span>
                        <span>{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-1.5 align-middle text-center">
                    <button onClick={() => handleDelete(customer.id)} className="p-1 bg-brand-red/10 text-brand-red border border-brand-red/30 shadow-sm hover:translate-y-px transition-all">
                      <Trash2 size={12} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
