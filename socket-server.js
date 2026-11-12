const WebSocket = require('ws');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { evaluateConversationBookingState } = require('./src/lib/chatSessionState');

// 1. Load Environment Variables from .env and .env.local manually
try {
  ['.env', '.env.local'].forEach(file => {
    const envPath = path.join(__dirname, file);
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          let value = parts.slice(1).join('=').trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
      console.log(`Loaded env variables from ${file}`);
    }
  });
} catch (e) {
  console.error('Error loading env file:', e);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined in environment or .env!');
  process.exit(1);
}

// 2. Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('WebSocket server connected to MongoDB successfully.'))
  .catch(err => {
    console.error('Failed to connect MongoDB:', err);
    process.exit(1);
  });

// --- Schemas ---

const ConversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['dm', 'broadcast'], default: 'dm' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    title: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    isLocked: { type: Boolean, default: true },
    muteAll: { type: Boolean, default: false },
    mutedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);
ConversationSchema.index(
  { creatorId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { eventId: null } }
);
ConversationSchema.index({ eventId: 1 }, { unique: true, sparse: true });
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['creator', 'user'], required: true },
    content: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    attachment: {
      url: String,
      fileType: String,
      fileName: String,
      fileSize: Number
    },
    attachments: [{
      url: String,
      fileType: String,
      fileName: String,
      fileSize: Number
    }],
  },
  { timestamps: true }
);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// Lightweight read models for sender display (broadcast joiners)
const UserLite =
  mongoose.models.User ||
  mongoose.model(
    'User',
    new mongoose.Schema({
      name: String,
      profilePhoto: String,
      lastActiveAt: Date,
    })
  );
const CreatorProfileLite =
  mongoose.models.CreatorProfile ||
  mongoose.model(
    'CreatorProfile',
    new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      displayName: String,
      username: String,
      profilePhoto: String,
    })
  );
const SessionTypeLite =
  mongoose.models.SessionType ||
  mongoose.model(
    'SessionType',
    new mongoose.Schema({
      duration: Number,
      title: String,
    })
  );
const BookingLite =
  mongoose.models.Booking ||
  mongoose.model(
    'Booking',
    new mongoose.Schema(
      {
        creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sessionTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SessionType' },
        scheduledDate: Date,
        scheduledTime: String,
        status: String,
        paymentStatus: String,
        meetingEndsAt: Date,
        meetingEndedAt: Date,
      },
      { timestamps: true }
    )
  );

async function resolveSenderProfile(senderId, senderRole) {
  try {
    // Joiners: User name/photo. Creators: CreatorProfile then User.
    if (senderRole === 'user') {
      const user = await UserLite.findById(senderId).select('name profilePhoto').lean();
      return {
        senderName: user?.name || 'User',
        senderAvatar: user?.profilePhoto || '/avatar.png',
      };
    }
    const [user, creatorProfile] = await Promise.all([
      UserLite.findById(senderId).select('name profilePhoto').lean(),
      CreatorProfileLite.findOne({ userId: senderId })
        .select('displayName username profilePhoto')
        .lean(),
    ]);
    const name =
      creatorProfile?.displayName ||
      creatorProfile?.username ||
      user?.name ||
      'Creator';
    const avatar =
      creatorProfile?.profilePhoto || user?.profilePhoto || '/avatar.png';
    return { senderName: name, senderAvatar: avatar };
  } catch (err) {
    console.error('resolveSenderProfile error:', err);
    return {
      senderName: senderRole === 'creator' ? 'Creator' : 'User',
      senderAvatar: '/avatar.png',
    };
  }
}

// 3. Start WebSocket Server
const PORT = Number(process.env.WS_PORT) || 3001;
const wss = new WebSocket.Server({ port: PORT });
console.log(`WebSocket server starting on port ${PORT}...`);

// Rooms keyed by conversationId
const rooms = new Map(); // conversationId -> Set of sockets
// Connected sockets keyed by userId for global inbox presence
const onlineSocketsByUser = new Map(); // userId -> Set of sockets

function registerUserSocket(ws, userId) {
  if (!userId) return;
  const uid = String(userId);
  if (ws._userId && ws._userId === uid) return;
  ws._userId = uid;

  if (!onlineSocketsByUser.has(uid)) {
    onlineSocketsByUser.set(uid, new Set());
  }
  const userSockets = onlineSocketsByUser.get(uid);
  const wasOffline = userSockets.size === 0;
  userSockets.add(ws);

  if (mongoose.isValidObjectId(uid)) {
    UserLite.updateOne({ _id: uid }, { $set: { lastActiveAt: new Date() } }).catch(() => {});
  }

  if (wasOffline) {
    const payload = JSON.stringify({ type: 'user_presence', userId: uid, isOnline: true });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'presence_snapshot',
        onlineUserIds: Array.from(onlineSocketsByUser.keys()),
      })
    );
  }
}

wss.on('connection', (ws) => {
  let currentConversationId = null;
  console.log('New client connected');

  ws.on('message', async (messageData) => {
    try {
      const data = JSON.parse(messageData);
      console.log('Received message:', data);

      // ── PRESENCE HELLO (global online tracking without joining a room) ─────
      if (data.type === 'presence_hello') {
        if (data.userId) registerUserSocket(ws, data.userId);
        return;
      }

      // ── JOIN ──────────────────────────────────────────────────────────────
      if (data.type === 'join') {
        const { conversationId, senderRole, userId } = data;
        if (userId) registerUserSocket(ws, userId);
        if (!conversationId) return;

        currentConversationId = conversationId;
        if (!rooms.has(conversationId)) rooms.set(conversationId, new Set());
        const roomClients = rooms.get(conversationId);
        roomClients.add(ws);
        console.log(`Client joined room: ${conversationId}`);

        ws.send(JSON.stringify({ type: 'joined', conversationId }));

        // Mark messages as read
        if (senderRole) {
          const senderRoleToMarkRead = senderRole === 'creator' ? 'user' : 'creator';
          try {
            await Message.updateMany(
              { conversationId: new mongoose.Types.ObjectId(conversationId), senderRole: senderRoleToMarkRead, read: false },
              { $set: { read: true } }
            );
            console.log(`Marked messages as read for conversation: ${conversationId}`);
          } catch (e) {
            console.error('Error marking messages as read:', e);
          }
        }

        // Broadcast presence
        const count = roomClients.size;
        roomClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'presence', conversationId, count }));
            if (count > 1) {
              client.send(JSON.stringify({ type: 'read_receipt', conversationId }));
            }
          }
        });
      }

      // ── MESSAGE ───────────────────────────────────────────────────────────
      else if (data.type === 'message') {
        const { conversationId, senderId, senderRole, content, tempId } = data;
        if (!conversationId || !senderId || !senderRole || !content) {
          console.warn('Invalid message structure:', data);
          return;
        }

        const roomClients = rooms.get(conversationId);

        // Enforce mute/lock for users, and cancelled-session / expired-deadline DM guards for both users and creators
        try {
          const conv = await Conversation.findById(conversationId)
            .select('type muteAll mutedUserIds isLocked creatorId userId')
            .lean();
          if (conv) {
            let rejectionReason = null;

            if (senderRole === 'user') {
              const mutedIds = (conv.mutedUserIds || []).map((id) => id.toString());
              const isMuted =
                conv.type === 'broadcast' &&
                (Boolean(conv.muteAll) || mutedIds.includes(String(senderId)));
              rejectionReason = isMuted ? 'muted' : conv.isLocked ? 'locked' : null;
            }

            if (!rejectionReason && conv.type !== 'broadcast' && conv.creatorId) {
              const targetUserId = conv.userId || (senderRole === 'user' ? senderId : null);
              if (targetUserId) {
                const pairBookings = await BookingLite.find({
                  creatorId: conv.creatorId,
                  userId: targetUserId,
                })
                  .select('status paymentStatus scheduledDate scheduledTime meetingEndsAt meetingEndedAt sessionTypeId')
                  .populate({ path: 'sessionTypeId', model: SessionTypeLite, select: 'duration title' })
                  .lean();

                const bookingState = evaluateConversationBookingState(pairBookings);
                if (bookingState.isCancelled) {
                  rejectionReason = 'cancelled';
                } else if (bookingState.isDeadlinePassed) {
                  rejectionReason = 'deadline_passed';
                }
              }
            }

            if (rejectionReason) {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'message_rejected',
                    conversationId,
                    tempId: tempId || data.tempId || undefined,
                    reason: rejectionReason,
                  })
                );
              }
              return;
            }
          }
        } catch (muteErr) {
          console.error('Chat guard check error:', muteErr);
        }

        const isRead = roomClients && roomClients.size > 1;

        const attachments = Array.isArray(data.attachments) && data.attachments.length
          ? data.attachments
          : (data.attachment ? [data.attachment] : undefined);
        const attachment = attachments?.[0] || data.attachment || undefined;

        const newMsg = new Message({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          senderId: new mongoose.Types.ObjectId(senderId),
          senderRole,
          content,
          read: isRead,
          attachment,
          attachments,
        });

        // Persist immediately — never block DB save on profile lookup (that was dropping messages)
        Promise.all([
          newMsg.save(),
          Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() })
        ]).then(() => {
          console.log('Message saved to DB:', newMsg._id);
        }).catch(dbErr => {
          console.error('Error saving message to DB:', dbErr);
        });

        // Broadcast quickly; don't stall delivery if profile lookup is slow
        const fallbackProfile = {
          senderName: senderRole === 'creator' ? 'Creator' : 'User',
          senderAvatar: '/avatar.png',
        };
        const { senderName, senderAvatar } = await Promise.race([
          resolveSenderProfile(senderId, senderRole),
          new Promise((resolve) => setTimeout(() => resolve(fallbackProfile), 400)),
        ]);

        if (roomClients) {
          const payload = JSON.stringify({
            type: 'message',
            message: {
              id: newMsg._id.toString(),
              conversationId,
              senderId,
              senderRole,
              senderName,
              senderAvatar,
              content,
              read: isRead,
              createdAt: new Date().toISOString(),
              attachment,
              attachments,
              tempId: tempId || data.tempId || undefined,
            },
          });
          roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(payload);
          });
        }
      }

      // ── LOCK STATUS ───────────────────────────────────────────────────────
      else if (data.type === 'lock_status') {
        const { conversationId, isLocked } = data;
        const roomClients = rooms.get(conversationId);
        if (roomClients) {
          roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'lock_status', conversationId, isLocked }));
            }
          });
        }
      }

      // ── MUTE STATUS ───────────────────────────────────────────────────────
      else if (data.type === 'mute_status') {
        const { conversationId, muteAll, mutedUserIds } = data;
        const roomClients = rooms.get(conversationId);
        if (roomClients) {
          roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'mute_status',
                  conversationId,
                  muteAll: Boolean(muteAll),
                  mutedUserIds: Array.isArray(mutedUserIds) ? mutedUserIds : [],
                })
              );
            }
          });
        }
      }

      // ── CHAT CLEARED ───────────────────────────────────────────────────────
      else if (data.type === 'chat_cleared') {
        const { conversationId } = data;
        const roomClients = rooms.get(conversationId);
        if (roomClients) {
          roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'chat_cleared', conversationId }));
            }
          });
        }
      }

      // ── TYPING STATUS ──────────────────────────────────────────────────────
      else if (data.type === 'typing') {
        const { conversationId, senderRole, isTyping, senderId, senderName, senderAvatar } = data;
        const roomClients = rooms.get(conversationId);
        if (roomClients) {
          roomClients.forEach(client => {
            // Send typing notification to everyone in the room except the sender
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'typing',
                conversationId,
                senderRole,
                senderId: senderId || null,
                senderName: senderName || (senderRole === 'creator' ? 'Creator' : 'User'),
                senderAvatar: senderAvatar || '/avatar.png',
                isTyping: Boolean(isTyping),
              }));
            }
          });
        }
      }
    } catch (err) {
      console.error('Error handling websocket message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws._userId && onlineSocketsByUser.has(ws._userId)) {
      const userSockets = onlineSocketsByUser.get(ws._userId);
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        onlineSocketsByUser.delete(ws._userId);
        const offlinePayload = JSON.stringify({
          type: 'user_presence',
          userId: ws._userId,
          isOnline: false,
        });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(offlinePayload);
          }
        });
      }
    }
    if (currentConversationId && rooms.has(currentConversationId)) {
      const roomClients = rooms.get(currentConversationId);
      roomClients.delete(ws);
      const count = roomClients.size;
      if (count === 0) {
        rooms.delete(currentConversationId);
      } else {
        roomClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'presence', conversationId: currentConversationId, count }));
          }
        });
      }
      console.log(`Client left room: ${currentConversationId}`);
    }
  });
});
