'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import UserNavbar from '@/components/UserNavbar';
import VoicePlayer from '@/components/VoicePlayer';

interface ConversationInfo {
  id: string;
  conversationId: string;
  creator: string;
  username: string;
  session: string;
  shortDate: string;
  time: string;
  duration: string;
  price: string;
  image: string;
  meetingUrl?: string | null;
  isLocked: boolean;
  lastMessage: string;
  lastMessageTime: string | null;
  ref: string;
  unreadCount: number;
  scheduledDate: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'creator' | 'user';
  content: string;
  read: boolean;
  createdAt: string;
}

const formatMsgTime = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes}${ampm}`;
};

export default function UserChatsPage() {
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');

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
  const [userId, setUserId] = useState<string | null>(null);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user data
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setDisplayName(data.user.name || '');
          setProfilePhoto(data.user.profilePhoto || data.user.image || null);
          setUserId(data.user.id || null);
        }
      })
      .catch(err => console.error('Error fetching user data:', err));
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        const list: ConversationInfo[] = (data.conversations || []).map((c: any) => ({
          id: c.id,
          conversationId: c.conversationId,
          creator: c.creator || c.follower || 'Unknown',
          username: c.username || '',
          session: c.session || '',
          shortDate: c.shortDate || '',
          time: c.time || '',
          duration: c.duration || '',
          price: c.price || '',
          image: c.image || c.avatar || '/avatar.png',
          meetingUrl: c.meetingUrl || null,
          isLocked: c.isLocked,
          lastMessage: c.lastMessage || '',
          lastMessageTime: c.lastMessageTime || null,
          ref: c.ref || '',
          unreadCount: c.unreadCount || 0,
          scheduledDate: c.scheduledDate || '',
        })).sort((a: ConversationInfo, b: ConversationInfo) => {
          const hasMsgA = !!a.lastMessageTime;
          const hasMsgB = !!b.lastMessageTime;
          if (hasMsgA && !hasMsgB) return -1;
          if (!hasMsgA && hasMsgB) return 1;
          if (hasMsgA && hasMsgB) {
            return new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime();
          }
          return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
        });
        setConversations(list);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    const id = setInterval(fetchConversations, 5000);
    return () => clearInterval(id);
  }, []);

  // WebSocket + message history
  useEffect(() => {
    setIsOtherUserOnline(false);
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
      socket.send(JSON.stringify({ type: 'join', conversationId: activeChat, senderRole: 'user' }));
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
    if (!message.trim() || !activeChat || !userId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStatus(false);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        conversationId: activeChat,
        senderId: userId,
        senderRole: 'user',
        content: message.trim()
      }));
      setMessage('');
    } else {
      console.error('WebSocket server is offline.');
    }
  };

  const sendTypingStatus = (typingState: boolean) => {
    if (!activeChat || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (lastTypingSentRef.current === typingState) return;

    wsRef.current.send(JSON.stringify({
      type: 'typing',
      conversationId: activeChat,
      senderRole: 'user',
      isTyping: typingState
    }));
    lastTypingSentRef.current = typingState;
  };

  const handleInputChange = (val: string) => {
    setMessage(val);
    if (!activeChat) return;

    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  };

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
        // Upload to Supabase Storage bypass API
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
              // Send Supabase file link as chat message
              wsRef.current.send(JSON.stringify({
                type: 'message',
                conversationId: activeChat,
                senderId: userId,
                senderRole: 'user',
                content: data.url, // URL serves as message text for audio notes
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
      // Stop all tracks to release mic resources
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

  // Check if message is a voice note URL
  const isAudioMsg = (content: string) => {
    return content.startsWith('http') && (content.includes('.webm') || content.includes('.mp3') || content.includes('.ogg') || content.includes('voice-notes'));
  };

  const activeConv = conversations.find(c => c.id === activeChat);
  const isChatLocked = activeConv?.isLocked ?? false;

  const filteredConversations = conversations.filter(c =>
    c.creator.toLowerCase().includes(searchText.toLowerCase()) ||
    c.session.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F8F8FA] overflow-hidden">
      <div className="shrink-0">
        <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
      </div>

      <main className="flex-grow min-h-0 px-4 sm:px-6 lg:px-10 py-4 lg:py-6">
        <h1
          className="text-[34px] leading-[34px] font-normal tracking-[0] text-black mb-3 lg:mb-6 shrink-0"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          Chats
        </h1>

        <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0 mb-0 lg:mb-6 h-[calc(100dvh-120px)] lg:h-[calc(100dvh-180px)]">

          {/* Left Sidebar */}
          <div className={`w-full lg:w-[380px] bg-white rounded-[24px] p-4 flex flex-col gap-4 h-full lg:h-full shrink-0 overflow-hidden shadow-sm border border-gray-100 ${activeChat ? 'hidden lg:flex' : 'flex'}`}>

            {/* Search Box */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search"
                className="w-full bg-[#F3F4F6] border-0 rounded-full py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0012FF]/10 transition-all"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0012FF]"></div>
                </div>
              ) : filteredConversations.length > 0 ? (
                [...filteredConversations]
                  .sort((a, b) => {
                    const hasMsgA = !!a.lastMessageTime;
                    const hasMsgB = !!b.lastMessageTime;
                    if (hasMsgA && !hasMsgB) return -1;
                    if (!hasMsgA && hasMsgB) return 1;
                    if (hasMsgA && hasMsgB) {
                      return new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime();
                    }
                    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
                  })
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
                              <img src={chat.image} alt={chat.creator} className="object-cover w-full h-full" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#12B76A] border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="text-sm font-bold text-gray-900">{chat.creator}</h4>
                              <svg className="text-[#12B76A]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </div>

                            {chat.isLocked ? (
                              <span className="inline-flex items-center text-[10px] font-semibold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded mt-1">
                                Chat is locked
                              </span>
                            ) : chat.lastMessage ? (
                              <div className="flex items-center gap-1 mt-0.5">
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {isAudioMsg(chat.lastMessage) ? '🎤 Voice message' : chat.lastMessage}
                                </p>
                              </div>
                            ) : null}
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
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                              <span>In-person</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-gray-400">No chats found.</p>
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
                        <img src={activeConv.image} alt={activeConv.creator} className="object-cover w-full h-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="text-base font-bold text-gray-900">{activeConv.creator}</h3>
                        <svg className="text-[#12B76A]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">@{activeConv.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-gray-400">
                    <button className="hover:text-gray-600 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </button>
                    <button className="hover:text-gray-600 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                    </button>
                  </div>
                </div>

                {/* Conditional View: lock screen ONLY if empty */}
                {(isChatLocked && messages.length === 0 && !loadingMessages) ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FAFAFA]">
                    <div className="mb-6 mt-4 w-[240px] h-[180px] relative">
                      <Image src="/assets/lock-chat.png" alt="Lock Chat" fill className="object-contain" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Creator has locked this chat</h3>
                    <p className="text-sm text-gray-400 max-w-[340px] mb-6">
                      The creator has locked this chat. You'll be able to send messages once they unlock it. Please check back later.
                    </p>

                    {/* Booking Details */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 max-w-[360px] w-full text-left text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <svg className="text-[#0012FF]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>{activeConv.shortDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="text-[#0012FF]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>{activeConv.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="text-[#0012FF]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>{activeConv.duration}</span>
                      </div>
                    </div>
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
                          const isMe = msg.senderRole === 'user';
                          const isAudio = isAudioMsg(msg.content);
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 w-full`}>
                              <div className={`flex gap-3 max-w-[85%] items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0 mb-1">
                                  <img src={isMe ? (profilePhoto || '/avatar.png') : activeConv.image} alt="Avatar" className="object-cover w-full h-full" />
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
                            <img src={activeConv.image} alt="Avatar" className="object-cover w-full h-full" />
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

                    {/* Input Area / Recording Panel */}
                    {isChatLocked ? (
                      <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center text-sm text-gray-400 font-medium select-none shrink-0 gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        <span>You can't send a message unless creator unlocks this chat</span>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 bg-white border-t border-gray-100 shrink-0">
                        <div className="flex items-center gap-3">
                          {isRecording ? (
                            // Recording audio state banner
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
                            // Regular message input state
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
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-[#FAFAFA]">
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
    </div>
  );
}
