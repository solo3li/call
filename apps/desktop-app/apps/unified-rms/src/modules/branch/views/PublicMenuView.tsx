'use client';
import { useFormatCurrency } from "../utils/useFormatCurrency";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { menuApi, getImageUrl } from '../utils/api';
import { MenuItem, MenuCategory } from '../types/api';
import { Star, Clock, MapPin, Plus, Info as InfoIcon } from 'lucide-react';

export default function PublicMenuView() {
  const formatCurrency = useFormatCurrency();
  const params = useParams();
  const tenantId = typeof params?.tenantId === 'string' ? params.tenantId : Array.isArray(params?.tenantId) ? params.tenantId[0] : undefined;
  const branchId = typeof params?.branchId === 'string' ? params.branchId : Array.isArray(params?.branchId) ? params.branchId[0] : undefined;
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'الكل'>('الكل');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!tenantId) return;
      try {
        setLoading(true);
        const res = await menuApi.getPublicMenu(tenantId, branchId);
        setCategories(res.data.categories);
        setItems(res.data.items);
      } catch (err) {
        setError('تعذر تحميل القائمة. يرجى المحاولة مرة أخرى لاحقاً.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [tenantId, branchId]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'الكل') return items;
    return items.filter(i => i.categoryId === activeCategory);
  }, [items, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-black text-gray-800 animate-pulse">جاري تحميل المنيو...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-xl font-bold text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-brand-orange text-white rounded-xl font-black shadow-lg hover:bg-orange-600 transition-colors">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Cairo'] pb-24">
      {/* Header/Hero: App-like Cover */}
      <div className="bg-white pb-4 rounded-b-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] mb-2">
        <div className="h-40 bg-brand-yellow/30 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-20"></div>
          {/* Overlap logo effect */}
          <div className="absolute -bottom-8 right-6 w-20 h-20 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-3xl z-10">
            🍔
          </div>
        </div>
        
        <div className="pt-10 px-6 text-right">
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            قائمة الطعام المميزة
          </h1>
          <p className="text-sm font-bold text-gray-500 mb-4 flex items-center justify-end gap-1">
            <MapPin size={14} /> {branchId ? 'فرع محدد' : 'القائمة الرئيسية'}
          </p>
          
          <div className="flex flex-row-reverse gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
              <Star size={14} className="text-brand-orange fill-brand-orange" /> 4.8 تقييم
            </span>
            <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
              <Clock size={14} /> ١٥-٢٥ دقيقة
            </span>
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
               مفتوح الآن
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs: Sticky App Style */}
      <div className="sticky top-0 z-50 bg-[#f8f9fa] pt-4 pb-2 px-4 shadow-[0_4px_10px_-4px_rgb(0,0,0,0.05)]">
        <div className="flex flex-row-reverse gap-2 overflow-x-auto no-scrollbar scroll-smooth min-w-max pb-2">
          <button
            onClick={() => setActiveCategory('الكل')}
            className={`px-5 py-2.5 rounded-xl font-black text-sm whitespace-nowrap transition-all ${
              activeCategory === 'الكل' 
              ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/30' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-black text-sm whitespace-nowrap transition-all flex flex-row-reverse items-center gap-2 ${
                activeCategory === cat.id 
                ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/30' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {cat.imageUrl ? (
                <img src={getImageUrl(cat.imageUrl)} alt={cat.name} className="w-5 h-5 rounded-md object-cover" />
              ) : (
                <span className="text-base">{cat.icon}</span>
              )}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items: App Style List */}
      <div className="p-4 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3 flex flex-row-reverse gap-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform">
            
            <div className="w-28 h-28 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 relative">
              {item.imageUrl ? (
                <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{categories.find(c => c.id === item.categoryId)?.icon || '🍽️'}</span>
              )}
              <button className="absolute bottom-1 left-1 bg-white text-brand-orange rounded-full p-1 shadow-md border border-gray-100">
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-between text-right py-1">
              <div>
                <h3 className="text-base font-black text-gray-900 leading-tight mb-1">{item.name}</h3>
                <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">
                  {item.description || 'صنف لذيذ محضر بعناية من أجود المكونات الطازجة.'}
                </p>
              </div>
              <div className="flex flex-row-reverse items-center justify-between mt-2">
                <span className="text-sm font-black text-gray-900">
                  {formatCurrency(item.price)}
                </span>
              </div>
            </div>
            
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3 opacity-50">🍽️</div>
            <p className="text-base font-black text-gray-500">لا توجد أصناف في هذا القسم حالياً</p>
          </div>
        )}
      </div>

      {/* Bottom Floating App-like Action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
        <div className="bg-gray-900 text-white p-3 px-5 rounded-2xl shadow-xl flex flex-row-reverse items-center justify-between max-w-2xl mx-auto">
          <div className="flex flex-row-reverse items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <InfoIcon size={16} className="text-gray-300" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400">للاستفسارات والملاحظات</p>
              <p className="text-sm font-black">تواصل مع المطعم</p>
            </div>
          </div>
          <button className="bg-white text-gray-900 px-4 py-2 rounded-xl font-black text-xs hover:bg-gray-100 transition-colors">
            اتصال 📞
          </button>
        </div>
      </div>
    </div>
  );
}
