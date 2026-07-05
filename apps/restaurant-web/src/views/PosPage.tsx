import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useState, useMemo, useEffect } from "react";
import { 

  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  ShoppingCart,
  Clock
} from "lucide-react";
import { menuApi, ordersApi, getImageUrl } from "../utils/api";
import { MenuItem, MenuCategory } from "../types/api";
import { hasPermission, getUserBranchId, isManagerOrOwner } from "../utils/permissions";



interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export default function PosPage() {
  const formatCurrency = useFormatCurrency();
  const [activeCategory, setActiveCategory] = useState<number | "الكل">("الكل");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const canCreate = hasPermission('Orders.Create');
    setHasAccess(canCreate);
    if (!canCreate) return;

    const userBranchId = getUserBranchId();
    const isMgr = isManagerOrOwner();
    const branchParam = !isMgr && userBranchId ? userBranchId : undefined;

    const fetchData = async () => {
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          menuApi.getItems(branchParam),
          menuApi.getCategories()
        ]);
        setItems(itemsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Failed to fetch POS data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="neo-card bg-red-50 border-4 border-red-400 p-10 flex flex-col items-center gap-4 text-center shadow-[6px_6px_0px_#1A1A1A]">
          <span className="text-5xl">🚫</span>
          <h2 className="text-2xl font-black text-red-600">ليس لديك صلاحية</h2>
          <p className="font-bold text-gray-600 max-w-sm">
            تحتاج إلى صلاحية <strong>إنشاء طلب جديد</strong> للوصول إلى نقطة البيع.
          </p>
        </div>
      </div>
    );
  }

  const displayItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === "الكل" || item.categoryId === activeCategory;
      const matchesSearch = item.name.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, items]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, emoji: "🍕" }]; // Placeholder emoji
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      await ordersApi.create({
        items: cart.map(i => ({ menuItemId: i.id, quantity: i.quantity }))
      });
      setCart([]);
      alert("تم إرسال الطلب بنجاح! 🎉");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "فشل إرسال الطلب.";
      alert(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cartTotal * 0.15;
  const cartGrandTotal = cartTotal + cartTax;

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل القائمة... 🍕</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-0">
      {/* Items Section */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
        {/* Search and Filters */}
        <div className="neo-card p-4 flex flex-col xl:flex-row gap-4 items-center shrink-0">
          <div className="relative flex-1 w-full">
            <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-border" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="ابحث عن صنف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-input w-full !pr-12 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto custom-scrollbar">
            <button
              onClick={() => setActiveCategory("الكل")}
              className={`neo-btn px-4 py-2 whitespace-nowrap text-sm font-black border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] transition-all ${activeCategory === "الكل" ? 'bg-brand-yellow' : 'bg-white'}`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`neo-btn px-4 py-2 whitespace-nowrap text-sm font-black border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] transition-all ${activeCategory === cat.id ? 'bg-brand-yellow' : 'bg-white'}`}
              >
                {cat.name} {cat.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 pb-4">
            {displayItems.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex items-center justify-between p-2 border-2 border-neo-border bg-white shadow-[2px_2px_0px_#1A1A1A] hover:bg-brand-yellow hover:-translate-y-px transition-all active:translate-y-[2px] active:shadow-none"
              >
                <div className="flex flex-col text-right w-[calc(100%-40px)]">
                  <span className="font-black text-[11px] leading-tight line-clamp-2 text-neo-text">{item.name}</span>
                  <span className="font-black text-xs text-brand-blue mt-0.5">{formatCurrency(item.price)}</span>
                </div>
                <div className="w-8 h-8 bg-[#FFFBEB] border-2 border-neo-border flex shrink-0 items-center justify-center overflow-hidden shadow-[1px_1px_0px_#1A1A1A]">
                 {item.imageUrl ? (
                   <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                 ) : (                    
                   <span className="text-lg leading-none">{categories.find(c => c.id === item.categoryId)?.icon || '🍕'}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-[400px] flex flex-col h-full min-h-0 shrink-0">
        <div className="neo-card flex-1 flex flex-col overflow-hidden min-h-0 bg-white">
          {/* Cart Header */}
          <div className="p-4 border-b-2 border-neo-border bg-[#FFFBEB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-neo-text">
              <ShoppingCart size={20} strokeWidth={3} />
              <h3 className="font-black text-lg">سلة الطلبات</h3>
            </div>
            <span className="neo-badge bg-brand-yellow border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A]">{cart.length}</span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white custom-scrollbar min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neo-border gap-2 opacity-60">
                <ShoppingCart size={32} />
                <p className="font-black">السلة فارغة</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-[#FFFBEB] p-2 rounded-lg border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A]">
                  <div className="flex-1">
                    <h4 className="font-black text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-xs font-black text-brand-blue">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 neo-btn bg-brand-red text-white p-0 flex items-center justify-center border-2 border-neo-border"
                    >
                      {item.quantity === 1 ? <Trash2 size={12} strokeWidth={3} /> : <Minus size={14} strokeWidth={3} />}
                    </button>
                    <span className="font-black w-4 text-center text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-6 h-6 neo-btn bg-brand-green p-0 flex items-center justify-center border-2 border-neo-border"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Actions */}
          <div className="p-4 border-t-2 border-neo-border bg-gray-50 shrink-0">
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-600">الضريبة (١٥٪)</span>
                <span>{formatCurrency(cartTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-neo-border text-brand-orange mt-2">
                <span>الإجمالي</span>
                <span>{formatCurrency(cartGrandTotal)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                disabled={cart.length === 0} 
                className="neo-btn bg-brand-red text-white w-14 flex items-center justify-center border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_#1A1A1A] transition-all" 
                onClick={() => setCart([])}
                title="مسح السلة"
              >
                <Trash2 size={20} strokeWidth={3} />
              </button>
              <button 
                disabled={checkoutLoading || cart.length === 0}
                className="neo-btn flex-1 bg-brand-green text-white py-3 text-lg font-black border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_#1A1A1A] active:translate-y-0 active:shadow-[1px_1px_0px_#1A1A1A] transition-all disabled:opacity-50"
                onClick={handleCheckout}
              >
                {checkoutLoading ? "جاري المعالجة..." : <><CreditCard size={20} strokeWidth={3} /> دفع واستلام</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
