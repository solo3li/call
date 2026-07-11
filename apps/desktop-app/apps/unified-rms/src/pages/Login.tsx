import React, { useState } from 'react';
import { LogIn, ArrowRight, Smartphone, ShieldCheck, KeyRound, CheckCircle2, UserCog, User, Headset, PackageSearch, Store } from "lucide-react";
import { useAuth, Role } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import sha1 from 'js-sha1';

const AlphanumericChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function decodeBase32(input: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = input.toUpperCase().replace(/=+$/, '');
  const length = cleaned.length;
  const out = new Uint8Array(((length * 5) / 8) | 0);
  let bits = 0;
  let value = 0;
  let index = 0;
  for (let i = 0; i < length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      out[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return out;
}

function generateBoardToken(secret: string) {
  const keyBytes = decodeBase32(secret);
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const step = Math.floor(unixTimestamp / 3600);
  
  const stepBytes = new Uint8Array(8);
  let tempStep = step;
  for (let i = 7; i >= 0; i--) {
    stepBytes[i] = tempStep & 0xff;
    tempStep = Math.floor(tempStep / 256);
  }
  
  const hmacObj = sha1.hmac.create(keyBytes);
  hmacObj.update(stepBytes);
  const hash = new Uint8Array(hmacObj.array());
  
  const result = [];
  for (let i = 0; i < 10; i++) {
    const offset = (i * 2) % (hash.length - 1);
    const val = ((hash[offset] << 8) | hash[offset + 1]) & 0x7fff;
    result.push(AlphanumericChars[val % AlphanumericChars.length]);
  }
  return result.join('');
}

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

    try {
      const baseUrl = window.location.origin.includes('localhost') 
          ? 'http://api-call.167.71.66.188.nip.io/api' 
          : '/api';
          
      const response = await fetch(`${baseUrl}/Auth/login-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode: totpCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "الرمز غير صحيح، يرجى المحاولة مرة أخرى.");
      }

      setSuccess(true);
      
      // The API returns Token, Role, TenantId, FullName etc.
      localStorage.setItem("token", data.token);
      localStorage.setItem("tenantId", data.tenantId || "");
      localStorage.setItem("userName", data.fullName || "");
      
      // Determine app based on role mapping
      let assignedRole: Role = null;
      let targetPath = "/";
      
      // Assign specific unified-rms roles based on API Role
      const apiRole = (data.userRole || data.role || "").toUpperCase();
      if (apiRole.includes("ADMIN") || apiRole.includes("OWNER")) {
          assignedRole = 'admin';
          targetPath = '/hq';
      } else if (apiRole.includes("CASHIER")) {
          assignedRole = 'cashier';
          targetPath = '/pos';
      } else if (apiRole.includes("AGENT") || apiRole.includes("STAFF")) { // Map Agent to Call Center, generic staff to Call Center for now
          assignedRole = 'agent';
          targetPath = '/call-center';
      } else if (apiRole.includes("CHEF")) {
          assignedRole = 'inventory_manager';
          targetPath = '/inventory';
      } else if (apiRole.includes("MANAGER") || apiRole.includes("BRANCH")) {
          assignedRole = 'branch_manager';
          targetPath = '/branch';
      } else {
          assignedRole = 'admin'; // fallback
          targetPath = '/hq';
      }
      
      localStorage.setItem("userRole", assignedRole);
      
      setTimeout(() => {
        login(assignedRole);
        navigate(targetPath);
      }, 500);

    } catch (err: any) {
      setError(err.message || "فشل الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
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
                <button type="button" onClick={() => setTotpCode(generateBoardToken("ADMINSECRETKEY222222222222222222"))} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#FFD700] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <UserCog size={16} />
                  <span>الإدارة (HQ)</span>
                </button>
                <button type="button" onClick={() => setTotpCode(generateBoardToken("MANAGERSECRETKEY2222222222222222"))} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#AA00FF] text-[#1A1A1A] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <Store size={16} />
                  <span>الفرع (Branch)</span>
                </button>
                <button type="button" onClick={() => setTotpCode(generateBoardToken("CASHIERSECRETKEY2222222222222222"))} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#00E676] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <User size={16} />
                  <span>الكاشير (POS)</span>
                </button>
                <button type="button" onClick={() => setTotpCode(generateBoardToken("AGENTSECRETKEY222222222222222222"))} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#FF6B35] transition-colors shadow-[2px_2px_0px_#1A1A1A]">
                  <Headset size={16} />
                  <span>خدمة العملاء</span>
                </button>
                <button type="button" onClick={() => setTotpCode(generateBoardToken("CHEFSECRETKEY2222222222222222222"))} className="py-2 flex flex-col items-center justify-center gap-1 bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs hover:bg-[#00B0FF] transition-colors shadow-[2px_2px_0px_#1A1A1A] col-span-2">
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
