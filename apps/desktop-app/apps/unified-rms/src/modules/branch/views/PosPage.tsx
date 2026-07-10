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

  const displayItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === "الكل" || item.categoryId === activeCategory;
      const matchesSearch = item.name.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, items]);

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
      const userBranchId = getUserBranchId();
      await ordersApi.create({
        items: cart.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        orderType: "محلي", // default for POS
        branchId: userBranchId || undefined
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
    <div className="flex flex-col lg:flex-row gap-1 h-[calc(100vh-140px)] min-h-0">
      {/* Items Section */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden min-h-0">
        {/* Search and Filters */}
        <div className="bg-white p-1 flex flex-col xl:flex-row gap-1 items-center shrink-0 border border-neo-border">
          <div className="relative flex-1 w-full">
            <Search size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-neo-border" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 !pr-5 pl-1 py-0.5 border border-neo-border font-bold text-[10px] outline-none focus:bg-white transition-colors"
            />
          </div>
          <div className="flex gap-0.5 overflow-x-auto pb-0.5 xl:pb-0 w-full xl:w-auto custom-scrollbar">
            <button
              onClick={() => setActiveCategory("الكل")}
              className={`px-1.5 py-0.5 whitespace-nowrap text-[9px] font-black border border-neo-border transition-colors ${activeCategory === "الكل" ? 'bg-brand-yellow text-neo-text' : 'bg-gray-50 hover:bg-white text-gray-600'}`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-1.5 py-0.5 whitespace-nowrap text-[9px] font-black border border-neo-border transition-colors flex items-center gap-1 ${activeCategory === cat.id ? 'bg-brand-yellow text-neo-text' : 'bg-gray-50 hover:bg-white text-gray-600'}`}
              >
                {cat.name} <span className="text-[10px] leading-none">{cat.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-0.5 pb-1">
            {displayItems.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex items-center justify-between p-0.5 border border-neo-border bg-white hover:bg-brand-yellow transition-colors"
              >
                <div className="flex flex-col text-right w-[calc(100%-20px)]">
                  <span className="font-black text-[8px] leading-tight line-clamp-1 text-neo-text">{item.name}</span>
                  <span className="font-black text-[9px] text-brand-blue">{formatCurrency(item.price)}</span>
                </div>
                <div className="w-5 h-5 bg-[#FFFBEB] border border-neo-border flex shrink-0 items-center justify-center overflow-hidden">
                 {item.imageUrl ? (
                   <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                 ) : (                    
                   <span className="text-[10px] leading-none">{categories.find(c => c.id === item.categoryId)?.icon || '🍕'}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-[240px] flex flex-col h-[50%] lg:h-full min-h-0 shrink-0 border-t-2 lg:border-t-0 border-neo-border pt-1 lg:pt-0">
        <div className="bg-white flex-1 flex flex-col overflow-hidden min-h-0 border border-neo-border p-0">
          {/* Cart Header */}
          <div className="p-1 border-b border-neo-border bg-[#FFFBEB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 text-neo-text">
              <ShoppingCart size={12} strokeWidth={3} />
              <h3 className="font-black text-[10px]">سلة الطلبات</h3>
            </div>
            <span className="bg-brand-yellow border border-neo-border font-black text-[8px] px-1 py-0">{cart.length}</span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5 bg-white custom-scrollbar min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neo-border gap-1 opacity-60">
                <ShoppingCart size={16} />
                <p className="font-black text-[9px]">السلة فارغة</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-1 bg-[#FFFBEB] p-0.5 rounded-sm border border-neo-border">
                  <div className="flex-1">
                    <h4 className="font-black text-[9px] line-clamp-1">{item.name}</h4>
                    <p className="text-[8px] font-black text-brand-blue">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-4 h-4 bg-brand-red text-white p-0 flex items-center justify-center border border-neo-border"
                    >
                      {item.quantity === 1 ? <Trash2 size={8} strokeWidth={3} /> : <Minus size={8} strokeWidth={3} />}
                    </button>
                    <span className="font-black w-3 text-center text-[9px]">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-4 h-4 bg-brand-green text-white p-0 flex items-center justify-center border border-neo-border"
                    >
                      <Plus size={8} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Actions */}
          <div className="p-1 border-t border-neo-border bg-gray-50 shrink-0">
            <div className="space-y-0.5 mb-1">
              <div className="flex justify-between text-[9px] font-bold">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold">
                <span className="text-gray-600">الضريبة (١٥٪)</span>
                <span>{formatCurrency(cartTax)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-black pt-0.5 border-t border-neo-border text-brand-orange mt-0.5">
                <span>الإجمالي</span>
                <span>{formatCurrency(cartGrandTotal)}</span>
              </div>
            </div>
            
            <div className="flex gap-0.5">
              <button 
                disabled={cart.length === 0} 
                className="bg-brand-red text-white w-6 flex items-center justify-center border border-neo-border disabled:opacity-50 transition-colors hover:bg-red-600" 
                onClick={() => setCart([])}
                title="مسح السلة"
              >
                <Trash2 size={10} strokeWidth={3} />
              </button>
              <button 
                disabled={checkoutLoading || cart.length === 0}
                className="flex-1 bg-brand-green text-white py-1 text-[10px] font-black border border-neo-border flex items-center justify-center gap-1 transition-colors disabled:opacity-50 hover:bg-green-600"
                onClick={handleCheckout}
              >
                {checkoutLoading ? "جاري..." : <><CreditCard size={10} strokeWidth={3} /> استلام</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
