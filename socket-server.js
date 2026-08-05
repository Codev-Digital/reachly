const WebSocket = require('ws');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables from .env file manually
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
    console.log('Loaded env variables from .env');
  }
} catch (e) {
  console.error('Error loading .env file:', e);
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
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isLocked: { type: Boolean, default: true },
  },
  { timestamps: true }
);
ConversationSchema.index({ creatorId: 1, userId: 1 }, { unique: true });
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['creator', 'user'], required: true },
    content: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

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
        const { conversationId, senderId, senderRole, content } = data;
        if (!conversationId || !senderId || !senderRole || !content) {
          console.warn('Invalid message structure:', data);
          return;
        }

        // Check conversation lock status
        try {
          const conv = await Conversation.findById(conversationId).exec();
          if (conv && senderRole === 'user' && conv.isLocked) {
            console.log(`Message blocked: Conversation ${conversationId} is locked.`);
            return;
          }
        } catch (dbErr) {
          console.error('Error verifying conversation lock status:', dbErr);
        }

        const roomClients = rooms.get(conversationId);
        const isRead = roomClients && roomClients.size > 1;

        // Save to DB
        const newMsg = new Message({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          senderId: new mongoose.Types.ObjectId(senderId),
          senderRole,
          content,
          read: isRead,
        });
        await newMsg.save();

        // Update conversation updatedAt so it bubbles to top
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        console.log('Message saved to DB:', newMsg._id);

        // Broadcast
        if (roomClients) {
          const payload = JSON.stringify({
            type: 'message',
            message: {
              id: newMsg._id.toString(),
              conversationId,
              senderId,
              senderRole,
              content,
              read: isRead,
              createdAt: newMsg.createdAt,
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
