import Link from "next/link";
import { Download, Monitor, Smartphone, ArrowRight, ShieldCheck, FileArchive, ChevronDown } from "lucide-react";
import { MarketingHeader, MarketingFooter } from "../../views/MarketingPages";

export const metadata = {
  title: "تحميل أوبنو | إصدارات النظام",
  description: "قم بتحميل أحدث إصدارات أوبنو لأجهزة سطح المكتب (Windows/Mac/Linux) وتطبيق الهاتف (APK) لإدارة مطعمك بكل سهولة.",
};

type Asset = {
  name: string;
  os: string;
  type: string;
  size: string;
  link: string;
};

type Release = {
  version: string;
  date: string;
  status: string;
  color: string;
  assets: Asset[];
};

async function fetchGithubReleases(): Promise<Release[]> {
  try {
    const repo = process.env.GITHUB_REPO || 'solo3li/foodRMS';
    const headers: HeadersInit = {};
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      headers,
      cache: 'no-store' // Always fetch the latest releases
    });

    if (!res.ok) {
      console.error('Failed to fetch GitHub releases:', res.statusText);
      return [];
    }

    const data = await res.json();
    
    return data.map((release: any, idx: number) => {
      let status = release.prerelease ? "نسخة تجريبية (Pre-release)" : "مستقر (Stable)";
      let color = "bg-brand-blue";
      
      if (idx === 0) {
        status = "أحدث إصدار (Latest)";
        color = "bg-brand-green";
      } else if (idx > 2) {
        status = "أرشيف (Archived)";
        color = "bg-gray-400";
      }

      const formattedDate = new Date(release.published_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const assets: Asset[] = release.assets?.map((asset: any) => {
        const nameLower = asset.name.toLowerCase();
        let os = "غير معروف";
        let type = "ملف";
        
        if (nameLower.includes('windows') || nameLower.endsWith('.exe') || nameLower.endsWith('.msi')) {
          os = "Windows";
          type = nameLower.endsWith('.msi') ? "Installer (.msi)" : "Installer (.exe)";
        } else if (nameLower.includes('mac') || nameLower.includes('darwin') || nameLower.includes('apple') || nameLower.endsWith('.dmg') || nameLower.endsWith('.app.tar.gz')) {
          os = "Mac";
          type = nameLower.endsWith('.dmg') ? "DMG" : "App Archive";
        } else if (nameLower.includes('linux') || nameLower.endsWith('.deb') || nameLower.endsWith('.appimage') || nameLower.endsWith('.tar.gz')) {
          os = "Linux";
          type = nameLower.endsWith('.deb') ? "Deb" : (nameLower.endsWith('.appimage') ? "AppImage" : "Archive");
        } else if (nameLower.includes('android') || nameLower.endsWith('.apk')) {
          os = "Android";
          type = "APK";
        }

        const sizeMB = (asset.size / (1024 * 1024)).toFixed(1) + " MB";

        return {
          name: asset.name,
          os,
          type,
          size: sizeMB,
          link: asset.browser_download_url
        };
      }).filter((asset: Asset) => asset.type !== "App Archive") || [];

      return {
        version: release.tag_name || release.name,
        date: formattedDate,
        status,
        color,
        assets
      };
    });

  } catch (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
}

export default async function DownloadPage() {
  const releases = await fetchGithubReleases();

  return (
    <div className="font-cairo dir-rtl bg-neo-bg min-h-screen flex flex-col overflow-hidden">
      <MarketingHeader />
      
      <main className="flex-grow pt-24 pb-32">
        {/* Header Section */}
        <section className="max-w-6xl mx-auto px-6 mb-16 text-center relative z-10">
          <div className="inline-block bg-brand-yellow border-4 border-neo-border px-8 py-3 rounded-2xl font-black text-xl shadow-[6px_6px_0px_#1A1A1A] mb-8">
            ⬇️ أرشيف ومركز التحميلات
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.2] tracking-tight text-neo-border mb-6">
            إصدارات النظام
            <br />
            <span className="bg-brand-orange text-white px-4 border-4 border-neo-border inline-block shadow-[8px_8px_0px_#1A1A1A] mt-2">
              حمل النسخة المناسبة لك
            </span>
          </h1>
          <p className="text-xl font-bold text-gray-800 max-w-2xl mx-auto leading-relaxed">
            مزامنة مباشرة مع مستودع GitHub لضمان حصولك دائماً على أحدث الإصدارات فور صدورها.
          </p>
        </section>

        {/* Releases List Section */}
        <section className="max-w-5xl mx-auto px-6 relative z-20">
          {releases.length === 0 ? (
            <div className="bg-white border-4 border-neo-border rounded-2xl p-12 text-center shadow-[8px_8px_0px_#1A1A1A]">
              <h3 className="text-3xl font-black text-neo-border mb-4">لا توجد إصدارات حالياً</h3>
              <p className="text-xl font-bold text-gray-500">لم يتم نشر أي إصدارات أو ملفات تحميل في مستودع GitHub حتى الآن. يرجى المحاولة لاحقاً.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {releases.map((release, idx) => (
                <details 
                  key={idx} 
                  className="group bg-white border-4 border-neo-border rounded-2xl shadow-[8px_8px_0px_#1A1A1A] transition-all overflow-hidden open:ring-4 open:ring-neo-border/20"
                  open={idx === 0}
                >
                  
                  {/* Accordion Header */}
                  <summary className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors gap-4 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-4">
                      <div className={`text-white px-4 py-2 border-3 border-neo-border rounded-xl font-black text-xl shadow-[4px_4px_0px_#1A1A1A] ${release.color}`}>
                        {release.version}
                      </div>
                      <div>
                        <h3 className="font-black text-2xl text-neo-border flex items-center gap-2">
                          إصدار {release.version}
                          {release.status.includes('أحدث') && <span className="bg-brand-yellow text-neo-border text-sm px-2 py-1 border-2 border-neo-border rounded-md shadow-[2px_2px_0px_#1A1A1A] ml-2">موصى به</span>}
                        </h3>
                        <p className="font-bold text-gray-500 text-sm mt-1">تاريخ الإصدار: {release.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="font-bold text-lg hidden sm:block text-neo-border">
                        {release.status}
                      </div>
                      <div className="w-12 h-12 bg-white border-3 border-neo-border rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#1A1A1A] transition-transform group-open:rotate-180 group-open:bg-gray-100">
                        <ChevronDown size={24} strokeWidth={3} className="text-neo-border" />
                      </div>
                    </div>
                  </summary>

                  {/* Accordion Body (Files Table) */}
                  <div className="border-t-4 border-neo-border p-0 bg-gray-50">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right font-bold text-lg whitespace-nowrap min-w-[800px]">
                        <thead>
                          <tr className="border-b-4 border-neo-border bg-white text-gray-500">
                            <th className="p-4 border-l-4 border-neo-border">الملف (النسخة)</th>
                            <th className="p-4 border-l-4 border-neo-border">نظام التشغيل</th>
                            <th className="p-4 border-l-4 border-neo-border">النوع</th>
                            <th className="p-4 border-l-4 border-neo-border">الحجم</th>
                            <th className="p-4">تحميل</th>
                          </tr>
                        </thead>
                        <tbody>
                          {release.assets.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-gray-500 font-bold">لا توجد ملفات مرفقة مع هذا الإصدار</td>
                            </tr>
                          ) : (
                            release.assets.map((asset, aIdx) => (
                              <tr key={aIdx} className="border-b-2 border-neo-border/20 hover:bg-white transition-colors">
                                <td className="p-4 border-l-2 border-neo-border/20 text-neo-border flex items-center gap-3">
                                  <FileArchive className="text-brand-purple shrink-0" />
                                  {asset.name}
                                </td>
                                <td className="p-4 border-l-2 border-neo-border/20 text-gray-600">
                                  {asset.os === 'Windows' && <span className="flex items-center gap-2"><Monitor size={18} className="shrink-0"/> Windows</span>}
                                  {asset.os === 'Mac' && <span className="flex items-center gap-2"><Monitor size={18} className="shrink-0"/> macOS</span>}
                                  {asset.os === 'Linux' && <span className="flex items-center gap-2"><Monitor size={18} className="shrink-0"/> Linux</span>}
                                  {asset.os === 'Android' && <span className="flex items-center gap-2"><Smartphone size={18} className="shrink-0"/> Android</span>}
                                  {asset.os === 'غير معروف' && <span className="flex items-center gap-2">غير محدد</span>}
                                </td>
                                <td className="p-4 border-l-2 border-neo-border/20 text-gray-600 font-mono text-base">{asset.type}</td>
                                <td className="p-4 border-l-2 border-neo-border/20 text-gray-600 font-mono text-base">{asset.size}</td>
                                <td className="p-4">
                                  <a href={asset.link} target="_blank" rel="noopener noreferrer" className="inline-flex bg-brand-orange text-white border-3 border-neo-border px-4 py-2 rounded-lg text-sm shadow-[3px_3px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all items-center gap-2 font-black">
                                    <Download size={16} strokeWidth={3} />
                                    تحميل
                                  </a>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                </details>
              ))}
            </div>
          )}
        </section>

        {/* Security Banner */}
        <section className="max-w-5xl mx-auto px-6 mt-24">
          <div className="bg-brand-blue text-white p-8 border-4 border-neo-border rounded-2xl shadow-[8px_8px_0px_#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-8 rotate-1">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white border-4 border-neo-border rounded-full flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#1A1A1A] -rotate-6">
                <ShieldCheck size={32} className="text-brand-blue" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">تطبيقات موثقة وآمنة 100%</h3>
                <p className="font-bold opacity-90 text-lg">يتم جلب هذه الملفات مباشرة من مستودع المصدر المفتوح وتخضع لعمليات فحص تلقائية لضمان الجودة والأمان.</p>
              </div>
            </div>
            <Link href="/contact" className="shrink-0 bg-brand-yellow text-neo-border font-black px-6 py-3 border-4 border-neo-border rounded-xl shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all flex items-center gap-2">
              واجهت مشكلة؟
              <ArrowRight size={18} strokeWidth={3} />
            </Link>
          </div>
        </section>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
