import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, AlertTriangle, Send, Paperclip, CheckCircle, Clock, Search, Filter, User, ArrowLeft, RefreshCw } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import api from '../utils/api';

interface Message {
  id: string;
  sender: string;
  text: string;
  messageType: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

interface TicketSummary {
  id: string;
  title: string;
  status: string;
  customerName?: string;
  isComplaint: boolean;
  telegramChatId?: number;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
}

export default function SupportComplaintsPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<{ title: string; status: string; customerName?: string; isComplaint: boolean; telegramChatId?: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Support/Tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (selectedTicketId) {
      const fetchTicketDetails = async () => {
        try {
          const res = await api.get(`/Support/Ticket/${selectedTicketId}`);
          if (!isMounted) return;
          
          setMessages(res.data.messages || []);
          setActiveTicket({
            title: res.data.title,
            status: res.data.status,
            customerName: res.data.customerName,
            isComplaint: res.data.isComplaint,
            telegramChatId: res.data.telegramChatId
          });

          // Setup SignalR
          if (!hubConnectionRef.current) {
            const connection = new signalR.HubConnectionBuilder()
              .withUrl('/supportHub', {
                accessTokenFactory: () => localStorage.getItem('token') || ''
              })
              .configureLogging(signalR.LogLevel.None)
              .withAutomaticReconnect()
              .build();

            connection.serverTimeoutInMilliseconds = 60000; // 60 seconds
            connection.keepAliveIntervalInMilliseconds = 15000; // 15 seconds

            try {
              await connection.start();
              if (!isMounted) {
                await connection.stop();
                return;
              }
              hubConnectionRef.current = connection;
            } catch (err) {
              console.error("SignalR connection error", err);
              return;
            }
          }

          const connection = hubConnectionRef.current;
          if (connection.state === signalR.HubConnectionState.Connected) {
            await connection.invoke("JoinTicketGroup", selectedTicketId);
            connection.off("ReceiveMessage");
            connection.on("ReceiveMessage", (message: Message) => {
              if (!isMounted) return;
              setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
              });
            });
          }
        } catch (err) {
          console.error("Failed to fetch ticket details", err);
        }
      };
      fetchTicketDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || (!inputText.trim() && !selectedFile)) return;

    setSending(true);
    const formData = new FormData();
    formData.append('ticketId', selectedTicketId);
    formData.append('text', inputText);
    formData.append('senderRole', 'Restaurant');

    if (selectedFile) {
      formData.append('attachment', selectedFile);
      formData.append('messageType', selectedFile.type.startsWith('image/') ? 'Image' : 'File');
    } else {
      formData.append('messageType', 'Text');
    }

    try {
      setInputText('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await api.post('/Support/SendMessage', formData);
      // Refresh tickets list so last message updates
      fetchTickets();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchFilter = t.isComplaint;
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        t.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Banner */}
      <div className="neo-card bg-brand-yellow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neo-text flex items-center gap-2">
            <MessageSquare className="text-brand-purple" size={28} />
            دعم العملاء وشكاوى المطعم 🎧
          </h1>
          <p className="font-bold text-neo-text/80 mt-1">
            إدارة استفسارات وشكاوى عملاء مطعمك المباشرة، والتواصل الفوري معهم عبر تليجرام والموقع.
          </p>
        </div>
        <button 
          onClick={fetchTickets}
          className="neo-btn bg-white text-neo-text flex items-center gap-2 text-xs font-bold self-end md:self-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> تحديث القائمة
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px] max-h-[80vh]">
        {/* Tickets List */}
        <div className="neo-card bg-neo-card p-4 flex flex-col gap-4 overflow-hidden h-full">
          {/* Search & Filter Controls */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ابحث عن عميل، عنوان، أو رسالة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border-2 border-neo-border rounded-xl pr-10 pl-4 py-2 font-bold text-sm shadow-[2px_2px_0px_#1A1A1A] outline-none focus:shadow-[3px_3px_0px_#FF6B35] transition-all"
              />
            </div>

            <div className="flex gap-2">
              <div
                className="flex-1 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 bg-brand-red text-white neo-btn shadow-[2px_2px_0px_#1A1A1A]"
              >
                <AlertTriangle size={14} /> شكاوى البوت فقط ({filteredTickets.length})
              </div>
            </div>
          </div>

          {/* Tickets Scroll View */}
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {loading && tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-bold animate-pulse">
                جاري تحميل التذاكر...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-bold text-center p-4">
                <MessageSquare size={36} className="mb-2 opacity-50" />
                لا توجد تذاكر أو شكاوى مطابقة للبحث.
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const isSelected = ticket.id === selectedTicketId;
                const timeStr = new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-3 rounded-xl border-2 border-neo-border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-brand-yellow/30 shadow-[3px_3px_0px_#1A1A1A] translate-x-[-2px] translate-y-[-2px]' 
                        : 'bg-white hover:bg-gray-50 shadow-[1px_1px_0px_#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-black text-sm text-neo-text line-clamp-1">
                        {ticket.isComplaint ? (
                          <span className="bg-brand-red text-white p-0.5 rounded text-[10px]" title="شكوى بوت">⚠️</span>
                        ) : (
                          <span className="bg-brand-blue text-white p-0.5 rounded text-[10px]" title="استفسار">💬</span>
                        )}
                        {ticket.title}
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-neo-border shrink-0 ${ticket.status === 'Open' ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {ticket.status === 'Open' ? 'مفتوح' : 'مغلق'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                      <User size={13} className="text-brand-purple" />
                      <span>{ticket.customerName || 'عميل المطعم'}</span>
                    </div>

                    <p className="text-xs font-bold text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-neo-border/50">
                      {ticket.lastMessage}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 pt-1 border-t border-neo-border/10">
                      <span className="flex items-center gap-1"><Clock size={12} /> {timeStr}</span>
                      <span className="bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded font-black">
                        {ticket.messageCount} رسائل
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 neo-card bg-neo-card flex flex-col overflow-hidden h-full">
          {selectedTicketId && activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="bg-brand-purple text-white p-4 border-b-2 border-neo-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border-2 border-white flex items-center justify-center shrink-0 font-bold">
                    {activeTicket.customerName?.charAt(0) || 'ع'}
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="font-black text-base truncate flex items-center gap-2">
                      {activeTicket.title}
                      {activeTicket.isComplaint && (
                        <span className="bg-brand-red text-white text-[10px] px-2 py-0.5 rounded-full font-black border border-white">
                          شكوى تليجرام ⚠️
                        </span>
                      )}
                    </h2>
                    <p className="text-xs font-bold text-white/80 truncate flex items-center gap-3 mt-0.5">
                      <span>العميل: {activeTicket.customerName || 'عميل المطعم'}</span>
                      {activeTicket.telegramChatId && (
                        <span className="bg-brand-blue/30 px-2 py-0.5 rounded border border-white/20 text-[10px]">
                          مرتبط ببوت التليجرام 🤖
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase border-2 border-white ${activeTicket.status === 'Open' ? 'bg-brand-green text-white' : 'bg-gray-600 text-white'}`}>
                    {activeTicket.status === 'Open' ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFBEB]/40 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 font-bold">
                    لا توجد رسائل في هذه التذكرة بعد.
                  </div>
                ) : (
                  messages.map(msg => {
                    const isCustomer = msg.sender === 'Customer';
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                        <span className="text-[10px] font-black text-gray-500 mb-1 px-1">
                          {isCustomer ? (activeTicket.customerName || 'العميل') : 'إدارة المطعم'} • {timeStr}
                        </span>
                        <div className={`p-3 rounded-2xl max-w-[80%] border-2 border-neo-border shadow-[3px_3px_0px_#1A1A1A] ${
                          isCustomer ? 'bg-white text-neo-text rounded-tr-none' : 'bg-brand-yellow text-neo-text rounded-tl-none'
                        }`}>
                          {msg.messageType === 'Text' && <p className="whitespace-pre-wrap font-bold text-sm">{msg.text}</p>}
                          {msg.messageType === 'Image' && (
                            <div>
                              <img src={msg.attachmentUrl} alt="المرفق" className="rounded-xl border-2 border-neo-border mb-2 max-h-60 object-cover shadow-[2px_2px_0px_#1A1A1A]" />
                              {msg.text && <p className="font-bold text-sm">{msg.text}</p>}
                            </div>
                          )}
                          {msg.messageType === 'File' && (
                            <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white p-2 rounded-xl border-2 border-neo-border hover:shadow-[2px_2px_0px_#1A1A1A] transition">
                              <Paperclip size={20} className="text-brand-purple shrink-0" />
                              <span className="truncate underline font-bold text-sm">{msg.attachmentName}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected File Preview */}
              {selectedFile && (
                <div className="bg-brand-cyan/20 px-4 py-2 border-t-2 border-neo-border flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-neo-text">
                    <Paperclip size={16} />
                    <span>المرفق: {selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="font-black text-brand-red text-xs hover:underline">إلغاء المرفق</button>
                </div>
              )}

              {/* Message Input Form */}
              <div className="bg-white p-4 border-t-2 border-neo-border">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-neo-text bg-brand-yellow border-2 border-neo-border rounded-xl shadow-[2px_2px_0px_#1A1A1A] hover:shadow-[1px_1px_0px_#1A1A1A] transition flex-shrink-0"
                    title="إرفاق ملف أو صورة"
                  >
                    <Paperclip size={20} />
                  </button>

                  <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                    placeholder="اكتب ردك للعميل (سيتم إرساله مباشرة إلى تليجرام والموقع)..."
                    className="flex-1 max-h-32 min-h-[48px] bg-gray-50 border-2 border-neo-border rounded-xl px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#1A1A1A] focus:bg-white focus:shadow-[3px_3px_0px_#FF6B35] transition-all resize-none outline-none"
                    rows={1}
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !selectedFile)}
                    className="p-3 bg-brand-orange text-white border-2 border-neo-border rounded-xl shadow-[2px_2px_0px_#1A1A1A] hover:shadow-[1px_1px_0px_#1A1A1A] disabled:opacity-50 disabled:shadow-none transition flex-shrink-0 flex items-center justify-center gap-1 font-black text-sm"
                  >
                    {sending ? <span className="animate-spin">⏳</span> : <Send size={20} className="rotate-180" />}
                    <span className="hidden sm:inline">إرسال</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 font-bold bg-gray-50/50">
              <MessageSquare size={64} className="mb-4 text-gray-300 animate-bounce" />
              <h3 className="text-xl font-black text-gray-600 mb-1">اختر تذكرة أو شكوى للبدء</h3>
              <p className="text-sm text-gray-500 max-w-md">
                قم باختيار إحدى التذاكر من القائمة الجانبية لعرض تفاصيل المحادثة والرد مباشرة على استفسارات وشكاوى عملائك.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
