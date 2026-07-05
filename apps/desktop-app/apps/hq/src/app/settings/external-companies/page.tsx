'use client';

import React, { useState, useEffect } from 'react';
import { externalCompanyService, ExternalCompany } from '../../../services/externalCompanyService';
import { Plus, X, Building2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ExternalCompaniesSettings() {
  const [companies, setCompanies] = useState<ExternalCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await externalCompanyService.getAll();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (company: ExternalCompany) => {
    try {
      const updated = await externalCompanyService.update(company.id, {
        name: company.name,
        isActive: !company.isActive
      });
      setCompanies(companies.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const created = await externalCompanyService.create({ name: newName, isActive: true });
      setCompanies([...companies, created]);
      setNewName('');
      setIsAdding(false);
    } catch (e) {
      console.error(e);
      alert("فشل إضافة الشركة");
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل شركات التوصيل... 🚚</div>;

  return (
    <div className="space-y-6 font-cairo">
      {/* Header */}
      <div className="bg-[#FF6B35] neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3 text-[#FF6B35]">
            <Building2 size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">إدارة شركات التوصيل (Aggregators)</h2>
            <p className="font-bold text-white/90">أضف تطبيقات التوصيل مثل هنقرستيشن، جاهز، تويو لإدارة الطلبات الخارجية</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="neo-btn bg-white text-[#FF6B35] hover:bg-gray-100 px-5 py-2.5 flex items-center justify-center gap-2"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          <span>{isAdding ? 'إلغاء' : 'إضافة شركة'}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="neo-card p-5 bg-[#FFFBEB] flex flex-col gap-4 animate-fade-in border-4 border-neo-border">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Plus className="text-brand-orange" />
            إضافة تطبيق توصيل جديد
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="مثال: جاهز، هنقرستيشن..."
              className="neo-input flex-1"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="neo-btn bg-brand-green text-white px-8 disabled:opacity-50"
            >
              حفظ
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.length === 0 ? (
          <div className="col-span-full neo-card bg-gray-50 border-dashed border-4 p-12 text-center flex flex-col items-center justify-center">
            <Building2 size={64} className="text-gray-300 mb-4" />
            <h3 className="text-2xl font-black text-gray-400 mb-2">لا توجد شركات توصيل</h3>
            <p className="font-bold text-gray-400">أضف التطبيقات التي تتعامل معها لتسهيل إدخال الطلبات الخارجية</p>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className={`neo-card p-5 flex flex-col justify-between gap-4 transition-all ${company.isActive ? 'bg-white' : 'bg-[#FFFBEB] opacity-80'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 border-2 border-neo-border rounded-lg ${company.isActive ? 'bg-[#FF6B35] text-white' : 'bg-gray-300 text-gray-500'}`}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{company.name}</h3>
                    <div className="mt-1">
                      {company.isActive ? (
                        <span className="bg-brand-green text-white text-xs font-bold px-2 py-1 border-2 border-neo-border rounded-full">نشط ✅</span>
                      ) : (
                        <span className="bg-gray-400 text-white text-xs font-bold px-2 py-1 border-2 border-neo-border rounded-full">معطل ❌</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-dashed border-neo-border/20 flex items-center justify-between">
                <button
                  onClick={() => handleToggle(company)}
                  className={`neo-btn px-4 py-2 text-sm flex items-center gap-2 ${
                    company.isActive 
                      ? 'bg-brand-red text-white hover:bg-red-600' 
                      : 'bg-brand-green text-white hover:bg-green-600'
                  }`}
                >
                  {company.isActive ? (
                    <>
                      <ToggleRight size={18} />
                      تعطيل
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={18} />
                      تفعيل
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
