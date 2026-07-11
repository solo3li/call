import re

with open('src/modules/hq/views/ManagementPages.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'export function MenuPage\(\) \{.*?(?=// --- STAFF PAGE ---)', re.DOTALL)

new_menu = """export function MenuPage() {
  const formatCurrency = useFormatCurrency();
  const [apiItems, setApiItems] = useState<MenuItem[]>([]);
  const [apiCategories, setApiCategories] = useState<MenuCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "الكل">("الكل");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0, categoryId: 0, branchId: "", imageUrl: "", kitchenStationId: 0 });
  const [newCat, setNewCat] = useState({ name: "", icon: "", imageUrl: "" });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [catUploading, setCatUploading] = useState(false);
  const [itemUploading, setItemUploading] = useState(false);

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCatUploading(true);
    try {
      const res = await menuApi.uploadImage(file);
      if (editingCat) {
        setEditingCat(prev => prev ? { ...prev, imageUrl: res.data.url } : null);
      } else {
        setNewCat(prev => ({ ...prev, imageUrl: res.data.url }));
      }
    } catch (err) {
      alert("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setCatUploading(false);
    }
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setItemUploading(true);
    try {
      const res = await menuApi.uploadImage(file);
      if (editingItem) {
        setEditingItem(prev => prev ? { ...prev, imageUrl: res.data.url } : null);
      } else {
        setNewItem(prev => ({ ...prev, imageUrl: res.data.url }));
      }
    } catch (err) {
      alert("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setItemUploading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes, branchesRes, stationsRes] = await Promise.all([
        menuApi.getItems().catch(() => ({ data: [] })),
        menuApi.getCategories().catch(() => ({ data: [] })),
        branchesApi.getAll().catch(() => ({ data: [] })),
        kitchenStationsApi.getAll().catch(() => ({ data: [] }))
      ]);
      setApiItems(itemsRes.data || []);
      setApiCategories(categoriesRes.data || []);
      setBranches(branchesRes.data || []);
      setStations(stationsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = editingItem || newItem;
    if (data.categoryId === 0) {
      alert("يرجى اختيار الفئة");
      return;
    }
    try {
      if (editingItem) {
        await menuApi.updateItem(editingItem.id, editingItem);
        setEditingItem(null);
      } else {
        await menuApi.createItem({
          ...newItem,
          branchId: newItem.branchId || null,
          kitchenStationId: newItem.kitchenStationId || null
        });
        setShowAddForm(false);
        setNewItem({ name: "", description: "", price: 0, categoryId: 0, branchId: "", imageUrl: "", kitchenStationId: 0 });
      }
      fetchData();
    } catch (err) {
      alert("فشل العملية. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await menuApi.updateCategory(editingCat.id, editingCat);
        setEditingCat(null);
      } else {
        await menuApi.createCategory(newCat);
        setShowCatForm(false);
        setNewCat({ name: "", icon: "", imageUrl: "" });
      }
      fetchData();
    } catch (err) {
      alert("فشل العملية.");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      try {
        await menuApi.deleteItem(id);
        fetchData();
      } catch (err) {
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("حذف الفئة سيؤدي لحذف جميع أصنافها. هل أنت متأكد؟")) {
      try {
        await menuApi.deleteCategory(id);
        fetchData();
      } catch (err) {
        alert("فشل حذف الفئة.");
      }
    }
  };

  const filteredMenu = activeCategory === "الكل" ? apiItems : apiItems.filter((item) => item.categoryId === activeCategory);

  if (loading) return <div className="p-20 text-center font-semibold text-2xl animate-pulse">جاري تحميل القائمة... ☕</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="bg-carbon-layer border-b border-carbon-border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Utensils size={24} className="text-carbon-text" />
          <div>
            <h2 className="text-xl font-semibold text-carbon-text">إدارة قائمة الطعام (المنيو)</h2>
            <p className="text-sm text-carbon-textSecondary mt-1">تعديل التصنيفات والأصناف، الصور، والأسعار</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setShowCatForm(!showCatForm);
              if (showCatForm) setEditingCat(null);
            }} 
            className={`px-6 py-2.5 text-sm font-medium transition-colors border border-carbon-border flex items-center gap-2 ${
              showCatForm || editingCat ? 'bg-carbon-layerHover text-carbon-text' : 'bg-transparent text-carbon-text hover:bg-carbon-layerHover'
            }`}
          >
            {showCatForm || editingCat ? <X size={16} /> : <Plus size={16} />}
            <span>{showCatForm || editingCat ? 'إلغاء التصنيف' : 'تصنيف جديد'}</span>
          </button>
          <button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) setEditingItem(null);
            }} 
            className="bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors px-6 py-2.5 text-sm font-medium flex items-center gap-2"
          >
            {showAddForm || editingItem ? <X size={16} /> : <Plus size={16} />}
            <span>{showAddForm || editingItem ? 'إلغاء الإضافة' : 'صنف جديد'}</span>
          </button>
        </div>
      </div>

      {/* Category Editor */}
      {(showCatForm || editingCat) && (
        <form onSubmit={handleAddCategory} className="bg-carbon-layer border border-carbon-border p-6 shadow-sm animate-fade-in space-y-6">
          <h3 className="text-base font-semibold text-carbon-text border-b border-carbon-border pb-3 mb-4 flex items-center gap-2">
            <List size={18} className="text-carbon-blue" />
            {editingCat?.id ? "تعديل تصنيف" : "تصنيف جديد"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm text-carbon-textSecondary">اسم التصنيف *</label>
              <input 
                required 
                type="text" 
                value={editingCat ? editingCat.name : newCat.name} 
                onChange={e => editingCat ? setEditingCat({...editingCat, name: e.target.value}) : setNewCat({...newCat, name: e.target.value})} 
                className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-carbon-textSecondary">الأيقونة (Emoji)</label>
              <input 
                type="text" 
                value={editingCat ? editingCat.icon : newCat.icon} 
                onChange={e => editingCat ? setEditingCat({...editingCat, icon: e.target.value}) : setNewCat({...newCat, icon: e.target.value})} 
                className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-carbon-textSecondary">صورة الفئة (اختياري)</label>
              <input 
                type="text" 
                value={editingCat ? (editingCat.imageUrl || "") : newCat.imageUrl} 
                onChange={e => editingCat ? setEditingCat({...editingCat, imageUrl: e.target.value}) : setNewCat({...newCat, imageUrl: e.target.value})} 
                className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors text-left dir-ltr"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-carbon-border flex justify-end">
            <button type="submit" disabled={catUploading} className="bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors px-6 py-2 text-sm font-medium flex items-center gap-2">
              <Check size={16} /> {catUploading ? 'جاري الرفع...' : 'حفظ التصنيف'}
            </button>
          </div>
        </form>
      )}

      {/* Item Editor */}
      {(showAddForm || editingItem) && (
        <form onSubmit={handleAddItem} className="bg-carbon-layer border border-carbon-border p-6 shadow-sm animate-fade-in space-y-6">
          <h3 className="text-base font-semibold text-carbon-text border-b border-carbon-border pb-3 mb-4 flex items-center gap-2">
            <Utensils size={18} className="text-carbon-blue" />
            {editingItem?.id ? "تعديل صنف" : "إضافة صنف جديد"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 lg:col-span-2">
              <label className="block text-sm text-carbon-textSecondary">اسم الصنف *</label>
              <input 
                required 
                type="text" 
                value={editingItem ? editingItem.name : newItem.name} 
                onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} 
                className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-carbon-textSecondary">السعر *</label>
              <input 
                required 
                type="number" 
                step="0.01"
                value={editingItem ? editingItem.price : newItem.price} 
                onChange={e => editingItem ? setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0}) : setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} 
                className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="block text-sm text-carbon-textSecondary">الوصف</label>
              <textarea 
                value={editingItem ? editingItem.description : newItem.description} 
                onChange={e => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} 
                className="w-full bg-carbon-bg border border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors custom-scrollbar h-24 resize-none"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-carbon-textSecondary">التصنيف *</label>
                <select 
                  required 
                  value={editingItem ? editingItem.categoryId : newItem.categoryId} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, categoryId: parseInt(e.target.value) || 0}) : setNewItem({...newItem, categoryId: parseInt(e.target.value) || 0})} 
                  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors appearance-none"
                >
                  <option value="0">اختر الفئة</option>
                  {apiCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-carbon-textSecondary">الفرع (اختياري)</label>
                <select 
                  value={editingItem ? (editingItem.branchId || "") : newItem.branchId} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, branchId: e.target.value || null}) : setNewItem({...newItem, branchId: e.target.value})} 
                  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors appearance-none"
                >
                  <option value="">كل الفروع (عام)</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2 lg:col-span-3">
              <label className="block text-sm text-carbon-textSecondary">مسار الصورة (اختياري)</label>
              <input 
                type="text" 
                value={editingItem ? (editingItem.imageUrl || "") : newItem.imageUrl} 
                onChange={e => editingItem ? setEditingItem({...editingItem, imageUrl: e.target.value}) : setNewItem({...newItem, imageUrl: e.target.value})} 
                placeholder="/images/items/burger.jpg"
                className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors dir-ltr text-left"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-carbon-border flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
              }} 
              className="px-6 py-2 bg-transparent text-carbon-text hover:bg-carbon-layerHover border border-carbon-border transition-colors text-sm font-medium"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              disabled={itemUploading}
              className="bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors px-6 py-2 text-sm font-medium flex items-center gap-2"
            >
              <Check size={16} /> {itemUploading ? 'جاري الرفع...' : 'حفظ الصنف'}
            </button>
          </div>
        </form>
      )}

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveCategory("الكل")}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border ${
            activeCategory === "الكل" 
              ? "bg-carbon-blue/10 border-carbon-blue text-carbon-blue" 
              : "bg-carbon-layer border-carbon-border text-carbon-text hover:bg-carbon-layerHover"
          }`}
        >
          الكل
        </button>
        {apiCategories.sort((a, b) => a.sortOrder - b.sortOrder).map(cat => (
          <div key={cat.id} className="flex group">
            <button
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border flex items-center gap-2 ${
                activeCategory === cat.id 
                  ? "bg-carbon-blue/10 border-carbon-blue text-carbon-blue" 
                  : "bg-carbon-layer border-carbon-border text-carbon-text hover:bg-carbon-layerHover border-l-0"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
            <div className={`px-2 border border-carbon-border border-r-0 flex items-center justify-center transition-colors ${
              activeCategory === cat.id ? "bg-carbon-blue/10 border-carbon-blue border-r-carbon-blue/30" : "bg-carbon-layer group-hover:bg-carbon-layerHover"
            }`}>
              <button 
                onClick={() => { setEditingCat(cat); setShowCatForm(true); }}
                className={`p-1 rounded-sm text-carbon-textSecondary hover:text-carbon-blue transition-colors`}
                title="تعديل التصنيف"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={() => handleDeleteCategory(cat.id)}
                className={`p-1 rounded-sm text-carbon-textSecondary hover:text-carbon-error transition-colors`}
                title="حذف التصنيف"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-carbon-layer border border-carbon-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-carbon-bg border-b border-carbon-border text-carbon-textSecondary text-xs">
              <tr>
                <th className="px-4 py-3 font-medium border-l border-carbon-border w-16 text-center">الصورة</th>
                <th className="px-4 py-3 font-medium border-l border-carbon-border">الصنف / الوصف</th>
                <th className="px-4 py-3 font-medium border-l border-carbon-border">الفرع</th>
                <th className="px-4 py-3 font-medium border-l border-carbon-border">السعر</th>
                <th className="px-4 py-3 font-medium text-center w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-border bg-carbon-layer">
              {filteredMenu.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-carbon-textSecondary">
                    لا توجد أصناف في هذا التصنيف
                  </td>
                </tr>
              ) : (
                filteredMenu.map((item) => (
                  <tr key={item.id} className="hover:bg-carbon-layerHover transition-colors">
                    <td className="px-4 py-3 border-l border-carbon-border align-middle text-center">
                      <div className="w-10 h-10 border border-carbon-border bg-carbon-bg flex items-center justify-center overflow-hidden mx-auto">
                        {item.imageUrl ? (
                          <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">{apiCategories.find(c => c.id === item.categoryId)?.icon || '🍕'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-l border-carbon-border align-middle">
                      <h4 className="font-semibold text-sm text-carbon-text">{item.name}</h4>
                      <p className="text-xs text-carbon-textSecondary mt-1 line-clamp-1 max-w-[300px]">{item.description}</p>
                    </td>
                    <td className="px-4 py-3 border-l border-carbon-border align-middle">
                      {item.branchId ? (
                        <span className="text-xs font-medium px-2 py-0.5 bg-carbon-blue/10 text-carbon-blue border border-carbon-blue/20">
                          {branches.find(b => b.id === item.branchId)?.name}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 bg-carbon-bg text-carbon-textSecondary border border-carbon-border">
                          عام
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-l border-carbon-border align-middle font-semibold text-carbon-text">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setEditingItem(item); setShowAddForm(true); }} 
                          className="p-1.5 text-carbon-textSecondary hover:text-carbon-blue hover:bg-carbon-layerHover transition-colors border border-transparent hover:border-carbon-border" 
                          title="تعديل الصنف"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          className="p-1.5 text-carbon-textSecondary hover:text-carbon-error hover:bg-carbon-layerHover transition-colors border border-transparent hover:border-carbon-border" 
                          title="حذف الصنف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"""

new_content = pattern.sub(new_menu, content)
with open('src/modules/hq/views/ManagementPages.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("MenuPage updated successfully.")
