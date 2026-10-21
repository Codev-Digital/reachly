'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import VoicePlayer from '@/components/VoicePlayer';
import ChatAttachmentBubble from '@/components/chat/ChatAttachmentBubble';
import ChatMessageShell, { chatTextBubbleClass } from '@/components/chat/ChatMessageShell';
import {
  attachmentTypeForFile,
  filterChatFiles,
  formatFileSizeMb,
  normalizeMessageAttachments,
  parseEncodedAttachmentMessage,
  type ChatAttachment,
} from '@/lib/chatAttachments';

interface ConversationInfo {
  id: string;
  conversationId: string;
  type?: 'dm' | 'broadcast';
  /** Channel title: joiner name for DMs, event title for broadcasts. */
  follower: string;
  email: string;
  /** Channel avatar: joiner photo for DMs, event banner for broadcasts. */
  avatar: string;
  time: string;
  shortDate: string;
  scheduledDate: string;
  meetingUrl?: string | null;
  isLocked: boolean;
  lastMessage: string;
  lastMessageTime: string | null;
  lastMessageSenderRole?: string | null;
  unreadCount: number;
  session: string;
  duration: string;
  price: string;
  ref: string;
  isCreator: boolean;
  isArchivedByCreator?: boolean;
  isOnline?: boolean;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'creator' | 'user';
  /** Resolved display name for this sender (esp. broadcast joiners). */
  senderName?: string;
  /** Resolved profile photo for this sender (esp. broadcast joiners). */
  senderAvatar?: string;
  content: string;
  read?: boolean;
  createdAt: string;
  attachment?: ChatAttachment;
  attachments?: ChatAttachment[];
  tempId?: string;
}

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

const parseEncodedAttachment = (msg: ChatMessage): ChatMessage =>
  parseEncodedAttachmentMessage(msg);

export default function ChatsPage() {
  const [searchText, setSearchText] = useState('');
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
  /** Broadcast: map senderId → { name, avatar } for joiner message labels. */
  const [participantProfiles, setParticipantProfiles] = useState<
    Record<string, { name: string; avatar: string }>
  >({});

  // Load cached conversations on mount
  useEffect(() => {
    try {
      const cachedConvs = sessionStorage.getItem('reachly_creator_conversations_cache');
      if (cachedConvs) {
        setConversations(JSON.parse(cachedConvs));
        setLoadingConversations(false);
      }
    } catch (e) {}
  }, []);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [isLockingLoading, setIsLockingLoading] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isArchivingChat, setIsArchivingChat] = useState(false);
  // Persistent ref — never reset by React state, survives tab switches & polls
  const archivedCreatorChatIds = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Attachment states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    urls: string[];
    index: number;
    type: 'image' | 'video';
  } | null>(null);
  const uploadAbortController = useRef<AbortController | null>(null);
  const sendingRef = useRef<boolean>(false);

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const cancelUpload = () => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
  };

  const retryUpload = () => {
    if (uploadFiles.length) {
      startUpload(uploadFiles);
    }
  };

  const clearUpload = () => {
    setUploadError(false);
    setUploadFiles([]);
    setUploadProgress(0);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!files.length) return;

    const { accepted, oversized, error } = filterChatFiles(files);
    if (error) {
      setFileError(error);
      return;
    }

    if (oversized.length) {
      oversized.forEach((f) => toast.error(`"${f.name}" is more than 5 MB`));
    }

    if (!accepted.length) {
      setFileError(null);
      return;
    }

    setFileError(null);
    setPreviewFiles(accepted);
  };

  const uploadOneFile = (file: File, signal: AbortSignal, onProgress: (pct: number) => void) =>
    new Promise<{ publicUrl: string }>(async (resolve, reject) => {
      try {
        const tokenRes = await fetch('/api/messages/upload/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
          signal,
        });
        if (!tokenRes.ok) {
          const errBody = await tokenRes.json().catch(() => ({}));
          throw new Error(errBody.error || 'Failed to get upload token');
        }
        const { signedUrl, publicUrl } = await tokenRes.json();

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.open('PUT', signedUrl, true);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve({ publicUrl });
          else reject(new Error(`Upload failed: ${xhr.statusText}`));
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.onabort = () => reject(new Error('Upload canceled'));
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
        signal.addEventListener('abort', () => xhr.abort());
      } catch (err) {
        reject(err);
      }
    });

  const startUpload = async (files: File[], roleOverride?: 'creator' | 'user') => {
    if (!files.length || !activeChat || !creatorId) return;

    const { accepted, oversized, error } = filterChatFiles(files);
    if (error) {
      setFileError(error);
      return;
    }
    if (oversized.length) {
      oversized.forEach((f) => toast.error(`"${f.name}" is more than 5 MB`));
    }
    if (!accepted.length) return;

    const activeConvUpload = conversations.find(c => c.id === activeChat);
    const myRoleUpload: 'creator' | 'user' = roleOverride ?? ((activeConvUpload?.isCreator === false) ? 'user' : 'creator');

    setUploadFiles(accepted);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(false);
    setFileError(null);

    const abortController = new AbortController();
    uploadAbortController.current = abortController;

    try {
      const uploaded: ChatAttachment[] = [];
      for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i];
        const { publicUrl } = await uploadOneFile(file, abortController.signal, (pct) => {
          const overall = Math.round(((i + pct / 100) / accepted.length) * 100);
          setUploadProgress(overall);
        });
        uploaded.push({
          url: publicUrl,
          fileType: attachmentTypeForFile(file),
          fileName: file.name,
          fileSize: file.size,
        });
      }

      const primaryType = uploaded.every((a) => a.fileType === 'image')
        ? 'image'
        : uploaded[0].fileType;
      const lastMessageLabel = uploaded.length > 1
        ? `[Attached ${uploaded.length} images]`
        : `[Attached ${primaryType}]`;

      const tempId = `temp-${Date.now()}`;
      const optimisticAttachments = uploaded.map((a, i) => ({
        ...a,
        url: a.fileType === 'image' ? URL.createObjectURL(accepted[i]) : a.url,
      }));
      // Prefer local blob previews for images while public URLs go over the wire
      const optimisticMsg: ChatMessage = {
        id: tempId,
        tempId,
        conversationId: activeChat,
        senderId: creatorId,
        senderRole: myRoleUpload,
        content: lastMessageLabel,
        createdAt: new Date().toISOString(),
        read: false,
        attachment: optimisticAttachments[0],
        attachments: optimisticAttachments,
      };
      setMessages(prev => [...prev, optimisticMsg]);
      scrollToBottom();

      setConversations(prev =>
        prev
          .map(c =>
            c.id === activeChat
              ? { ...c, lastMessage: lastMessageLabel, lastMessageTime: optimisticMsg.createdAt, lastMessageSenderRole: myRoleUpload }
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

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const attachMeta = JSON.stringify(uploaded);
        wsRef.current.send(JSON.stringify({
          type: 'message',
          conversationId: activeChat,
          senderId: creatorId,
          senderRole: myRoleUpload,
          content: `${lastMessageLabel}|||${attachMeta}|||`,
          tempId,
          attachment: uploaded[0],
          attachments: uploaded,
        }));
      }

      setUploadFiles([]);
    } catch (err: any) {
      if (err.message === 'Upload canceled' || err.name === 'AbortError') {
        setUploadError(true);
      } else {
        console.error('File upload error:', err);
        setUploadError(true);
        setFileError(err.message || 'Upload failed');
      }
      setMessages(prev => prev.filter(m => {
        const atts = normalizeMessageAttachments(m);
        return !m.tempId || !atts.some((a) => a.url.startsWith('blob:'));
      }));
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
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: ConversationInfo[] = (data.conversations || [])
          .filter((c: any) => c.scheduledDate || c.type === 'broadcast')
          .map((c: any) => ({
            id: c.id,
            conversationId: c.conversationId,
            type: c.type === 'broadcast' ? 'broadcast' : 'dm',
            follower: c.follower || c.creator || 'Unknown',
            email: c.email || '',
            session: c.session || '',
            shortDate: c.shortDate || '',
            time: c.time || '',
            duration: c.duration || '',
            price: c.price || '',
            avatar: c.avatar || c.image || '/avatar.png',
            meetingUrl: c.meetingUrl || null,
            isLocked: c.isLocked,
            lastMessage: c.lastMessage || '',
            lastMessageTime: c.lastMessageTime || null,
            lastMessageSenderRole: c.lastMessageSenderRole || null,
            ref: c.ref || '',
            unreadCount: c.unreadCount || 0,
            scheduledDate: c.scheduledDate || '',
            isCreator: c.isCreator,
            isArchivedByCreator: c.isArchivedByCreator ?? false,
            isOnline: c.isOnline || false,
          }))
          .sort((a: ConversationInfo, b: ConversationInfo) => {
            const hasMsgA = !!a.lastMessageTime;
            const hasMsgB = !!b.lastMessageTime;
            if (hasMsgA && !hasMsgB) return -1;
            if (!hasMsgA && hasMsgB) return 1;
            if (hasMsgA && hasMsgB) {
              return new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime();
            }
            const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
            const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
            return dateB - dateA;
          });
        setConversations(prev => {
          const existingArchiveMap = new Map(prev.map(c => [c.id, c.isArchivedByCreator]));
          const updatedList = list.map(c => ({
            ...c,
            isArchivedByCreator: archivedCreatorChatIds.current.has(c.id) || Boolean(c.isArchivedByCreator) || existingArchiveMap.get(c.id) || false,
          }));
          try {
            sessionStorage.setItem('reachly_creator_conversations_cache', JSON.stringify(updatedList));
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
    const id = setInterval(() => fetchConversations(), 7000);
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
    const currentConv = conversations.find(c => c.id === activeChat);
    setIsChatLocked(currentConv?.isLocked ?? false);

    if (!activeChat) {
      setMessages([]);
      setParticipantProfiles({});
      return;
    }

    setConversations(prev => {
      const updated = prev.map(c => (c.id === activeChat ? { ...c, unreadCount: 0 } : c));
      try {
        sessionStorage.setItem('reachly_creator_conversations_cache', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const currentRole = currentConv?.isCreator ? 'creator' : 'user';

    fetch('/api/conversations/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: activeChat, role: currentRole })
    }).catch(console.error);


    // Cache for instant paint — never inject sidebar lastMessage placeholders as fake bubbles
    try {
      const cachedMessagesStr = sessionStorage.getItem(`reachly_chat_messages_${activeChat}`);
      const cachedMessages: ChatMessage[] = cachedMessagesStr ? JSON.parse(cachedMessagesStr) : [];
      const realCached = cachedMessages.filter((m) => !String(m.id).startsWith('temp-sidebar-'));
      if (realCached.length) {
        setMessages(realCached);
        setLoadingMessages(false);
      } else {
        setLoadingMessages(true);
      }
    } catch (e) {
      setLoadingMessages(true);
    }

    let cancelled = false;
    const fetchChatId = activeChat;
    fetch(`/api/conversations/messages?conversationId=${activeChat}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.success) {
          console.error('Error fetching messages:', data?.error || res.status);
          // Drop any leftover sidebar placeholders if the real history failed to load
          setMessages((prev) => prev.filter((m) => !String(m.id).startsWith('temp-sidebar-')));
          return;
        }
        const parsedMessages = (data.messages || []).map((m: any) => parseEncodedAttachment(m));
        // Merge so in-flight optimistic temps aren't wiped by a slow/stale fetch
        setMessages(prev => {
          const serverIds = new Set(parsedMessages.map((m: ChatMessage) => m.id));
          const temps = prev.filter(
            (m) =>
              (m.tempId || m.id.startsWith('temp-')) &&
              !m.id.startsWith('temp-sidebar-') &&
              !serverIds.has(m.id) &&
              !parsedMessages.some(
                (s: ChatMessage) =>
                  (m.tempId && s.tempId === m.tempId) ||
                  (s.content === m.content &&
                    s.senderId === m.senderId &&
                    Math.abs(new Date(s.createdAt).getTime() - new Date(m.createdAt).getTime()) < 20000)
              )
          );
          return [...parsedMessages, ...temps];
        });
        if (data.participantProfiles && typeof data.participantProfiles === 'object') {
          setParticipantProfiles(data.participantProfiles);
        } else {
          const fromMsgs: Record<string, { name: string; avatar: string }> = {};
          for (const m of parsedMessages) {
            if (m.senderId && (m.senderName || m.senderAvatar)) {
              fromMsgs[m.senderId] = {
                name: m.senderName || 'User',
                avatar: m.senderAvatar || '/avatar.png',
              };
            }
          }
          setParticipantProfiles(fromMsgs);
        }
        try {
          sessionStorage.setItem(`reachly_chat_messages_${fetchChatId}`, JSON.stringify(parsedMessages));
        } catch (e) {}
      })
      .catch(err => console.error('Error fetching messages:', err))
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001';
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    // Derive role: if isCreator flag is true (or undefined/missing = legacy creator), use 'creator', else 'user'
    const activeConvForSocket = conversations.find(c => c.id === activeChat);
    const myRole: 'creator' | 'user' = (activeConvForSocket?.isCreator === false) ? 'user' : 'creator';

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', conversationId: activeChat, senderRole: myRole }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          const parsedMsg = parseEncodedAttachment(data.message);
          if (parsedMsg.conversationId === activeChat) {
            if (parsedMsg.senderId && (parsedMsg.senderName || parsedMsg.senderAvatar)) {
              setParticipantProfiles(prev => ({
                ...prev,
                [parsedMsg.senderId]: {
                  name: parsedMsg.senderName || prev[parsedMsg.senderId]?.name || 'User',
                  avatar: parsedMsg.senderAvatar || prev[parsedMsg.senderId]?.avatar || '/avatar.png',
                },
              }));
            }
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
                  attachment: parsedMsg.attachment || copy[matchedIndex].attachment,
                  attachments: parsedMsg.attachments?.length
                    ? parsedMsg.attachments
                    : copy[matchedIndex].attachments,
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
                  ? { ...c, lastMessage: parsedMsg.content, lastMessageTime: parsedMsg.createdAt, lastMessageSenderRole: parsedMsg.senderRole }
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
    return () => {
      cancelled = true;
      socket.close();
    };
  }, [activeChat]);

  const handleSendMessage = () => {
    const activeConvNow = conversations.find(c => c.id === activeChat);
    const myRoleNow: 'creator' | 'user' = (activeConvNow?.isCreator === false) ? 'user' : 'creator';

    if (previewFiles.length) {
      startUpload(previewFiles, myRoleNow);
      setPreviewFiles([]);
      const text = message.trim();
      if (!text) {
        setMessage('');
        return;
      }
    }

    const trimmed = message.trim();
    if (!trimmed || !activeChat || !creatorId || sendingRef.current) return;

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
      senderId: creatorId,
      senderRole: myRoleNow,
      content: trimmed,
      createdAt: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    setConversations(prev =>
      prev
        .map(c =>
          c.id === activeChat
            ? { ...c, lastMessage: trimmed, lastMessageTime: optimisticMsg.createdAt, lastMessageSenderRole: myRoleNow }
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

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        conversationId: activeChat,
        senderId: creatorId,
        senderRole: myRoleNow,
        content: trimmed,
        tempId
      }));
    }
  };

  const sendTypingStatus = (typingState: boolean) => {
    if (!activeChat || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (lastTypingSentRef.current === typingState) return;
    const activeConvTyping = conversations.find(c => c.id === activeChat);
    const myRoleTyping: 'creator' | 'user' = (activeConvTyping?.isCreator === false) ? 'user' : 'creator';

    wsRef.current.send(JSON.stringify({
      type: 'typing',
      conversationId: activeChat,
      senderRole: myRoleTyping,
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
        const file = new File([audioBlob], 'Voice message.webm', { type: 'audio/webm' });

        setIsUploading(true);
        setUploadFile(file);
        setUploadProgress(0);
        setUploadError(false);

        const abortController = new AbortController();
        uploadAbortController.current = abortController;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-note.webm');

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        try {
          const res = await new Promise<any>((resolve, reject) => {
            xhr.open('POST', '/api/conversations/upload-voice', true);
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                  reject(new Error('Failed to parse upload response'));
                }
              } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
              }
            };
            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.onabort = () => reject(new Error('Upload canceled'));
            xhr.send(formData);
            abortController.signal.addEventListener('abort', () => xhr.abort());
          });

          const activeConvVoice = conversations.find(c => c.id === activeChat);
          const myRoleVoice: 'creator' | 'user' = (activeConvVoice?.isCreator === false) ? 'user' : 'creator';

          if (res.url && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'message',
              conversationId: activeChat,
              senderId: creatorId,
              senderRole: myRoleVoice,
              content: res.url,
            }));

            // Optimistic update for the sidebar
            setConversations(prev =>
              prev
                .map(c =>
                  c.id === activeChat
                    ? { ...c, lastMessage: '[Voice message]', lastMessageTime: new Date().toISOString(), lastMessageSenderRole: myRoleVoice }
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
          }
          setUploadFile(null);
        } catch (uploadErr) {
          console.error('Voice upload failed:', uploadErr);
          setUploadError(true);
        } finally {
          setIsUploading(false);
          uploadAbortController.current = null;
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

  const isAudioMsg = (content: any) => {
    if (typeof content !== 'string') return false;
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

  const handleClearChat = async () => {
    if (!activeChat) return;
    setIsClearingChat(true);
    try {
      const res = await fetch('/api/conversations/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeChat }),
      });
      if (res.ok) {
        setMessages([]);
        setConversations(prev =>
          prev.map(c => (c.id === activeChat ? { ...c, lastMessage: '', lastMessageTime: null } : c))
        );
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'chat_cleared',
            conversationId: activeChat,
          }));
        }
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
    } finally {
      setIsClearingChat(false);
      setShowClearModal(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeChat);

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
        if (archive) {
          archivedCreatorChatIds.current.add(activeChat);
        } else {
          archivedCreatorChatIds.current.delete(activeChat);
        }
        setConversations(prev =>
          prev.map(c => c.id === activeChat ? { ...c, isArchivedByCreator: archive } : c)
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

  const sidebarChatName = (chat: ConversationInfo) =>
    chat.type === 'broadcast' ? 'Event Chat' : (chat.follower || 'User');

  const renderMessagePreview = (chat: ConversationInfo, myRole: 'creator' | 'user') => {
    if (chat.isLocked) {
      return <span className="flex items-center gap-1 text-gray-600 font-semibold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Chat is locked</span>;
    }
    if (!chat.lastMessage) return <span className="text-gray-400 font-medium">No messages yet</span>;
    
    let prefix = '';
    if (chat.lastMessageSenderRole) {
      if (chat.lastMessageSenderRole === myRole) {
        prefix = 'You: ';
      } else {
        const otherName = chat.follower || 'User';
        prefix = `${otherName.charAt(0)}: `;
      }
    }
    let content: React.ReactNode = chat.lastMessage;
    if (chat.lastMessage === '[Attached image]' || /^\[Attached \d+ images\]$/.test(chat.lastMessage || '')) {
      content = <span className="inline-flex items-center gap-1"><span className="translate-y-[-1px]">📷</span><span>Photo</span></span>;
    }
    else if (chat.lastMessage === '[Attached video]') content = <span className="inline-flex items-center gap-1"><span className="translate-y-[-1px]">🎥</span><span>Video</span></span>;
    else if (chat.lastMessage === '[Attached document]' || chat.lastMessage === '[Attached pdf]') content = <span className="inline-flex items-center gap-1"><span className="translate-y-[-1px]">📄</span><span>Document</span></span>;
    else if (isAudioMsg(chat.lastMessage)) content = <span className="inline-flex items-center gap-1"><span className="translate-y-[-1px]">🎤</span><span>Voice message</span></span>;
    else if (chat.lastMessage.startsWith('http')) content = <span className="inline-flex items-center gap-1"><span className="translate-y-[-1px]">🔗</span><span>Link</span></span>;
    return (
      <span className="flex items-center gap-1 truncate text-[14px] text-gray-500 mt-0.5">
        {prefix && <span className="font-semibold text-gray-700 shrink-0">{prefix}</span>}
        <span className="truncate">{content}</span>
      </span>
    );
  };

  const allFiltered = conversations.filter(c => {
    const q = (searchText || '').toLowerCase();
    const name = c.type === 'broadcast' ? 'event chat' : (c.follower || '').toLowerCase();
    return name.includes(q) ||
      (c.follower || '').toLowerCase().includes(q) ||
      (c.session || '').toLowerCase().includes(q);
  });
  const filteredConversations = allFiltered.filter(c => !c.isArchivedByCreator);
  const archivedConversations = allFiltered.filter(c => c.isArchivedByCreator);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F8F8FA] overflow-hidden">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 lg:py-4 flex flex-col min-h-0">
        {/* <h1
          className="font-normal text-[34px] leading-[34px] tracking-[0] text-black mb-3 lg:mb-5 shrink-0"
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
            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">

              {/* Archived Section – WhatsApp style, at the TOP */}
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
                    <svg
                      className={`transition-transform duration-200 text-gray-400 ${showArchived ? 'rotate-180' : ''}`}
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showArchived && (
                    <div className="mt-2">
                      {archivedConversations.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setActiveChat(chat.id)}
                          className={`py-5 px-4 cursor-pointer transition-all flex flex-col justify-center ${activeChat === chat.id ? 'rounded-2xl border border-[#0012FF]/30 bg-[#F4F5FF] ring-1 ring-[#0012FF]/10 my-1' : 'border-b border-gray-200 hover:bg-gray-50 bg-transparent'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex gap-3 items-center">
                              <div className="relative">
                                <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-gray-200">
                                  <img src={chat.avatar} alt={sidebarChatName(chat)} className="object-cover w-full h-full" />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <h4 className="text-[16px] font-semibold text-gray-900">{sidebarChatName(chat)}</h4>
                                  <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">Archived</span>
                                </div>
                                <div className="max-w-[200px] truncate">
                                  {renderMessagePreview(chat, chat.isCreator === false ? 'user' : 'creator')}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[12px] text-gray-400 font-medium">
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
                  .map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`py-5 px-4 cursor-pointer transition-all flex flex-col justify-center ${activeChat === chat.id ? 'rounded-2xl border border-[#0012FF]/30 bg-[#F4F5FF] ring-1 ring-[#0012FF]/10 my-1' : 'border-b border-gray-200 hover:bg-gray-50 bg-transparent'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="relative w-[50px] h-[50px] shrink-0">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                              <img src={chat.avatar} alt={sidebarChatName(chat)} className="object-cover w-full h-full" />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${chat.isOnline ? 'bg-[#12B76A]' : 'bg-gray-400'}`}></div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="text-[16px] font-semibold text-gray-900">{sidebarChatName(chat)}</h4>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#12B76A" />
                                <polyline points="7 12.5 10.5 16 17 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                              <div className="max-w-[200px] truncate">
                                {renderMessagePreview(chat, chat.isCreator === false ? 'user' : 'creator')}
                              </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[12px] text-gray-400 font-medium">
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
                      <div
                        className="rounded-full overflow-hidden bg-gray-200"
                        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
                      >
                        <img
                          src={activeConv.avatar}
                          alt={activeConv.follower}
                          className="object-cover"
                          style={{ width: 44, height: 44 }}
                        />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-3 border-white rounded-full ${activeConv.isOnline ? 'bg-[#12B76A]' : 'bg-gray-400'}`}></div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{activeConv.follower}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${activeConv.isOnline ? 'bg-[#12B76A]' : 'bg-gray-400'}`}></span>
                        <span className="text-xs text-gray-400 font-medium">
                          {activeConv.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400">
                    {activeConv.isCreator && (
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
                    )}
                    {/* <button className="hover:text-gray-600 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </button> */}
                    {/* 3-dot menu with dropdown */}
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
                            {/* Lock / Unlock — only for the creator side */}
                            {activeConv?.isCreator !== false && (
                              <>
                                <button
                                  onClick={() => { setShowDotsMenu(false); handleLockToggleClick(); }}
                                  disabled={isLockingLoading}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  {isChatLocked ? (
                                    <>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                                      {isLockingLoading ? 'Unlocking...' : 'Unlock Chat'}
                                    </>
                                  ) : (
                                    <>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                      {isLockingLoading ? 'Locking...' : 'Lock Chat'}
                                    </>
                                  )}
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                              </>
                            )}
                            {/* Archive / Unarchive */}
                            {activeConv?.isArchivedByCreator ? (
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
                            {activeConv?.isCreator !== false && (
                              <>
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  onClick={() => { setShowDotsMenu(false); setShowClearModal(true); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                  Delete Chat
                                </button>
                              </>
                            )}
                          </div>


                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conditional Chat View */}
                {(isChatLocked && messages.length === 0 && !loadingMessages) ? (
                  activeConv.isCreator ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FAFAFA]">
                      <div className="mb-6 mt-4 w-[240px] h-[180px] relative">
                        <Image src="/assets/lock-chat.webp" alt="Lock Chat" fill className="object-contain" />
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
                          <svg className="text-[#0012FF]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 2 12 12 16 14" /></svg>
                          <span>{activeConv.duration}</span>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    {/* Chat Messages */}
                    <div id="chat-messages-container" className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 bg-white">

                      {loadingMessages ? (
                        <div className="flex-grow flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0012FF]"></div>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((msg, index) => {
                          // Creator dashboard: creator always right; all joiners/users always left
                          const isMe = msg.senderRole === 'creator';
                          const isBroadcast = activeConv?.type === 'broadcast';
                          const isAudio = isAudioMsg(msg.content);

                          const prevMsg = index > 0 ? messages[index - 1] : null;
                          const currentDateStr = formatMsgDate(msg.createdAt);
                          const prevDateStr = prevMsg ? formatMsgDate(prevMsg.createdAt) : null;
                          const showDateSeparator = currentDateStr !== prevDateStr;

                          // Broadcast: channel uses event title/banner; each joiner message uses that sender's profile
                          const profileFromMap = msg.senderId
                            ? participantProfiles[msg.senderId]
                            : undefined;
                          const otherName = isBroadcast
                            ? (msg.senderName || profileFromMap?.name || 'User')
                            : (activeConv?.follower || 'User');
                          const otherAvatar = isBroadcast
                            ? (msg.senderAvatar || profileFromMap?.avatar || '/avatar.png')
                            : (activeConv?.avatar || '/avatar.png');

                          return (
                            <React.Fragment key={msg.id}>
                              {showDateSeparator && (
                                <div className="relative flex items-center justify-center py-4 shrink-0 w-full">
                                  <div className="absolute inset-x-0 h-px bg-gray-200/60"></div>
                                  <span className="relative bg-white px-4 text-[11px] font-medium text-gray-400">
                                    {currentDateStr}
                                  </span>
                                </div>
                              )}
                              <ChatMessageShell
                                isMe={isMe}
                                senderName={isMe ? (displayName || 'You') : otherName}
                                timeLabel={formatMsgTime(msg.createdAt)}
                                avatarUrl={isMe ? (profilePhoto || '/avatar.png') : otherAvatar}
                              >
                                  {normalizeMessageAttachments(msg).length > 0 ? (
                                    <ChatAttachmentBubble
                                      attachments={normalizeMessageAttachments(msg)}
                                      isMe={isMe}
                                      onLoad={() => scrollToBottom('auto')}
                                      onOpenImage={(images, index) =>
                                        setLightboxMedia({
                                          urls: images.map((img) => img.url),
                                          index,
                                          type: 'image',
                                        })
                                      }
                                      onOpenVideo={(url) =>
                                        setLightboxMedia({ urls: [url], index: 0, type: 'video' })
                                      }
                                      readStatus={
                                        <span className="inline-flex shrink-0">
                                          {msg.read ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0057ff" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /><path d="M22 5l-7.5 7.5" /></svg>
                                          ) : isOtherUserOnline ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /><path d="M22 5l-7.5 7.5" /></svg>
                                          ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2.5"><path d="M17 5L9.5 12.5L6 9" /></svg>
                                          )}
                                        </span>
                                      }
                                    />
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
                                      <div
                                        className={chatTextBubbleClass(isMe)}
                                        style={{ fontFamily: 'Inter, var(--font-inter), sans-serif' }}
                                      >
                                        {msg.content}
                                      </div>
                                    )
                                  )}
                              </ChatMessageShell>
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
                          <div
                            className="shrink-0 overflow-hidden rounded-full bg-gray-200"
                            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
                          >
                            <img
                              src={activeConv.avatar}
                              alt="Avatar"
                              className="object-cover"
                              style={{ width: 44, height: 44 }}
                            />
                          </div>
                          <div className="flex min-w-[70px] items-center gap-1.5 rounded-[8px] rounded-tl-none bg-[#F8F8F8] px-5 py-3.5">
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
                      <div className="p-3 mb-3 mx-3 bg-white border border-[#0012FF]/10 rounded-2xl shadow-[0_4px_24px_rgba(0,18,255,0.06)] shrink-0">
                        {/* Upload UI */}
                        {fileError && (
                          <div className="mb-2 rounded-xl border border-red-100 bg-red-50/80 px-3 py-2 text-[11px] font-semibold text-red-600">
                            {fileError}
                            <button type="button" className="ml-2 underline" onClick={() => setFileError(null)}>Dismiss</button>
                          </div>
                        )}
                        {isUploading && (
                          <div className="mb-2 w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-[#0012FF]/10 flex items-center justify-center text-[#0012FF] shrink-0">
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16" /></svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-gray-700">
                                  <span className="truncate pr-4">
                                    {uploadFiles.length > 1
                                      ? `Uploading ${uploadFiles.length} images…`
                                      : uploadFiles[0]?.name || 'Uploading…'}
                                  </span>
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
                        {uploadError && uploadFiles.length > 0 && !isUploading && (
                          <div className="mb-2 w-full bg-red-50/50 border border-red-100 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col">
                                <span className="text-[11px] font-semibold text-red-700 truncate">
                                  {uploadFiles.length > 1 ? `${uploadFiles.length} files` : uploadFiles[0]?.name}
                                </span>
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
                        {previewFiles.length > 0 && !isUploading && (
                          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[110]" onClick={() => setPreviewFiles([])}>
                            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 w-[90%] max-w-[450px]" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-between items-center w-full pb-3 border-b border-gray-100">
                                <span className="text-base font-bold text-gray-800">
                                  {previewFiles.length > 1 ? `Preview ${previewFiles.length} images` : 'Preview Attachment'}
                                </span>
                                <button onClick={() => setPreviewFiles([])} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                              </div>

                              {previewFiles.every((f) => f.type.startsWith('image/')) && previewFiles.length > 1 ? (
                                <div className="grid max-h-[350px] grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-2">
                                  {previewFiles.map((file, i) => (
                                    <div key={`${file.name}-${i}`} className="aspect-square overflow-hidden rounded-xl bg-black/5">
                                      <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden min-h-[200px] max-h-[350px] p-2 border border-gray-100">
                                  {previewFiles[0].type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(previewFiles[0])} alt="Preview" className="max-w-full max-h-[330px] object-contain rounded-lg" />
                                  ) : previewFiles[0].type.startsWith('video/') ? (
                                    <video src={URL.createObjectURL(previewFiles[0])} className="max-w-full max-h-[330px] object-contain rounded-lg" controls />
                                  ) : (
                                    <div className="flex flex-col items-center gap-3 p-8 text-gray-500">
                                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                      <span className="text-sm font-semibold text-center truncate max-w-[280px]">{previewFiles[0].name}</span>
                                      <span className="text-xs opacity-75">{formatFileSizeMb(previewFiles[0].size)}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex justify-end gap-3 mt-2">
                                <button onClick={() => setPreviewFiles([])} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                                  Cancel
                                </button>
                                <button onClick={() => { startUpload(previewFiles); setPreviewFiles([]); }} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0012FF] hover:bg-[#0010d0] rounded-full transition-colors shadow-lg active:scale-98 flex items-center gap-2 cursor-pointer">
                                  <span>Send</span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} hidden multiple accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileInput} />

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
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendMessage();
                                  }
                                }}
                                placeholder="Type a message..."
                                className="w-full bg-[#F8F8F8] border border-transparent rounded-full py-3 pl-5 pr-20 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0012FF]/10 focus:border-[#0012FF]/20 transition-all"
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
              <Image src="/assets/lock-chat.webp" alt="Lock Chat" fill className="object-contain" />
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

      {/* Delete Chat Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] transition-opacity">
          <div className="bg-white rounded-[32px] p-8 max-w-[420px] w-full mx-4 relative flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowClearModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div className="mb-6 mt-4 w-[200px] h-[150px] relative">
              <Image src="/assets/lock-chat.webp" alt="Delete Chat" fill className="object-contain" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Chat?</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-[280px]">
              This will permanently delete this chat from your view.
            </p>
            <button
              onClick={handleClearChat}
              disabled={isClearingChat}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-full shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isClearingChat && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              <span>{isClearingChat ? 'Deleting...' : 'Delete Chat'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setLightboxMedia(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full z-[110]" onClick={() => setLightboxMedia(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          {lightboxMedia.type === 'image' && lightboxMedia.urls.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxMedia((prev) =>
                    prev
                      ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length }
                      : prev
                  );
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxMedia((prev) =>
                    prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev
                  );
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <span className="absolute bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                {lightboxMedia.index + 1} / {lightboxMedia.urls.length}
              </span>
            </>
          )}

          <div className="relative max-w-6xl max-h-[90vh] flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
            {lightboxMedia.type === 'image' ? (
              <img src={lightboxMedia.urls[lightboxMedia.index]} alt="Fullscreen Attachment" className="max-w-full max-h-full object-contain select-none drop-shadow-2xl rounded-sm" />
            ) : (
              <video controls autoPlay playsInline src={lightboxMedia.urls[0]} className="max-w-full max-h-full outline-none drop-shadow-2xl rounded-sm" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
