import React, { useState } from 'react';
import { LogIn, ArrowRight, Smartphone, ShieldCheck, KeyRound, CheckCircle2, UserCog, User, Headset, PackageSearch } from "lucide-react";
import { useAuth, Role } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Mock verification
    setTimeout(() => {
      let role: Role = null;
      if (totpCode.toUpperCase() === 'ADMIN12345') role = 'admin';
      else if (totpCode.toUpperCase() === 'CASHIER123') role = 'cashier';
      else if (totpCode.toUpperCase() === 'AGENT12345') role = 'agent';
      else if (totpCode.toUpperCase() === 'INVENT1234') role = 'inventory_manager';
      else {
        setError("الرمز غير صحيح، يرجى المحاولة مرة أخرى.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        login(role);
        if (role === 'admin') navigate('/hq');
        else if (role === 'cashier') navigate('/pos');
        else if (role === 'agent') navigate('/call-center');
        else if (role === 'inventory_manager') navigate('/inventory');
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFBEB] font-cairo py-12 relative overflow-hidden" dir="rtl">
      {/* Decorative Neo-Brutalist Grid Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="w-full max-w-[500px] px-4 z-10">
        <div className="relative">
          {/* Spectacular Yellow 3D Backplate Shadow Card */}
          <div className="absolute inset-0 bg-[#FFD700] border-4 border-[#1A1A1A] rounded-[28px] translate-x-3 translate-y-3 -rotate-1 z-0"></div>
          
          {/* Main Content Ledger Card */}
          <div className="relative z-10 bg-white border-4 border-[#1A1A1A] rounded-[28px] p-8 md:p-10 shadow-none">
            
            {/* Premium Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-black bg-[#FF6B35] text-white px-6 py-2 border-3 border-[#1A1A1A] rotate-1 inline-block shadow-[4px_4px_0px_#1A1A1A] rounded-xl tracking-tight">
                أوبنو
              </h1>
              <p className="font-bold text-gray-500 text-sm mt-5 text-center leading-relaxed">
                البوابة الموحدة — الدخول الآمن عبر BoardToken
              </p>
            </div>

            {/* Error Message Alert Card */}
            {error && (
              <div className="mb-4">
                <div className="p-4 bg-[#FF1744] text-white border-3 border-[#1A1A1A] rounded-2xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-[3px_3px_0px_#1A1A1A] rotate-[-1deg]">
                  ⚠️ {error}
                </div>
              </div>
            )}

            {/* Success Animation Card */}
            {success && (
              <div className="mb-6 p-4 bg-[#00E676] text-[#1A1A1A] border-3 border-[#1A1A1A] rounded-2xl font-black text-sm text-center flex flex-col items-center justify-center gap-2 shadow-[3px_3px_0px_#1A1A1A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={22} strokeWidth={3} />
                  <span>تم بنجاح! جاري الانتقال لمساحة العمل...</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                
                {/* Input Field */}
                <div className="space-y-2">
                  <label className="font-black text-sm flex items-center gap-2 text-[#1A1A1A]">
                    <ShieldCheck size={18} className="text-[#AA00FF]" strokeWidth={3} />
                    رمز تسجيل الدخول
                  </label>
                  <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-xl overflow-hidden focus-within:shadow-[3px_3px_0px_#AA00FF] focus-within:translate-y-[-1px] transition-all">
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#AA00FF]/10 border-l-3 border-[#1A1A1A] flex items-center justify-center rounded-r-lg">
                      <KeyRound className="text-[#1A1A1A]" size={20} strokeWidth={2.5} />
                    </div>
                    <input
                      id="totp-code-input"
                      type="text"
                      required
                      disabled={loading || success}
                      maxLength={10}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                      placeholder="أدخل الكود الموحد"
                      autoComplete="off"
                      className="w-full pr-16 pl-4 py-4 text-2xl tracking-[0.2em] font-black dir-ltr text-center uppercase bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success || !totpCode}
                className="w-full py-4 text-xl flex items-center justify-center gap-3 border-3 border-[#1A1A1A] rounded-2xl font-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1A1A1A] transition-all text-white bg-[#AA00FF] shadow-[3px_3px_0px_#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>جاري التحقق...</span>
                ) : success ? (
                  <span>مرحباً بك!</span>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <LogIn size={20} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>

            <hr className="my-6 border-t-2 border-dashed border-gray-300" />
            
            {/* Quick Mock Login (Development Only) */}
            <div className="space-y-3">
              <p className="text-xs font-black text-gray-500 text-center mb-3">تسجيل الدخول السريع (للاختبار)</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setTotpCode("ADMIN12345")} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#FFD700] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <UserCog size={16} />
                  <span>الإدارة (HQ)</span>
                </button>
                <button onClick={() => setTotpCode("CASHIER123")} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#00E676] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <User size={16} />
                  <span>الكاشير (POS)</span>
                </button>
                <button onClick={() => setTotpCode("AGENT12345")} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#FF6B35] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <Headset size={16} />
                  <span>خدمة العملاء</span>
                </button>
                <button onClick={() => setTotpCode("INVENT1234")} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#00B0FF] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <PackageSearch size={16} />
                  <span>المخازن</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
