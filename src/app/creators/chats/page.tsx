'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import VoicePlayer from '@/components/VoicePlayer';

interface ConversationInfo {
  id: string;
  conversationId: string;
  follower: string;
  email: string;
  avatar: string;
  time: string;
  shortDate: string;
  scheduledDate: string;
  meetingUrl?: string | null;
  isLocked: boolean;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'creator' | 'user';
  content: string;
  read?: boolean;
  createdAt: string;
}

const getMonday = (d: Date) => {
  const dateCopy = new Date(d);
  const day = dateCopy.getDay();
  const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(dateCopy.setDate(diff));
};

const getWeekDays = (baseDate: Date) => {
  const startOfWeek = getMonday(baseDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(startOfWeek);
    nextDay.setDate(startOfWeek.getDate() + i);
    days.push(nextDay);
  }
  return days;
};

const formatMsgTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes}${ampm}`;
};

export default function ChatsPage() {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingCancelledRef = useRef<boolean>(false);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [isLockingLoading, setIsLockingLoading] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const weekDays = getWeekDays(baseDate);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch creator data
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setDisplayName(data.creatorProfile?.displayName || data.user?.name || '');
          setProfilePhoto(data.creatorProfile?.profilePhoto || null);
          setCreatorId(data.user?.id || null);
        }
      })
      .catch(err => console.error('Error fetching user data:', err));
  }, []);

  // Fetch conversations
  const fetchConversations = async (date: Date) => {
    try {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const res = await fetch(`/api/conversations?date=${formattedDate}`);
      if (res.ok) {
        const data = await res.json();
        const list: ConversationInfo[] = (data.conversations || []).sort(
          (a: ConversationInfo, b: ConversationInfo) => {
            const hasMsgA = !!a.lastMessageTime;
            const hasMsgB = !!b.lastMessageTime;
            if (hasMsgA && !hasMsgB) return -1;
            if (!hasMsgA && hasMsgB) return 1;
            if (hasMsgA && hasMsgB) {
              return new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime();
            }
            return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
          }
        );
        setConversations(list);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Re-fetch when selected date changes
  useEffect(() => {
    setLoadingConversations(true);
    fetchConversations(selectedDate);
    setActiveChat(null);
  }, [selectedDate]);

  // Poll every 5 seconds
  useEffect(() => {
    const id = setInterval(() => fetchConversations(selectedDate), 5000);
    return () => clearInterval(id);
  }, [selectedDate]);

  // WebSocket + message history
  useEffect(() => {
    setIsOtherUserOnline(false);
    const currentConv = conversations.find(c => c.id === activeChat);
    setIsChatLocked(currentConv?.isLocked ?? false);

    if (!activeChat) {
      setMessages([]);
      return;
    }

    setConversations(prev =>
      prev.map(c => (c.id === activeChat ? { ...c, unreadCount: 0 } : c))
    );

    setLoadingMessages(true);
    fetch(`/api/conversations/messages?conversationId=${activeChat}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessages(data.messages || []);
      })
      .catch(err => console.error('Error fetching messages:', err))
      .finally(() => setLoadingMessages(false));

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001';
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', conversationId: activeChat, senderRole: 'creator' }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          if (data.message.conversationId === activeChat) {
            setMessages(prev => {
              if (prev.some(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          }
          setConversations(prev =>
            prev
              .map(c =>
                c.id === data.message.conversationId
                  ? { ...c, lastMessage: data.message.content, lastMessageTime: data.message.createdAt }
                  : c
              )
              .sort((a, b) => {
                const hasMsgA = !!a.lastMessageTime;
                const hasMsgB = !!b.lastMessageTime;
                if (hasMsgA && !hasMsgB) return -1;
                if (!hasMsgA && hasMsgB) return 1;
                if (hasMsgA && hasMsgB)
                  return new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime();
                return 0;
              })
          );
        } else if (data.type === 'presence' && data.conversationId === activeChat) {
          setIsOtherUserOnline(data.count > 1);
        } else if (data.type === 'typing' && data.conversationId === activeChat) {
          setIsOtherUserTyping(data.isTyping);
        } else if (data.type === 'read_receipt' && data.conversationId === activeChat) {
          setMessages(prev => prev.map(m => ({ ...m, read: true })));
        } else if (data.type === 'lock_status' && data.conversationId === activeChat) {
          setIsChatLocked(data.isLocked);
          setConversations(prev =>
            prev.map(c => (c.id === data.conversationId ? { ...c, isLocked: data.isLocked } : c))
          );
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onclose = () => console.log('WebSocket disconnected');
    return () => socket.close();
  }, [activeChat]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat || !creatorId) return;

    // Immediately stop typing status when message is sent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStatus(false);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        conversationId: activeChat,
        senderId: creatorId,
        senderRole: 'creator',
        content: message.trim(),
      }));
      setMessage('');
    }
  };

  const sendTypingStatus = (typingState: boolean) => {
    if (!activeChat || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (lastTypingSentRef.current === typingState) return;

    wsRef.current.send(JSON.stringify({
      type: 'typing',
      conversationId: activeChat,
      senderRole: 'creator',
      isTyping: typingState
    }));
    lastTypingSentRef.current = typingState;
  };

  const handleInputChange = (val: string) => {
    setMessage(val);
    if (!activeChat) return;

    // Send typing: true immediately on first keystroke
    sendTypingStatus(true);

    // Debounce the typing: false status by 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  };

  // Clean up typing timeouts on unmount or active chat switch
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      lastTypingSentRef.current = false;
    };
  }, [activeChat]);

  // Audio voice recording helper functions
  const startRecording = async () => {
    try {
      isRecordingCancelledRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (isRecordingCancelledRef.current) {
          console.log('Recording cancelled, skipping upload');
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-note.webm');

        try {
          const res = await fetch('/api/conversations/upload-voice', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'message',
                conversationId: activeChat,
                senderId: creatorId,
                senderRole: 'creator',
                content: data.url,
              }));
            }
          }
        } catch (uploadErr) {
          console.error('Voice upload failed:', uploadErr);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting audio record:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isRecordingCancelledRef.current = true;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      audioChunksRef.current = [];
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isAudioMsg = (content: string) => {
    return content.startsWith('http') && (content.includes('.webm') || content.includes('.mp3') || content.includes('.ogg') || content.includes('voice-notes'));
  };

  const handleLockToggleClick = () => {
    if (isChatLocked) handleLockAction(false);
    else setShowLockModal(true);
  };

  const handleLockAction = async (lockState: boolean) => {
    if (!activeChat) return;
    setIsLockingLoading(true);
    try {
      const res = await fetch('/api/conversations/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeChat, isLocked: lockState }),
      });
      if (res.ok) {
        setIsChatLocked(lockState);
        setConversations(prev =>
          prev.map(c => (c.id === activeChat ? { ...c, isLocked: lockState } : c))
        );
        wsRef.current?.send(JSON.stringify({ type: 'lock_status', conversationId: activeChat, isLocked: lockState }));
      }
    } catch (err) {
      console.error('Error locking/unlocking conversation:', err);
    } finally {
      setIsLockingLoading(false);
      setShowLockModal(false);
    }
  };

  const handlePrevWeek = () => {
    const prev = new Date(baseDate);
    prev.setDate(baseDate.getDate() - 7);
    setBaseDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(baseDate);
    next.setDate(baseDate.getDate() + 7);
    setBaseDate(next);
  };

  const activeConv = conversations.find(c => c.id === activeChat);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F8F8FA] overflow-hidden">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 lg:py-6 flex flex-col min-h-0">
        <h1
          className="font-normal text-[34px] leading-[34px] tracking-[0] text-black mb-3 lg:mb-5 shrink-0"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          Chats
        </h1>

        <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0 mb-0 lg:mb-6 h-[calc(100dvh-120px)] lg:h-full">

          {/* Left Sidebar */}
          <div className={`w-full lg:w-[380px] bg-white rounded-[24px] p-4 flex flex-col gap-4 h-full lg:h-full shrink-0 overflow-hidden shadow-sm border border-gray-100 ${activeChat ? 'hidden lg:flex' : 'flex'}`}>

            {/* Date Picker Ribbon */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between shrink-0">
              <button onClick={handlePrevWeek} className="text-gray-400 hover:text-black">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="flex gap-4 text-center overflow-hidden">
                {weekDays.map((day) => {
                  const isSelected =
                    day.getDate() === selectedDate.getDate() &&
                    day.getMonth() === selectedDate.getMonth() &&
                    day.getFullYear() === selectedDate.getFullYear();
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`flex flex-col items-center cursor-pointer px-2 py-1 rounded-lg transition-colors ${isSelected ? 'bg-[#EEF0FF] text-[#0012FF] font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                      <span className="text-[10px] font-medium">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {String(day.getDate()).padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleNextWeek} className="text-gray-400 hover:text-black">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0012FF]"></div>
                </div>
              ) : conversations.length > 0 ? (
                [...conversations]
                  .map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`rounded-2xl p-4 cursor-pointer transition-all border ${activeChat === chat.id ? 'border-[#0012FF]/20 shadow-md bg-white ring-1 ring-[#0012FF]/5' : 'border-gray-100 hover:border-gray-200 bg-white shadow-xs'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              <img src={chat.avatar} alt={chat.follower} className="object-cover w-full h-full" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#12B76A] border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{chat.follower}</h4>
                            {chat.lastMessage && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {isAudioMsg(chat.lastMessage) ? '🎤 Voice message' : chat.lastMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {chat.lastMessageTime ? formatMsgTime(chat.lastMessageTime) : chat.time}
                          </span>
                          {chat.unreadCount > 0 && chat.id !== activeChat && (
                            <span className="w-5 h-5 bg-[#0012FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium mt-3 border-t border-gray-50 pt-3">
                        <div className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          <span>{chat.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {chat.meetingUrl ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                              <span>In-person</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-gray-400">No conversations scheduled.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Main Chat Area */}
          <div className={`flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full min-h-0 ${activeChat ? 'flex' : 'hidden lg:flex'}`}>
            {activeConv ? (
              <>
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="lg:hidden p-1 mr-1 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                      </svg>
                    </button>

                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        <img src={activeConv.avatar} alt={activeConv.follower} className="object-cover w-full h-full" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#12B76A] border-3 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{activeConv.follower}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${isOtherUserOnline ? 'bg-[#12B76A]' : 'bg-gray-400'}`}></span>
                        <span className="text-xs text-gray-400 font-medium">
                          {isOtherUserOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-gray-400">
                    <button
                      onClick={handleLockToggleClick}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isChatLocked ? 'bg-[#EEF0FF] text-[#0012FF]' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                      title={isChatLocked ? 'Unlock Chat' : 'Lock Chat'}
                    >
                      {isChatLocked ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="16" r="1" /><rect width="18" height="12" x="3" y="10" rx="2" /><path d="M7 10V7a5 5 0 1 1 10 0v3" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="16" r="1" /><rect width="18" height="12" x="3" y="10" rx="2" /><path d="M7 10V7a5 5 0 0 1 9.9-1" />
                        </svg>
                      )}
                    </button>
                    <button className="hover:text-gray-600 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </button>
                    <button className="hover:text-gray-600 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                    </button>
                  </div>
                </div>

                {/* Conditional Chat View */}
                {(isChatLocked && messages.length === 0 && !loadingMessages) ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FAFAFA]">
                    <div className="mb-6 mt-4 w-[240px] h-[180px] relative">
                      <Image src="/assets/lock-chat.png" alt="Lock Chat" fill className="object-contain" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">This Chat is Locked</h3>
                    <p className="text-sm text-gray-400 max-w-[320px] mb-6">
                      Unlock this chat to start or resume your conversation with the client.
                    </p>
                    <button
                      onClick={() => handleLockAction(false)}
                      disabled={isLockingLoading}
                      className="bg-[#0012FF] hover:bg-[#0010d0] text-white font-semibold py-3.5 px-8 rounded-full shadow-lg shadow-[#0012FF]/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {isLockingLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                      <span>Unlock Chat</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 bg-[#FAFAFA]">
                      <div className="relative flex items-center justify-center py-4 shrink-0">
                        <div className="absolute inset-x-0 h-px bg-gray-200/60"></div>
                        <span className="relative bg-[#FAFAFA] px-4 text-[11px] font-medium text-gray-400">
                          {activeConv.shortDate}
                        </span>
                      </div>

                      {loadingMessages ? (
                        <div className="flex-grow flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0012FF]"></div>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((msg) => {
                          const isMe = msg.senderRole === 'creator';
                          const isAudio = isAudioMsg(msg.content);
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 w-full`}>
                              <div className={`flex gap-3 max-w-[85%] items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0 mb-1">
                                  <img src={isMe ? (profilePhoto || '/avatar.png') : activeConv.avatar} alt="Avatar" className="object-cover w-full h-full" />
                                </div>
                                {isAudio ? (
                                  <VoicePlayer
                                    url={msg.content}
                                    isMe={isMe}
                                    timeStr={formatMsgTime(msg.createdAt)}
                                    readStatus={
                                      msg.read ? (
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0057ff" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /><path d="M22 5l-7.5 7.5" /></svg>
                                      ) : isOtherUserOnline ? (
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /><path d="M22 5l-7.5 7.5" /></svg>
                                      ) : (
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /></svg>
                                      )
                                    }
                                  />
                                ) : (
                                  <div className={`${isMe ? 'bg-[#E6E8FF] text-gray-800' : 'bg-white border border-gray-100 text-gray-800'} text-[13px] pt-3 pb-2 px-4 rounded-[20px] ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} shadow-xs leading-relaxed break-all min-w-[80px]`}>
                                    <span>{msg.content}</span>
                                    <span className="float-right mt-3 ml-2.5 text-[10px] text-gray-400 font-medium inline-flex items-center gap-1 select-none shrink-0 translate-y-[2px]">
                                      {formatMsgTime(msg.createdAt)}
                                      {isMe && (
                                        <span className="inline-flex shrink-0">
                                          {msg.read ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0057ff" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /><path d="M22 5l-7.5 7.5" /></svg>
                                          ) : isOtherUserOnline ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /><path d="M22 5l-7.5 7.5" /></svg>
                                          ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /></svg>
                                          )}
                                        </span>
                                      )}
                                    </span>
                                    <div className="clear-both"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400">
                          <p className="text-sm">No messages yet. Send a message to start the conversation!</p>
                        </div>
                      )}

                      {/* Real-time Typing Indicator Bubble */}
                      {isOtherUserTyping && (
                        <div className="flex items-end gap-3 max-w-[85%] self-start animate-fade-in select-none">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0 mb-1">
                            <img src={activeConv.avatar} alt="Avatar" className="object-cover w-full h-full" />
                          </div>
                          <div className="bg-white border border-gray-100 py-3.5 px-5 rounded-[20px] rounded-bl-sm shadow-xs flex items-center gap-1.5 min-w-[70px]">
                            <span className="w-1.5 h-1.5 bg-[#0012FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-[#0012FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-[#0012FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area or Locked input notification */}
                    {isChatLocked ? (
                      <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center text-sm text-gray-400 font-medium select-none shrink-0 gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        <span>This chat is locked. Click the lock icon in the header to unlock.</span>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 bg-white border-t border-gray-100 shrink-0">
                        <div className="flex items-center gap-3">
                          {isRecording ? (
                            <div className="flex-1 bg-red-50 border border-red-100 rounded-full py-3 px-6 flex items-center justify-between text-sm select-none animate-pulse">
                              <div className="flex items-center gap-2 text-red-600 font-semibold">
                                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
                                <span>Recording... ({formatTimer(recordingSeconds)})</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={cancelRecording}
                                  className="text-gray-400 hover:text-gray-600 font-semibold text-xs px-2"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={stopRecording}
                                  className="bg-red-600 hover:bg-red-700 text-white rounded-full py-1.5 px-4 text-xs font-bold shadow-md shadow-red-200"
                                >
                                  Send Voice
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={message}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type something..."
                                className="w-full bg-[#F3F4F6] border-0 rounded-full py-4 pl-6 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0012FF]/10 transition-all"
                              />
                              <button
                                onClick={startRecording}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Record Voice Note"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                              </button>
                            </div>
                          )}
                          {!isRecording && (
                            <button onClick={handleSendMessage} className="w-14 h-14 rounded-full bg-[#0012FF] hover:bg-[#0010d0] flex items-center justify-center text-white shrink-0 shadow-md transition-transform active:scale-95">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '-2px' }}>
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FAFAFA]">
                <Image
                  src="/assets/no-appointment.webp"
                  alt="Select Chat"
                  width={240}
                  height={240}
                  className="object-contain mb-4 opacity-80"
                />
                {conversations.length > 0 ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Select a Conversation</h3>
                    <p className="text-sm text-gray-400 max-w-[280px]">Choose a chat from the list on the left to start messaging.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No Bookings Today</h3>
                    <p className="text-sm text-gray-400 max-w-[280px]">There are no sessions booked for the selected date.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lock Confirmation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] transition-opacity">
          <div className="bg-white rounded-[32px] p-8 max-w-[420px] w-full mx-4 relative flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowLockModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div className="mb-6 mt-4 w-[200px] h-[150px] relative">
              <Image src="/assets/lock-chat.png" alt="Lock Chat" fill className="object-contain" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are You Sure?</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-[280px]">
              Are you sure you want to lock this chat? <br />
              You can unlock this anytime.
            </p>
            <button
              onClick={() => handleLockAction(true)}
              disabled={isLockingLoading}
              className="w-full bg-[#0012FF] hover:bg-[#0010d0] text-white font-semibold py-4 rounded-full shadow-lg shadow-[#0012FF]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLockingLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              <span>Lock Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
