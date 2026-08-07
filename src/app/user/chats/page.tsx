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
  isArchivedByUser?: boolean;
  isOnline?: boolean;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'creator' | 'user';
  content: string;
  read: boolean;
  createdAt: string;
  attachment?: {
    url: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  };
  tempId?: string;
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

const formatMsgDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (msgDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Format scheduled time range e.g. "Sat at 03:00 PM to 05:00 PM"
const formatTimeRange = (scheduledDate: string, timeStr: string, durationStr: string): string => {
  if (!scheduledDate || !timeStr) return timeStr || '';
  try {
    const base = new Date(scheduledDate);
    const dayName = base.toLocaleDateString('en-US', { weekday: 'short' });
    // Parse the time string (e.g. "03:00 PM")
    const [timePart, meridiem] = timeStr.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    const startDate = new Date(base);
    startDate.setHours(h, m, 0, 0);
    const durMin = parseInt(durationStr || '0', 10);
    const endDate = new Date(startDate.getTime() + durMin * 60000);
    const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (durMin > 0) return `${dayName} at ${fmt(startDate)} to ${fmt(endDate)}`;
    return `${dayName} at ${fmt(startDate)}`;
  } catch {
    return timeStr;
  }
};

const parseEncodedAttachment = (msg: ChatMessage): ChatMessage => {
  if (msg.content && msg.content.includes('|||')) {
    const parts = msg.content.split('|||');
    if (parts.length >= 3) {
      try {
        const parsedAttachment = JSON.parse(parts[1]);
        return {
          ...msg,
          content: parts[0],
          attachment: msg.attachment || parsedAttachment
        };
      } catch (e) {
        // ignore parsing error
      }
    }
  }
  return msg;
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

  // Load cached conversations on mount
  useEffect(() => {
    try {
      const cachedConvs = sessionStorage.getItem('reachly_user_conversations_cache');
      if (cachedConvs) {
        setConversations(JSON.parse(cachedConvs));
        setLoadingConversations(false);
      }
    } catch (e) {}
  }, []);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Attachment states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const uploadAbortController = useRef<AbortController | null>(null);
  const sendingRef = useRef<boolean>(false);

  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isArchivingChat, setIsArchivingChat] = useState(false);

  // localStorage helpers — survive tab switches, remounts, and polls
  const LS_KEY = 'reachly_user_archived_chats';
  const getArchivedIds = (): Set<string> => {
    try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); } catch { return new Set(); }
  };
  const addArchivedId = (id: string) => {
    const s = getArchivedIds(); s.add(id);
    localStorage.setItem(LS_KEY, JSON.stringify([...s]));
  };
  const removeArchivedId = (id: string) => {
    const s = getArchivedIds(); s.delete(id);
    localStorage.setItem(LS_KEY, JSON.stringify([...s]));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const cancelUpload = () => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
  };

  const retryUpload = () => {
    if (uploadFile) {
      startUpload(uploadFile);
    }
  };

  const clearUpload = () => {
    setUploadError(false);
    setUploadFile(null);
    setUploadProgress(0);
  };

  const handleFileInput = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startUpload = async (file: File) => {
    if (!file || !activeChat || !userId) return;

    setUploadFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(false);

    const abortController = new AbortController();
    uploadAbortController.current = abortController;

    try {
      const tokenRes = await fetch('/api/messages/upload/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        signal: abortController.signal
      });

      if (!tokenRes.ok) throw new Error('Failed to get upload token');
      const { signedUrl, publicUrl } = await tokenRes.json();

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      await new Promise((resolve, reject) => {
        xhr.open('PUT', signedUrl, true);

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.onabort = () => reject(new Error('Upload canceled'));
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);

        abortController.signal.addEventListener('abort', () => xhr.abort());
      });

      let msgType = 'document';
      if (file.type.startsWith('image/')) msgType = 'image';
      else if (file.type.startsWith('video/')) msgType = 'video';
      else if (file.type === 'application/pdf') msgType = 'pdf';

      const tempId = `temp-${Date.now()}`;
      const tempUrl = URL.createObjectURL(file);
      const optimisticMsg: ChatMessage = {
        id: tempId,
        tempId,
        conversationId: activeChat,
        senderId: userId,
        senderRole: 'user',
        content: `[Attached ${msgType}]`,
        createdAt: new Date().toISOString(),
        read: false,
        attachment: {
          url: tempUrl,
          fileType: msgType,
          fileName: file.name,
          fileSize: file.size
        }
      };
      setMessages(prev => [...prev, optimisticMsg]);
      scrollToBottom();

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const attachMeta = JSON.stringify({
          url: publicUrl,
          fileType: msgType,
          fileName: file.name,
          fileSize: file.size
        });
        wsRef.current.send(JSON.stringify({
          type: 'message',
          conversationId: activeChat,
          senderId: userId,
          senderRole: 'user',
          content: `[Attached ${msgType}]|||${attachMeta}|||`,
          tempId,
          attachment: {
            url: publicUrl,
            fileType: msgType,
            fileName: file.name,
            fileSize: file.size
          }
        }));
      }

      setUploadFile(null);
    } catch (err: any) {
      if (err.message === 'Upload canceled' || err.name === 'AbortError') {
        setUploadError(true);
      } else {
        console.error('File upload error:', err);
        setUploadError(true);
      }
      setMessages(prev => prev.filter(m => !m.tempId || !m.attachment?.url.startsWith('blob:')));
    } finally {
      setIsUploading(false);
      uploadAbortController.current = null;
    }
  };

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    const container = document.getElementById('chat-messages-container');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: behavior
      });
    }
  };

  useEffect(() => {
    if (!loadingMessages) {
      scrollToBottom('auto');
      const t = setTimeout(() => scrollToBottom('smooth'), 100);
      return () => clearTimeout(t);
    }
  }, [messages, loadingMessages]);

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
          isArchivedByUser: c.isArchivedByUser ?? false,
          isOnline: c.isOnline || false,
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
        setConversations(prev => {
          const localArchived = getArchivedIds();
          // Also sync any API-confirmed archives into localStorage
          list.forEach(c => { if (Boolean(c.isArchivedByUser)) localArchived.add(c.id); });
          localStorage.setItem(LS_KEY, JSON.stringify([...localArchived]));
          const updatedList = list.map(c => ({
            ...c,
            // localStorage is the source of truth — survives everything
            isArchivedByUser: localArchived.has(c.id) || Boolean(c.isArchivedByUser),
          }));
          try {
            sessionStorage.setItem('reachly_user_conversations_cache', JSON.stringify(updatedList));
          } catch (e) {}
          return updatedList;
        });
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-activate chat if bookingRef is passed in URL query
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const bookingRef = params.get('bookingRef');
      if (bookingRef) {
        const found = conversations.find(c => c.ref === bookingRef);
        if (found) {
          setActiveChat(found.id);
        }
      }
    }
  }, [conversations]);


  // Poll every 15 seconds
  useEffect(() => {
    const id = setInterval(fetchConversations, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchConversations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

    // Try to load messages from cache immediately to skip spinner
    try {
      const cachedMessagesStr = sessionStorage.getItem(`reachly_chat_messages_${activeChat}`);
      if (cachedMessagesStr) {
        setMessages(JSON.parse(cachedMessagesStr));
        setLoadingMessages(false);
      } else {
        setLoadingMessages(true);
      }
    } catch (e) {
      setLoadingMessages(true);
    }

    fetch(`/api/conversations/messages?conversationId=${activeChat}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const parsedMessages = (data.messages || []).map((m: any) => parseEncodedAttachment(m));
          setMessages(parsedMessages);
          try {
            sessionStorage.setItem(`reachly_chat_messages_${activeChat}`, JSON.stringify(parsedMessages));
          } catch (e) {}
        }
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
          const parsedMsg = parseEncodedAttachment(data.message);
          if (parsedMsg.conversationId === activeChat) {
            setMessages(prev => {
              if (prev.some(m => m.id === parsedMsg.id)) return prev;

              let matchedIndex = -1;
              if (parsedMsg.tempId) {
                matchedIndex = prev.findIndex(m => m.tempId === parsedMsg.tempId);
              }

              if (matchedIndex === -1) {
                const incomingTime = new Date(parsedMsg.createdAt).getTime();
                matchedIndex = prev.findIndex(m =>
                  m.id.startsWith('temp-') &&
                  (m.content === parsedMsg.content || m.content + `|||` === parsedMsg.content.substring(0, m.content.length + 3)) &&
                  m.senderId === parsedMsg.senderId &&
                  Math.abs(new Date(m.createdAt).getTime() - incomingTime) < 15000
                );
              }

              if (matchedIndex !== -1) {
                const copy = [...prev];
                copy[matchedIndex] = {
                  ...copy[matchedIndex],
                  ...parsedMsg,
                  attachment: parsedMsg.attachment || copy[matchedIndex].attachment
                };
                return copy;
              }

              return [...prev, parsedMsg];
            });
          }
          setConversations(prev =>
            prev
              .map(c =>
                c.id === parsedMsg.conversationId
                  ? { ...c, lastMessage: parsedMsg.content, lastMessageTime: parsedMsg.createdAt }
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
        } else if (data.type === 'chat_cleared' && data.conversationId === activeChat) {
          setMessages([]);
          setConversations(prev =>
            prev.map(c => (c.id === data.conversationId ? { ...c, lastMessage: '', lastMessageTime: null } : c))
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
    const trimmed = message.trim();
    if (!trimmed || !activeChat || !userId || sendingRef.current) return;

    sendingRef.current = true;
    setMessage('');

    // Release lock in next tick/event loop
    setTimeout(() => {
      sendingRef.current = false;
    }, 300);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStatus(false);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      tempId,
      conversationId: activeChat,
      senderId: userId,
      senderRole: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        conversationId: activeChat,
        senderId: userId,
        senderRole: 'user',
        content: trimmed,
        tempId
      }));
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
  const isAudioMsg = (content: any) => {
    if (typeof content !== 'string') return false;
    return content.startsWith('http') && (content.includes('.webm') || content.includes('.mp3') || content.includes('.ogg') || content.includes('voice-notes'));
  };

  const activeConv = conversations.find(c => c.id === activeChat);
  const isChatLocked = activeConv?.isLocked ?? false;

  const handleArchiveChat = async (archive: boolean) => {
    if (!activeChat) return;
    setIsArchivingChat(true);
    try {
      const res = await fetch('/api/conversations/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeChat, archive }),
      });
      if (res.ok) {
        // Write to localStorage immediately so tab switches never reset it
        if (archive) {
          addArchivedId(activeChat);
        } else {
          removeArchivedId(activeChat);
        }
        setConversations(prev =>
          prev.map(c => c.id === activeChat ? { ...c, isArchivedByUser: archive } : c)
        );
        if (archive) setActiveChat(null);
      }
    } catch (err) {
      console.error('Error archiving chat:', err);
    } finally {
      setIsArchivingChat(false);
      setShowDotsMenu(false);
    }
  };

  const allFiltered = conversations.filter(c =>
    (c.creator || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
    (c.session || '').toLowerCase().includes((searchText || '').toLowerCase())
  );
  const filteredConversations = allFiltered.filter(c => !c.isArchivedByUser);
  const archivedConversations = allFiltered.filter(c => c.isArchivedByUser);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F8F8FA] overflow-hidden">
      <div className="shrink-0">
        <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
      </div>

      <main className="flex-grow flex flex-col min-h-0 px-4 sm:px-6 lg:px-10 py-4 lg:py-4">
        {/* <h1
          className="text-[34px] leading-[34px] font-normal tracking-[0] text-black mb-3 lg:mb-6 shrink-0"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          Chats
        </h1> */}

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 mb-0">

          {/* Left Sidebar */}
          <div className={`w-full lg:w-[380px] flex flex-col gap-4 h-full lg:h-full shrink-0 ${activeChat ? 'hidden lg:flex' : 'flex'}`}>

            {/* Search Box */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search"
                className="w-full bg-white border border-gray-200 shadow-sm rounded-full py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0012FF]/20 focus:border-[#0012FF]/30 transition-all"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0012FF]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">

              {/* Archived Section – at the top */}
              {!loadingConversations && archivedConversations.length > 0 && (
                <div className="mb-1">
                  <button
                    onClick={() => setShowArchived(prev => !prev)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-2.5 text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>
                      <span className="text-sm font-semibold text-gray-600">Archived</span>
                      <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">{archivedConversations.length}</span>
                    </div>
                    <svg className={`transition-transform duration-200 text-gray-400 ${showArchived ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {showArchived && (
                    <div className="mt-2 space-y-2">
                      {archivedConversations.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setActiveChat(chat.id)}
                          className={`rounded-2xl p-4 cursor-pointer transition-all border ${activeChat === chat.id ? 'border-[#0012FF]/20 shadow-md bg-white ring-1 ring-[#0012FF]/5' : 'border-gray-100 hover:border-gray-200 bg-white shadow-xs'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex gap-3 items-center">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                <img src={chat.image} alt={chat.creator} className="object-cover w-full h-full" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <h4 className="text-sm font-bold text-gray-700">{chat.creator}</h4>
                                  <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">Archived</span>
                                </div>
                                {chat.lastMessage && (
                                  <p className="text-xs text-gray-400 truncate max-w-[150px] mt-0.5">
                                    {isAudioMsg(chat.lastMessage) ? '🎤 Voice message' : chat.lastMessage}
                                  </p>
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                      className={`rounded-2xl py-8 px-4 cursor-pointer transition-all border flex flex-col justify-center ${activeChat === chat.id ? 'border-[#0012FF]/20 shadow-md bg-white ring-1 ring-[#0012FF]/5' : 'border-gray-100 hover:border-gray-200 bg-white shadow-xs'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="relative w-9 h-9 shrink-0">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                              <img src={chat.image} alt={chat.creator} className="object-cover w-full h-full" />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${chat.isOnline ? 'bg-[#12B76A]' : 'bg-gray-400'}`}></div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="text-sm font-bold text-gray-900">{chat.creator}</h4>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#12B76A" />
                                <polyline points="7 12.5 10.5 16 17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            {chat.isLocked ? (
                              <span className="inline-flex items-center text-[12px] font-semibold text-gray-800 px-1.5 py-0.5 rounded mt-1">
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
                <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="lg:hidden p-1 mr-1 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                      </svg>
                    </button>

                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <img src={activeConv.image} alt={activeConv.creator} className="object-cover w-full h-full" />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-3 border-white rounded-full ${activeConv.isOnline ? 'bg-[#12B76A]' : 'bg-gray-400'}`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 overflow-visible">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate whitespace-nowrap max-w-[110px] sm:max-w-none">
                          {activeConv.creator}
                        </h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                          <circle cx="12" cy="12" r="12" fill="#12B76A" />
                          <polyline points="7 12.5 10.5 16 17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5 truncate">@{activeConv.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-gray-400">
                    <div className="relative">
                      <button
                        onClick={() => setShowDotsMenu(prev => !prev)}
                        className="hover:text-gray-600 hover:bg-gray-100 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                      </button>
                      {showDotsMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowDotsMenu(false)} />
                          <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 min-w-[180px] overflow-hidden">
                            {activeConv?.isArchivedByUser ? (
                              <button
                                onClick={() => handleArchiveChat(false)}
                                disabled={isArchivingChat}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>
                                {isArchivingChat ? 'Unarchiving...' : 'Unarchive Chat'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchiveChat(true)}
                                disabled={isArchivingChat}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>
                                {isArchivingChat ? 'Archiving...' : 'Archive Chat'}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>


                {/* Conditional View: lock screen ONLY if empty */}
                {(isChatLocked && messages.length === 0 && !loadingMessages) ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FAFAFA]">
                    <div className="mb-6 mt-4 w-[240px] h-[180px] relative">
                      <Image src="/assets/lock-chat.webp" alt="Lock Chat" fill className="object-contain" />
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
                    <div id="chat-messages-container" className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 bg-[#FAFAFA]">

                      {loadingMessages ? (
                        <div className="flex-grow flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0012FF]"></div>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((msg, index) => {
                          const isMe = msg.senderRole === 'user';
                          const isAudio = isAudioMsg(msg.content);

                          const prevMsg = index > 0 ? messages[index - 1] : null;
                          const currentDateStr = formatMsgDate(msg.createdAt);
                          const prevDateStr = prevMsg ? formatMsgDate(prevMsg.createdAt) : null;
                          const showDateSeparator = currentDateStr !== prevDateStr;

                          return (
                            <React.Fragment key={msg.id}>
                              {showDateSeparator && (
                                <div className="relative flex items-center justify-center py-4 shrink-0 w-full">
                                  <div className="absolute inset-x-0 h-px bg-gray-200/60"></div>
                                  <span className="relative bg-[#FAFAFA] px-4 text-[11px] font-medium text-gray-400">
                                    {currentDateStr}
                                  </span>
                                </div>
                              )}
                              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 w-full`}>
                              <div className={`flex gap-3 max-w-[85%] items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 shrink-0 mb-1">
                                  <img src={isMe ? (profilePhoto || '/avatar.png') : activeConv.image} alt="Avatar" className="object-cover w-full h-full" />
                                </div>
                                <div className="relative">
                                  {msg.attachment ? (
                                    <div className={`p-2.5 shadow-sm relative flex flex-col gap-1.5 ${isMe ? 'bg-[#E6E8FF] text-gray-800 rounded-[16px] rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-[16px] rounded-bl-sm'}`}>
                                      {msg.attachment.fileType === 'image' && (
                                        <div onClick={() => setLightboxMedia({ url: msg.attachment!.url, type: 'image' })}>
                                          <img src={msg.attachment.url} alt="Attachment" className="max-w-[240px] max-h-[240px] min-w-[160px] min-h-[120px] bg-black/10 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" onLoad={() => scrollToBottom('auto')} />
                                        </div>
                                      )}
                                      {msg.attachment.fileType === 'video' && (
                                        <div className="relative cursor-pointer group" onClick={() => setLightboxMedia({ url: msg.attachment!.url, type: 'video' })}>
                                          <video src={`${msg.attachment.url}#t=0.1`} preload="metadata" playsInline className="max-w-[240px] max-h-[240px] min-w-[160px] min-h-[120px] bg-black/10 rounded-lg object-cover pointer-events-none" onLoadedMetadata={() => scrollToBottom('auto')} />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors rounded-lg">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {(msg.attachment.fileType === 'document' || msg.attachment.fileType === 'pdf') && (
                                        <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-black/10 rounded-xl hover:bg-black/20 transition-colors">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                          <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold truncate max-w-[160px]">{msg.attachment.fileName}</span>
                                            <span className="text-xs opacity-70">{(msg.attachment.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                          </div>
                                        </a>
                                      )}
                                      <div className="flex justify-end items-center gap-1 mt-1">
                                        <span className={`text-[10px] font-medium select-none text-gray-400`}>
                                          {formatMsgTime(msg.createdAt)}
                                        </span>
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
                                      </div>
                                    </div>
                                  ) : (
                                    isAudio ? (
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
                                      <div className={`${isMe ? 'bg-[#E6E8FF] text-gray-800' : 'bg-white border border-gray-100 text-gray-800'} text-[13px] py-2 px-3.5 rounded-[16px] ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} shadow-xs leading-relaxed break-all min-w-[80px]`}>
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
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
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
                      <div className="p-2 sm:p-2.5 bg-white border-t border-gray-100 shrink-0">
                        {/* Upload UI */}
                        {isUploading && (
                          <div className="mb-2 w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-[#0012FF]/10 flex items-center justify-center text-[#0012FF] shrink-0">
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16" /></svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-gray-700">
                                  <span className="truncate pr-4">{uploadFile?.name}</span>
                                  <span className="shrink-0">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200/60 rounded-full h-1">
                                  <div className="bg-[#0012FF] h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                              </div>
                            </div>
                            <button onClick={cancelUpload} className="ml-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                          </div>
                        )}
                        {uploadError && uploadFile && !isUploading && (
                          <div className="mb-2 w-full bg-red-50/50 border border-red-100 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col">
                                <span className="text-[11px] font-semibold text-red-700 truncate">{uploadFile.name}</span>
                                <span className="text-[10px] text-red-500 font-medium">Upload failed or canceled</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-3">
                              <button onClick={retryUpload} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Retry">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38l-5.67-5.67" /></svg>
                              </button>
                              <button onClick={clearUpload} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {previewFile && !isUploading && (
                          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[110]" onClick={() => setPreviewFile(null)}>
                            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 w-[90%] max-w-[450px]" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-between items-center w-full pb-3 border-b border-gray-100">
                                <span className="text-base font-bold text-gray-800">Preview Attachment</span>
                                <button onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                              </div>

                              <div className="flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden min-h-[200px] max-h-[350px] p-2 border border-gray-100">
                                {previewFile.type.startsWith('image/') ? (
                                  <img src={URL.createObjectURL(previewFile)} alt="Preview" className="max-w-full max-h-[330px] object-contain rounded-lg" />
                                ) : previewFile.type.startsWith('video/') ? (
                                  <video src={URL.createObjectURL(previewFile)} className="max-w-full max-h-[330px] object-contain rounded-lg" controls />
                                ) : (
                                  <div className="flex flex-col items-center gap-3 p-8 text-gray-500">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <span className="text-sm font-semibold text-center truncate max-w-[280px]">{previewFile.name}</span>
                                    <span className="text-xs opacity-75">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end gap-3 mt-2">
                                <button onClick={() => setPreviewFile(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                                  Cancel
                                </button>
                                <button onClick={() => { startUpload(previewFile); setPreviewFile(null); }} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0012FF] hover:bg-[#0010d0] rounded-full transition-colors shadow-lg active:scale-98 flex items-center gap-2 cursor-pointer">
                                  <span>Send</span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} hidden accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileInput} />

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
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendMessage();
                                  }
                                }}
                                placeholder="Type something..."
                                className="w-full bg-[#F3F4F6] border-0 rounded-full py-2.5 pl-5 pr-18 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0012FF]/10 transition-all"
                              />
                              <button
                                onClick={triggerFileInput}
                                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Attach File"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                              </button>
                              <button
                                onClick={startRecording}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Record Voice Note"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                              </button>
                            </div>
                          )}
                          {!isRecording && (
                            <button onClick={handleSendMessage} className="w-10 h-10 rounded-full bg-[#0012FF] hover:bg-[#0010d0] flex items-center justify-center text-white shrink-0 shadow-md transition-transform active:scale-95">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '-1.5px' }}>
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

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setLightboxMedia(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full z-[110]" onClick={() => setLightboxMedia(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          <div className="relative max-w-6xl max-h-[90vh] flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
            {lightboxMedia.type === 'image' ? (
              <img src={lightboxMedia.url} alt="Fullscreen Attachment" className="max-w-full max-h-full object-contain select-none drop-shadow-2xl rounded-sm" />
            ) : (
              <video controls autoPlay playsInline src={lightboxMedia.url} className="max-w-full max-h-full outline-none drop-shadow-2xl rounded-sm" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
