import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, AlertTriangle, Send, Paperclip, CheckCircle, Clock, Search, Filter, User, ArrowLeft, RefreshCw } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import api, { getBaseUrl } from '../utils/api';

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
 .withUrl(`${getBaseUrl()}/supportHub`, {
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
 <div className="bg-carbon-layer border-carbon-border bg-carbon-layer p-3 flex flex-row items-center justify-between ">
 <div className="flex items-center gap-3">
 <MessageSquare className="text-brand-purple" size={20} />
 <h1 className="text-lg font-semibold text-carbon-text">دعم العملاء والشكاوى</h1>
 </div>
 <button 
 onClick={fetchTickets}
 className="text-carbon-text flex items-center gap-1 text-xs font-medium px-3 py-1 shadow-sm"
 >
 <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> <span className="hidden sm:inline">تحديث</span>
 </button>
 </div>

 {/* Main Container */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[700px] max-h-[85vh]">
 {/* Tickets List */}
 <div className="lg:col-span-1 bg-carbon-layer border-carbon-border bg-bg-carbon-layer border-carbon-border p-2 flex flex-col gap-2 overflow-hidden h-full border-carbon-border">
 {/* Search & Filter Controls */}
 <div className="space-y-2">
 <div className="relative">
 <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-carbon-textSecondary" size={14} />
 <input
 type="text"
 placeholder="ابحث..."
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 className="w-full bg-carbon-layer border-carbon-border pr-8 pl-2 py-1 font-medium text-xs shadow-sm outline-none"
 />
 </div>

 <div className="flex gap-2">
 <div
 className="flex-1 py-1 px-2 font-semibold text-[10px] flex items-center justify-center gap-1 bg-carbon-error text-white shadow-sm"
 >
 <AlertTriangle size={12} /> شكاوى ({filteredTickets.length})
 </div>
 </div>
 </div>

 {/* Tickets Scroll View */}
 <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
 {loading && tickets.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-64 text-carbon-textSecondary font-medium animate-pulse">
 جاري تحميل التذاكر...
 </div>
 ) : filteredTickets.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-64 text-carbon-textSecondary font-medium text-center p-4">
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
 className={`p-2 border-carbon-border transition-all cursor-pointer flex flex-col gap-1 ${
 isSelected 
 ? 'bg-carbon-layer/30 shadow-sm translate-x-[-1px] translate-y-[-1px]' 
 : 'bg-carbon-layer hover:bg-carbon-bg shadow-sm'
 }`}
 >
 <div className="flex items-start justify-between gap-1">
 <div className="flex items-center gap-1 font-semibold text-[10px] text-carbon-text line-clamp-1">
 {ticket.isComplaint ? (
 <span className="bg-carbon-error text-white px-1 text-[9px]"></span>
 ) : (
 <span className="bg-carbon-blue/10 text-carbon-blue text-white px-1 text-[9px]">💬</span>
 )}
 <span className="truncate w-32">{ticket.title}</span>
 </div>
 <span className={`text-[8px] font-semibold uppercase px-1 shrink-0 border-carbon-border ${ticket.status === 'Open' ? 'bg-carbon-success/10 text-carbon-success text-white' : 'bg-carbon-layerHover text-carbon-textSecondary'}`}>
 {ticket.status === 'Open' ? 'مفتوح' : 'مغلق'}
 </span>
 </div>

 <div className="flex items-center gap-1 text-[9px] font-medium text-carbon-textSecondary">
 <User size={10} className="text-brand-purple" />
 <span className="truncate">{ticket.customerName || 'عميل'}</span>
 </div>

 <p className="text-[9px] font-medium text-carbon-textSecondary line-clamp-1 bg-carbon-bg p-1 border-carbon-border/50">
 {ticket.lastMessage}
 </p>

 <div className="flex items-center justify-between text-[8px] font-medium text-carbon-textSecondary pt-1 border-t border-carbon-border/10">
 <span className="flex items-center gap-1"><Clock size={10} /> {timeStr}</span>
 <span className="text-brand-purple">
 {ticket.messageCount} رسالة
 </span>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* Chat Interface */}
 <div className="lg:col-span-3 bg-carbon-layer border-carbon-border bg-bg-carbon-layer border-carbon-border flex flex-col overflow-hidden h-full border-carbon-border p-0">
 {selectedTicketId && activeTicket ? (
 <>
 {/* Chat Header */}
 <div className="bg-carbon-layerHover text-carbon-text text-white p-2 border-b-2 border-carbon-border flex items-center justify-between gap-2">
 <div className="flex items-center gap-2 overflow-hidden">
 <div className="w-8 h-8 bg-carbon-layer/10 border-white flex items-center justify-center shrink-0 font-medium text-xs">
 {activeTicket.customerName?.charAt(0) || 'ع'}
 </div>
 <div className="overflow-hidden">
 <h2 className="font-semibold text-sm truncate flex items-center gap-1">
 {activeTicket.title}
 {activeTicket.isComplaint && (
 <span className="bg-carbon-error text-white text-[9px] px-1 font-semibold border-white">
 شكوى 
 </span>
 )}
 </h2>
 <p className="text-[10px] font-medium text-white/80 truncate flex items-center gap-2 mt-0.5">
 <span>{activeTicket.customerName || 'عميل'}</span>
 {activeTicket.telegramChatId && (
 <span className="bg-carbon-blue/10 text-carbon-blue/30 px-1 border-white/20 text-[9px]">
 تليجرام 🤖
 </span>
 )}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase border-white ${activeTicket.status === 'Open' ? 'bg-carbon-success/10 text-carbon-success text-white' : 'bg-gray-600 text-white'}`}>
 {activeTicket.status === 'Open' ? 'مفتوح' : 'مغلق'}
 </span>
 </div>
 </div>

 {/* Messages Scroll Area */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-carbon-layerHover/40 custom-scrollbar">
 {messages.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-carbon-textSecondary font-medium">
 لا توجد رسائل في هذه التذكرة بعد.
 </div>
 ) : (
 messages.map(msg => {
 const isCustomer = msg.sender === 'Customer';
 const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 return (
 <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
 <span className="text-[10px] font-semibold text-carbon-textSecondary mb-1 px-1">
 {isCustomer ? (activeTicket.customerName || 'العميل') : 'إدارة المطعم'} • {timeStr}
 </span>
 <div className={`p-3 rounded-sm max-w-[80%] border-carbon-border ${
 isCustomer ? 'bg-carbon-layer text-carbon-text rounded-tr-none' : 'bg-carbon-layer text-carbon-text rounded-tl-none'
 }`}>
 {msg.messageType === 'Text' && <p className="whitespace-pre-wrap font-medium text-sm">{msg.text}</p>}
 {msg.messageType === 'Image' && (
 <div>
 <img src={msg.attachmentUrl} alt="المرفق" className="rounded-sm border-carbon-border mb-2 max-h-60 object-cover " />
 {msg.text && <p className="font-medium text-sm">{msg.text}</p>}
 </div>
 )}
 {msg.messageType === 'File' && (
 <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-carbon-layer p-2 rounded-sm border-carbon-border hover: transition">
 <Paperclip size={20} className="text-brand-purple shrink-0" />
 <span className="truncate underline font-medium text-sm">{msg.attachmentName}</span>
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
 <div className="bg-carbon-layerHover text-carbon-blueHover px-4 py-2 border-t-2 border-carbon-border flex items-center justify-between">
 <div className="flex items-center gap-2 font-medium text-xs text-carbon-text">
 <Paperclip size={16} />
 <span>المرفق: {selectedFile.name}</span>
 </div>
 <button onClick={() => setSelectedFile(null)} className="font-semibold text-carbon-error text-xs hover:underline">إلغاء المرفق</button>
 </div>
 )}

 {/* Message Input Form */}
 <div className="bg-carbon-layer p-2 border-t-2 border-carbon-border">
 <form onSubmit={handleSendMessage} className="flex items-end gap-2">
 <input type="file" ref={fileInputRef} className="hidden" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />

 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="p-2 text-carbon-text bg-carbon-layer border-carbon-border shadow-sm flex-shrink-0"
 title="إرفاق ملف"
 >
 <Paperclip size={16} />
 </button>

 <textarea
 value={inputText}
 onChange={e => setInputText(e.target.value)}
 onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
 placeholder="رد سريع..."
 className="flex-1 max-h-24 min-h-[36px] bg-carbon-bg border-carbon-border px-2 py-1 text-xs font-medium shadow-sm focus:bg-carbon-layer resize-none outline-none"
 rows={1}
 />

 <button
 type="submit"
 disabled={sending || (!inputText.trim() && !selectedFile)}
 className="p-2 px-4 bg-carbon-warning/10 text-carbon-warning text-white border-carbon-border shadow-sm disabled:opacity-50 flex-shrink-0 flex items-center gap-1 font-semibold text-xs"
 >
 {sending ? <span className="animate-spin text-[10px]"></span> : <Send size={14} className="rotate-180" />}
 </button>
 </form>
 </div>
 </>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-carbon-textSecondary font-medium bg-carbon-bg/50">
 <MessageSquare size={64} className="mb-4 text-carbon-textSecondary animate-bounce" />
 <h3 className="text-xl font-semibold text-carbon-textSecondary mb-1">اختر تذكرة أو شكوى للبدء</h3>
 <p className="text-sm text-carbon-textSecondary max-w-md">
 قم باختيار إحدى التذاكر من القائمة الجانبية لعرض تفاصيل المحادثة والرد مباشرة على استفسارات وشكاوى عملائك.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
