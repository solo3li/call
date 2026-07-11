import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Paperclip, Mic, Send, File as FileIcon, Image as ImageIcon, Video, Check, Trash2, Reply, ArrowLeft, Plus, Tag, AlertCircle, Clock } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import api, { getBaseUrl } from '../utils/api';

const API_BASE_URL = getBaseUrl();

interface Message {
  id: string;
  sender: string;
  text: string;
  messageType: string;
  attachmentUrl?: string;
  attachmentName?: string;
  replyToMessageId?: string;
  createdAt: string;
}

interface TicketSummary {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
}

export default function HelpDeskPage() {

  const [activeView, setActiveView] = useState<'lobby' | 'create' | 'chat'>('lobby');
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [activeTicketTitle, setActiveTicketTitle] = useState<string>('');
  const [activeTicketStatus, setActiveTicketStatus] = useState<string>('Open');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(typeof window !== 'undefined' ? !!localStorage.getItem('token') : false);

  // Create Ticket Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Media states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [replyToMsg, setReplyToMsg] = useState<Message | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);
  
  // Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoggedIn && hubConnectionRef.current) {
      hubConnectionRef.current.stop();
      hubConnectionRef.current = null;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const fetchTickets = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get('/Support/Tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  useEffect(() => {
    if (activeView === 'lobby' && isLoggedIn) {
      fetchTickets();
    }
  }, [activeView, isLoggedIn]);

  useEffect(() => {
    let isMounted = true;

    if (activeView === 'chat' && ticketId && isLoggedIn) {
      const initChat = async () => {
        try {
          const res = await api.get(`/Support/Ticket/${ticketId}`);
          if (!isMounted) return;
          
          setMessages(res.data.messages);
          setActiveTicketTitle(res.data.title);
          setActiveTicketStatus(res.data.status);

          if (!hubConnectionRef.current) {
            const connection = new signalR.HubConnectionBuilder()
              .withUrl(`${API_BASE_URL}/supportHub`, {
                accessTokenFactory: () => localStorage.getItem('token') || '',
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
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
            } catch (err: any) {
              if (isMounted && err.name !== 'AbortError') {
                console.error("SignalR Connection Error:", err);
              }
              return;
            }
          }

          const connection = hubConnectionRef.current;
          if (connection.state === signalR.HubConnectionState.Connected) {
            await connection.invoke("JoinTicketGroup", ticketId);
            
            connection.off("ReceiveMessage");
            connection.on("ReceiveMessage", (message: Message) => {
              if (!isMounted) return;
              setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
              });
            });
          }
        } catch (error) {
          if (isMounted) {
            console.error("Failed to initialize support chat:", error);
          }
        }
      };
      initChat();
    }

    return () => {
      isMounted = false;
      // We don't necessarily want to stop the global connection here 
      // if we want to keep it alive for the next time they open chat,
      // but we should at least leave the group if we are unmounting.
    };
  }, [activeView, ticketId]);

  // Cleanup connection on unmount
  useEffect(() => {
    return () => {
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
        hubConnectionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecording, selectedFile, audioBlob]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.post('/Support/Ticket', {
        title: newTitle,
        category: newCategory,
        priority: newPriority,
        initialMessage: newInitialMsg
      });

      setNewTitle('');
      setNewCategory('General');
      setNewPriority('Medium');
      setNewInitialMsg('');
      setIsCreating(false);

      setTicketId(res.data.id);
      setActiveView('chat');
    } catch (err) {
      console.error("Failed to create ticket", err);
      setIsCreating(false);
    }
  };

  const handleBackToLobby = async () => {
    if (hubConnectionRef.current && ticketId) {
      try {
        await hubConnectionRef.current.invoke("LeaveTicketGroup", ticketId);
      } catch (err) { console.error(err); }
    }
    setTicketId(null);
    setActiveView('lobby');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearMedia = () => {
    setSelectedFile(null);
    setAudioBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsRecording(true);
      clearMedia();
      setRecordTime(0);
      timerIntervalRef.current = setInterval(() => setRecordTime(prev => prev + 1), 1000);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      drawVisualizer();
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access required.");
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    animationIdRef.current = requestAnimationFrame(drawVisualizer);
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      canvasCtx.fillStyle = '#3b82f6';
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  const stopRecording = (save: boolean) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    cancelAnimationFrame(animationIdRef.current);
    if (audioContextRef.current) audioContextRef.current.close();

    setIsRecording(false);

    if (save && mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || (!inputText.trim() && !selectedFile && !audioBlob)) return;

    const formData = new FormData();
    formData.append('ticketId', ticketId);
    formData.append('text', inputText);
    
    if (replyToMsg) {
      formData.append('replyToMessageId', replyToMsg.id);
    }

    if (selectedFile) {
      formData.append('attachment', selectedFile);
      if (selectedFile.type.startsWith('image/')) formData.append('messageType', 'Image');
      else if (selectedFile.type.startsWith('video/')) formData.append('messageType', 'Video');
      else formData.append('messageType', 'File');
    } else if (audioBlob) {
      formData.append('attachment', audioBlob, 'voice.webm');
      formData.append('messageType', 'Audio');
    } else {
      formData.append('messageType', 'Text');
    }

    try {
      setInputText('');
      clearMedia();
      setReplyToMsg(null);
      await api.post('/Support/SendMessage', formData);
    } catch (err) {
      console.error("Failed to send", err);
    }
  };

  const renderMessage = (msg: Message) => {
    const isMe = msg.sender === "Customer";
    const replyTarget = msg.replyToMessageId ? messages.find(m => m.id === msg.replyToMessageId) : null;
    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div key={msg.id} className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-semibold uppercase text-carbon-text mb-1 px-1 tracking-wider">{msg.sender} • {timeStr}</span>
        
        {replyTarget && (
          <div className={`mb-1 p-2 rounded-none border border-carbon-border text-[10px] font-medium bg-white/50 ${isMe ? 'mr-2' : 'ml-2'}`}>
            <div className="text-carbon-textSecondary uppercase">Replying to {replyTarget.sender}</div>
            <div className="truncate max-w-[200px] opacity-70">{replyTarget.text || replyTarget.messageType}</div>
          </div>
        )}

        <div className={`relative group p-3 rounded-none-none max-w-[85%] border border-carbon-border  ${isMe ? 'bg-carbon-blue text-carbon-text' : 'bg-white text-carbon-text'}`}>
          {msg.messageType === 'Text' && <span className="whitespace-pre-wrap font-medium">{msg.text}</span>}
          {msg.messageType === 'Image' && (
            <div>
              <img src={msg.attachmentUrl} alt="attachment" className="rounded-none border border-carbon-border mb-2 max-h-48 object-cover " />
              {msg.text && <div className="font-medium">{msg.text}</div>}
            </div>
          )}
          {msg.messageType === 'Video' && (
            <div>
              <video src={msg.attachmentUrl} controls className="rounded-none border border-carbon-border mb-2 max-h-48 w-full " />
              {msg.text && <div className="font-medium">{msg.text}</div>}
            </div>
          )}
          {msg.messageType === 'Audio' && (
            <div className="flex items-center gap-2">
              <Mic size={20} strokeWidth={3} className="text-carbon-text" />
              <audio src={msg.attachmentUrl} controls className="h-8" />
            </div>
          )}
          {msg.messageType === 'File' && (
            <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-carbon-layerHover p-2 rounded-none border border-carbon-border hover: transition ">
              <FileIcon size={24} strokeWidth={3} />
              <span className="truncate max-w-[150px] underline font-semibold">{msg.attachmentName}</span>
            </a>
          )}
          
          <button 
            aria-label="Reply to this message"
            onClick={() => setReplyToMsg(msg)}
            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-none bg-white border border-carbon-border  hover: text-carbon-text ${isMe ? '-left-10' : '-right-10'}`}
          >
            <Reply size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) return null;

  return (
    <div className="space-y-6 animate-fade-in h-[85vh] flex flex-col">
      <div className="bg-carbon-layer border border-carbon-border bg-carbon-layer border-b border-carbon-border p-3 flex flex-row items-center justify-between ">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-white" size={20} />
          <h1 className="text-lg font-semibold text-white">الدعم الفني للمنصة</h1>
        </div>
      </div>
      
      <div className="bg-carbon-bg rounded-none-none  flex flex-col flex-1 overflow-hidden border border-carbon-border">
        {/* LOBBY VIEW */}
            {activeView === 'lobby' && (
              <>
                <div className="bg-carbon-layer border-b border-carbon-border text-carbon-text p-2 flex justify-between items-center border-b border-carbon-border z-10">
                  <div>
                    <h3 className="font-semibold text-sm " style={{ fontFamily: 'Cairo, sans-serif' }}>Support Tickets</h3>
                  </div>
                  <button
                    onClick={() => setActiveView('create')}
                    className="flex items-center gap-1 bg-carbon-blue text-carbon-text font-semibold text-[10px] px-2 py-1 border border-[#1A1A1A] shadow-sm hover:shadow-none transition-all uppercase"
                  >
                    <Plus size={12} strokeWidth={3} /> New Ticket
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                  {tickets.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 p-4">
                      <MessageCircle size={32} strokeWidth={2} className="mb-1" />
                      <p className="font-semibold text-[10px]">No support tickets found.</p>
                    </div>
                  ) : (
                    tickets.map(ticket => {
                      const dateStr = new Date(ticket.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => { setTicketId(ticket.id); setActiveView('chat'); }}
                          className="bg-white border border-carbon-border p-2 shadow-sm hover:bg-carbon-layerHover transition-all cursor-pointer flex flex-col gap-1"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-semibold text-[10px] text-carbon-text line-clamp-1">{ticket.title}</h4>
                            <span className={`text-[8px] font-semibold uppercase px-1 border border-[#1A1A1A] ${ticket.status === 'Open' ? 'bg-carbon-blue text-carbon-text' : 'bg-[#1A1A1A] text-white'}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-[9px] font-medium text-carbon-text line-clamp-1 bg-carbon-bg p-1 border border-[#1A1A1A]/20">
                            {ticket.lastMessage}
                          </p>
                          <div className="flex justify-between items-center text-[8px] font-semibold text-carbon-text pt-1 border-t border-[#1A1A1A]/10">
                            <span className="flex items-center gap-1"><Clock size={10} /> {dateStr}</span>
                            <span className="text-carbon-textSecondary">
                              {ticket.messageCount} {ticket.messageCount === 1 ? 'Message' : 'Messages'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* CREATE TICKET VIEW */}
            {activeView === 'create' && (
              <>
                <div className="bg-carbon-blue text-carbon-text p-4 flex justify-between items-center border-b border-carbon-border z-10">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveView('lobby')} className="p-1 hover:bg-[#1A1A1A]/10 rounded-none transition">
                      <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <div>
                      <h3 className="font-semibold text-xl " style={{ fontFamily: 'Cairo, sans-serif' }}>New Ticket</h3>
                      <p className="text-xs font-medium">Provide details for your support request.</p>
                    </div>
                  </div>

                </div>

                <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs uppercase text-carbon-text flex items-center gap-1">
                      <Tag size={14} /> Ticket Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. Kitchen KDS Printer Not Syncing"
                      className="bg-carbon-bg border border-carbon-border rounded-none-none px-3 py-2 text-sm font-medium  outline-none focus: transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs uppercase text-carbon-text flex items-center gap-1">
                      <AlertCircle size={14} /> Category / Department
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="bg-carbon-bg border border-carbon-border rounded-none-none px-3 py-2 text-sm font-medium  outline-none focus: transition-all"
                    >
                      <option value="General">General Inquiry</option>
                      <option value="Technical">Technical Support</option>
                      <option value="Hardware / Printers">Hardware & Printers</option>
                      <option value="Billing">Billing & Subscriptions</option>
                      <option value="Menu / Orders">Menu & Orders Management</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs uppercase text-carbon-text flex items-center gap-1">
                      <AlertCircle size={14} /> Priority Level
                    </label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value)}
                      className="bg-carbon-bg border border-carbon-border rounded-none-none px-3 py-2 text-sm font-medium  outline-none focus: transition-all"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent / Critical</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <label className="font-semibold text-xs uppercase text-carbon-text">Initial Message / Description</label>
                    <textarea
                      value={newInitialMsg}
                      onChange={e => setNewInitialMsg(e.target.value)}
                      placeholder="Describe the issue in detail to help our technical team assist you faster..."
                      className="bg-carbon-bg border border-carbon-border rounded-none-none px-3 py-2 text-sm font-medium  outline-none focus: transition-all flex-1 resize-none min-h-[120px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-carbon-border/10 mt-auto">
                    <button
                      type="button"
                      onClick={() => setActiveView('lobby')}
                      className="px-4 py-2 bg-carbon-bg text-carbon-text font-semibold text-xs uppercase rounded-none-none border border-carbon-border  hover: transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-6 py-2 bg-carbon-layer border-b border-carbon-border text-carbon-text font-semibold text-xs uppercase rounded-none-none border border-carbon-border  hover: disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                      {isCreating ? 'Creating...' : 'Submit Ticket'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* CHAT VIEW */}
            {activeView === 'chat' && (
              <>
                <div className="bg-carbon-layer border-b border-carbon-border text-carbon-text p-2 flex justify-between items-center border-b border-carbon-border z-10">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <button onClick={handleBackToLobby} className="p-1 hover:bg-[#1A1A1A]/10 rounded-none transition flex-shrink-0">
                      <ArrowLeft size={16} strokeWidth={3} />
                    </button>
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-xs  truncate w-60" title={activeTicketTitle}>
                        {activeTicketTitle || 'Support Chat'}
                      </h3>
                      <p className="text-[9px] font-medium flex items-center gap-1 mt-0.5">
                        Status: <span className={`px-1 rounded-none text-[8px] font-semibold uppercase border border-[#1A1A1A] ${activeTicketStatus === 'Open' ? 'bg-carbon-blue text-carbon-text' : 'bg-[#1A1A1A] text-white'}`}>{activeTicketStatus}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {!ticketId ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-10 h-10 border border-carbon-border border-b-[#FF6B35] rounded-none-none animate-spin"></div>
                    </div>
                  ) : (
                    messages.map(renderMessage)
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <AnimatePresence>
                  {replyToMsg && (
                    <div className="bg-carbon-layerHover px-4 py-2 border-t border-carbon-border flex justify-between items-center overflow-hidden">
                      <div className="flex flex-col border border-carbon-border bg-white/20 p-1 rounded-none pl-2">
                        <span className="text-[10px] font-semibold uppercase text-carbon-text">Replying to {replyToMsg.sender}</span>
                        <span className="text-xs font-medium text-carbon-text truncate w-64">{replyToMsg.text || replyToMsg.messageType}</span>
                      </div>
                      <button onClick={() => setReplyToMsg(null)} className="p-1 hover:bg-[#1A1A1A]/10 rounded-none transition"><X size={16} strokeWidth={3}/></button>
                    </div>
                  )}
                  {selectedFile && (
                    <div className="bg-carbon-layerHover px-4 py-2 border-t border-carbon-border flex justify-between items-center overflow-hidden">
                      <div className="flex items-center gap-2">
                        {selectedFile.type.startsWith('image/') ? <ImageIcon size={20} className="text-carbon-text" /> : selectedFile.type.startsWith('video/') ? <Video size={20} className="text-carbon-text" /> : <FileIcon size={20} className="text-carbon-text" />}
                        <span className="text-sm font-semibold truncate w-48">{selectedFile.name}</span>
                      </div>
                      <button onClick={clearMedia} className="p-1 hover:bg-[#1A1A1A]/10 rounded-none transition"><X size={16} strokeWidth={3}/></button>
                    </div>
                  )}
                  {audioBlob && (
                    <div className="bg-carbon-layer border-b border-carbon-border px-4 py-2 border-t border-carbon-border flex justify-between items-center overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#1A1A1A] text-white p-1 rounded-none-none"><Mic size={16} /></div>
                        <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 w-48" />
                      </div>
                      <button onClick={clearMedia} className="p-1 hover:bg-[#1A1A1A]/10 rounded-none transition"><X size={16} strokeWidth={3}/></button>
                    </div>
                  )}
                </AnimatePresence>

                <div className="bg-white p-2 border-t border-carbon-border relative">
                  {isRecording ? (
                    <div className="flex items-center justify-between w-full h-8 bg-carbon-bg border border-carbon-border px-1 shadow-sm">
                      <button 
                        aria-label="Discard recording"
                        onClick={() => stopRecording(false)} 
                        className="p-1 text-carbon-text hover:bg-red-500 hover:text-white transition"
                      >
                        <Trash2 size={14} strokeWidth={3} />
                      </button>
                      <div className="flex-1 h-full py-1 relative">
                         <canvas ref={canvasRef} width="200" height="20" className="w-full h-full"></canvas>
                      </div>
                      <span className="text-carbon-text font-semibold font-mono text-[10px] px-1 w-10 text-center">00:{recordTime.toString().padStart(2, '0')}</span>
                      <button 
                        aria-label="Save recording"
                        onClick={() => stopRecording(true)} 
                        className="p-1 bg-carbon-blue text-carbon-text border border-carbon-border shadow-sm transition"
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={sendMessage} className="flex items-end gap-1">
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

                      <div className="flex gap-1">
                        <button 
                          type="button" 
                          aria-label="Attach file"
                          onClick={() => fileInputRef.current?.click()} 
                          className="p-1 text-carbon-text bg-carbon-layerHover border border-carbon-border shadow-sm transition flex-shrink-0"
                        >
                          <Paperclip size={14} strokeWidth={3} />
                        </button>

                        <button 
                          type="button" 
                          aria-label="Record voice"
                          onClick={startRecording} 
                          className="p-1 text-carbon-text bg-carbon-layer border-b border-carbon-border border border-carbon-border shadow-sm transition flex-shrink-0"
                        >
                          <Mic size={14} strokeWidth={3} />
                        </button>
                      </div>

                      <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                        placeholder="Type..."
                        className="flex-1 max-h-24 min-h-[32px] bg-white border border-carbon-border px-2 py-1 text-[10px] font-medium shadow-sm outline-none resize-none"
                        rows={1}
                      />

                      <button 
                        type="submit" 
                        aria-label="Send message"
                        disabled={!inputText.trim() && !selectedFile && !audioBlob} 
                        className="p-1 bg-carbon-layer border-b border-carbon-border text-carbon-text border border-carbon-border shadow-sm disabled:opacity-50 transition-all flex-shrink-0"
                      >
                        <Send size={14} strokeWidth={3} className="translate-x-[-1px] translate-y-[1px]" />
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
      </div>
    </div>
  );
};