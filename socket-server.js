const WebSocket = require('ws');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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
const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });
console.log(`WebSocket server starting on port ${PORT}...`);

// Rooms keyed by conversationId
const rooms = new Map(); // conversationId -> Set of sockets

wss.on('connection', (ws) => {
  let currentConversationId = null;
  console.log('New client connected');

  ws.on('message', async (messageData) => {
    try {
      const data = JSON.parse(messageData);
      console.log('Received message:', data);

      // ── JOIN ──────────────────────────────────────────────────────────────
      if (data.type === 'join') {
        const { conversationId, senderRole } = data;
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

        // The frontend already prevents users from sending messages if the chat is locked.
        // Bypassing the DB check here ensures instant delivery for both creators and users.

        const roomClients = rooms.get(conversationId);
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
        const { conversationId, senderRole, isTyping } = data;
        const roomClients = rooms.get(conversationId);
        if (roomClients) {
          roomClients.forEach(client => {
            // Send typing notification to everyone in the room except the sender
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'typing', conversationId, senderRole, isTyping }));
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
