'use client';

import { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  Bot,
  User,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  Filter,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  ArrowDownUp,
} from 'lucide-react';
import { callRecordsApi, getBaseUrl } from '../utils/api';

interface CallRecord {
  id: number;
  callerNumber: string;
  callStartTime: string;
  durationSeconds: number;
  recordingUrl: string;
  handledByAi: boolean;
  transferredToHuman: boolean;
  tenantName: string;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const fullUrl = `${getBaseUrl()}${url}`;

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
      setProgress(pct);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => setPlaying(false);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct * 100);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-50 border-2 border-neo-border rounded-sm p-2 min-w-[200px]">
      <audio
        ref={audioRef}
        src={fullUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        onClick={toggle}
        className="w-8 h-8 bg-brand-purple text-white flex items-center justify-center border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#1A1A1A] transition-all shrink-0"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="w-full h-2 bg-gray-200 border border-neo-border cursor-pointer relative rounded-none"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-brand-purple transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-400 font-mono">
          <span>{formatDuration(Math.floor((progress / 100) * duration))}</span>
          <span>{formatDuration(Math.floor(duration))}</span>
        </div>
      </div>

      <button onClick={toggleMute} className="text-gray-400 hover:text-neo-text transition-colors shrink-0">
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      <a
        href={fullUrl}
        download
        className="text-gray-400 hover:text-brand-blue transition-colors shrink-0"
        title="تحميل التسجيل"
      >
        <Download size={14} />
      </a>
    </div>
  );
}

export default function CallRecordsPage() {
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'ai' | 'human'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 15;

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, pageSize };
      if (filter !== 'all') params.handledBy = filter;
      const res = await callRecordsApi.getAll(params);
      setRecords(res.data.records);
      setTotal(res.data.total);
    } catch (e: any) {
      setError('فشل تحميل البيانات. تأكد من اتصالك بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filter, page]);

  const filteredRecords = records.filter((r) =>
    search === '' || r.callerNumber?.includes(search) || r.tenantName?.includes(search)
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neo-text flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-purple text-white flex items-center justify-center border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
              <PhoneCall size={16} />
            </span>
            المكالمات المسجلة
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            استمع لتسجيلات مكالمات جميع المطاعم وفلتر بين الذكاء الاصطناعي والموظفين
          </p>
        </div>
        <button
          onClick={fetchRecords}
          className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 font-bold border-2 border-neo-border shadow-[3px_3px_0px_#1A1A1A] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1A1A1A] transition-all text-sm"
        >
          <RefreshCw size={14} />
          تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي المكالمات', value: total, color: 'bg-brand-yellow', icon: PhoneCall },
          { label: 'رد الذكاء الاصطناعي', value: records.filter(r => r.handledByAi).length, color: 'bg-brand-purple text-white', icon: Bot },
          { label: 'رد موظف بشري', value: records.filter(r => !r.handledByAi).length, color: 'bg-brand-green', icon: User },
          { label: 'تحويل لموظف', value: records.filter(r => r.transferredToHuman).length, color: 'bg-brand-orange text-white', icon: ArrowDownUp },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} border-2 border-neo-border shadow-[3px_3px_0px_#1A1A1A] p-3`}
          >
            <div className="flex items-center justify-between">
              <stat.icon size={18} />
              <span className="text-2xl font-black">{stat.value}</span>
            </div>
            <p className="text-xs font-bold mt-1 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالرقم أو اسم المطعم..."
            className="w-full pr-9 pl-3 py-2 border-2 border-neo-border text-sm font-medium bg-white focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex border-2 border-neo-border overflow-hidden">
          {[
            { key: 'all', label: 'الكل', icon: Filter },
            { key: 'ai', label: 'ذكاء اصطناعي', icon: Bot },
            { key: 'human', label: 'موظف بشري', icon: User },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key as any); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-r-2 border-neo-border last:border-r-0 ${
                filter === f.key
                  ? 'bg-neo-text text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <f.icon size={12} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] bg-white overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_2fr] gap-0 bg-neo-text text-white text-xs font-black border-b-2 border-neo-border">
          <div className="p-3 flex items-center gap-1"><Calendar size={12} /> التاريخ والوقت</div>
          <div className="p-3">المطعم</div>
          <div className="p-3 flex items-center gap-1"><PhoneCall size={12} /> رقم العميل</div>
          <div className="p-3 flex items-center gap-1"><Clock size={12} /> المدة</div>
          <div className="p-3">التسجيل الصوتي</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <RefreshCw size={20} className="animate-spin text-brand-purple" />
            <span className="text-gray-500 font-medium">جاري التحميل...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex items-center justify-center py-16 text-red-500 gap-2">
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <PhoneCall size={48} strokeWidth={1} />
            <p className="font-bold">لا توجد مكالمات مسجلة حتى الآن</p>
            <p className="text-xs">ستظهر هنا المكالمات بعد إجراء اتصالات عبر النظام</p>
          </div>
        )}

        {/* Rows */}
        {!loading && !error && filteredRecords.map((record, idx) => (
          <div
            key={record.id}
            className={`grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_2fr] gap-0 border-b-2 border-neo-border last:border-b-0 hover:bg-gray-50/70 transition-colors ${
              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
            }`}
          >
            {/* Date */}
            <div className="p-3 text-xs font-medium text-gray-600 flex flex-col gap-0.5">
              <span>{formatDate(record.callStartTime)}</span>
            </div>

            {/* Tenant */}
            <div className="p-3">
              <span className="text-xs font-bold text-neo-text">{record.tenantName || '—'}</span>
            </div>

            {/* Caller */}
            <div className="p-3">
              <span className="text-xs font-mono font-bold text-neo-text">{record.callerNumber || 'غير معروف'}</span>
            </div>

            {/* Duration */}
            <div className="p-3">
              <span className="text-xs font-mono font-bold text-gray-600">{formatDuration(record.durationSeconds)}</span>
            </div>

            {/* Audio + Badge */}
            <div className="p-3 flex items-center gap-3 flex-wrap">
              {/* Handler Badge */}
              <span
                className={`text-[10px] font-black px-2 py-0.5 border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A] flex items-center gap-1 shrink-0 ${
                  record.handledByAi
                    ? 'bg-brand-purple text-white'
                    : 'bg-brand-green text-neo-text'
                }`}
              >
                {record.handledByAi ? <Bot size={10} /> : <User size={10} />}
                {record.handledByAi ? 'ذكاء اصطناعي' : 'موظف'}
                {record.transferredToHuman && (
                  <span className="mr-1 text-[9px] opacity-80">← محوّل</span>
                )}
              </span>

              {/* Audio Player */}
              {record.recordingUrl ? (
                <AudioPlayer url={record.recordingUrl} />
              ) : (
                <span className="text-xs text-gray-400 italic">لا يوجد تسجيل</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          
          <span className="text-sm font-bold text-gray-600">
            صفحة {page} من {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
