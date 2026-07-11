import { useRouter } from "../../../hooks/useRouter";
'use client';

import { useState } from "react";
import { LogIn, ArrowRight, Smartphone, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";
import { authApi } from "../utils/api";
import { Link } from "react-router-dom";


export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  
  const handleRedirectAfterLogin = (token: string, userName: string, userRole: string, tenant: { id: string; subdomain: string; loginUrl?: string; currencyCode?: string; currencySymbol?: string }, branchId?: string | null, permissions?: string[]) => {
    localStorage.setItem("token", token);
    localStorage.setItem("tenantId", tenant.id);
    localStorage.setItem("userName", userName);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("branchId", branchId || "");
    localStorage.setItem("permissions", JSON.stringify(permissions || []));
    if (tenant.currencyCode) localStorage.setItem("currencyCode", tenant.currencyCode);
    if (tenant.currencySymbol) localStorage.setItem("currencySymbol", tenant.currencySymbol);

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Clear old data to prevent context contamination
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId");

    try {
      const response = await authApi.loginEmployee({ totpCode: totpCode.trim() });
      const { token, userName, userRole, tenant, branchId, permissions } = response.data;
      handleRedirectAfterLogin(token, userName, userRole, tenant, branchId, permissions);
    } catch (err: any) {
      let errorMessage = "فشل الطلب. يرجى التحقق من البيانات.";
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const firstErrorKey = Object.keys(err.response.data.errors)[0];
          errorMessage = err.response.data.errors[firstErrorKey][0];
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFBEB] font-cairo py-12 relative overflow-hidden" dir="rtl">
      
      {/* Decorative Neo-Brutalist Grid Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Back to home float badge */}
      <Link href="/" className="absolute top-6 right-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white border-3 border-[#1A1A1A] rounded-sm font-semibold text-[#1A1A1A]  hover:translate-y-[-2px] hover: active:translate-y-[1px] active: transition-all text-sm">
        <ArrowRight size={18} strokeWidth={3} />
        <span>الرئيسية</span>
      </Link>

      <div className="w-full max-w-[480px] px-4 z-10">
        <div className="relative">
          
          {/* Spectacular Yellow 3D Backplate Shadow Card */}
          <div className="absolute inset-0 bg-[#FFD700] border-4 border-[#1A1A1A] rounded-[28px] translate-x-3 translate-y-3 -rotate-1 z-0"></div>
          
          {/* Main Content Ledger Card */}
          <div className="relative z-10 bg-white border-4 border-[#1A1A1A] rounded-[28px] p-8 md:p-10 shadow-none">

            {/* Premium Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <img 
                src="/logo.png" 
                alt="OPNO Logo" 
                className="w-24 h-24 object-contain mb-4 transform hover:scale-105 transition-transform duration-300"
              />
              <h1 className="text-4xl font-semibold bg-[#FF6B35] text-white px-6 py-2 border-3 border-[#1A1A1A] rotate-1 inline-block  rounded-sm tracking-tight">
                أوبنو
              </h1>
              <p className="font-medium text-carbon-textSecondary text-sm mt-5 text-center leading-relaxed">
                بوابة الموظفين — التحقق عبر BoardToken
              </p>
            </div>

            {/* Error Message Alert Card */}
            {error && (
              <div className="mb-4">
                <div className="p-4 bg-[#FF1744] text-white border-3 border-[#1A1A1A] rounded-sm font-semibold text-sm text-center flex items-center justify-center gap-2  rotate-[-1deg]">
                   {error}
                </div>
              </div>
            )}

            {/* Success Animation Card */}
            {success && (
              <div className="mb-6 p-4 bg-[#00E676] text-[#1A1A1A] border-3 border-[#1A1A1A] rounded-sm font-semibold text-sm text-center flex flex-col items-center justify-center gap-2 ">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={22} strokeWidth={3} />
                  <span>تم بنجاح! جاري الانتقال...</span>
                </div>
                <p className="text-[10px] opacity-80 mt-1">يرجى الانتظار لتوجيهك للوحة التحكم</p>
              </div>
            )}

            {/* Input Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ─── EMPLOYEE TOTP MECHANICS ─── */}
              <div className="space-y-5">
                
                {/* Pair App Instructions Block */}
                <div className="bg-[#FFFBEB] border-3 border-[#1A1A1A] rounded-sm p-4 flex gap-4 items-start ">
                  <div className="w-12 h-12 bg-[#AA00FF]/15 border-2 border-[#AA00FF] rounded-sm flex items-center justify-center shrink-0">
                    <Smartphone className="text-[#AA00FF]" size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#AA00FF]">طريقة تسجيل دخول الموظفين</p>
                    <ol className="mt-1.5 space-y-1.5 text-xs font-semibold text-carbon-textSecondary list-decimal list-inside">
                      <li>افتح تطبيق <strong className="text-[#FF6B35] underline">BoardToken</strong> على جوالك.</li>
                      <li>أدخل الرمز المكوّن من <strong className="text-[#AA00FF]">10 خانات (حروف وأرقام)</strong>.</li>
                    </ol>
                  </div>
                </div>

                {/* TOTP Input Register */}
                <div className="space-y-2">
                  <label className="font-semibold text-sm flex items-center gap-2 text-[#1A1A1A]">
                    <ShieldCheck size={18} className="text-[#AA00FF]" strokeWidth={3} />
                    رمز تسجيل الدخول المؤقت
                  </label>
                  <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-sm overflow-hidden focus-within: focus-within:translate-y-[-1px] transition-all">
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
                      placeholder="مثال: AB12C3D4EF"
                      autoComplete="one-time-code"
                      className="w-full pr-16 pl-4 py-4 text-2xl tracking-[0.2em] font-semibold dir-ltr text-center uppercase bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-300"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-400 text-center">
                    يتكون الرمز من 10 خانات من الأرقام والحروف اللاتينية الكبيرة
                  </p>
                </div>
              </div>

              {/* Physical Neo Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-4 text-xl flex items-center justify-center gap-3 border-3 border-[#1A1A1A] rounded-sm font-semibold hover:translate-y-[-2px] hover: active:translate-y-[1px] active: transition-all text-white bg-[#AA00FF] "
              >
                {loading ? (
                  <span>جاري التحقق...</span>
                ) : success ? (
                  <span>تم الدخول!</span>
                ) : (
                  <>
                    <span>تأكيد الرمز والدخول</span>
                    <LogIn size={20} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}