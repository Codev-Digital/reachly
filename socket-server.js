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
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
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

// Define Message Schema
const MessageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['creator', 'user'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// 3. Start WebSocket Server
const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });
console.log(`WebSocket server starting on port ${PORT}...`);

// Keep track of active connections grouped by bookingId
const rooms = new Map(); // bookingId -> Set of sockets

wss.on('connection', (ws) => {
  let currentBookingId = null;
  console.log('New client connected');

  ws.on('message', async (messageData) => {
    try {
      const data = JSON.parse(messageData);
      console.log('Received message:', data);

      if (data.type === 'join') {
        const { bookingId, senderRole } = data;
        if (!bookingId) return;
        
        currentBookingId = bookingId;
        if (!rooms.has(bookingId)) {
          rooms.set(bookingId, new Set());
        }
        const roomClients = rooms.get(bookingId);
        roomClients.add(ws);
        console.log(`Client joined room: ${bookingId}`);
        
        // Confirm join
        ws.send(JSON.stringify({ type: 'joined', bookingId }));

        // Mark messages as read in DB if the sender of those messages is different
        if (senderRole) {
          const senderRoleToMarkRead = senderRole === 'creator' ? 'user' : 'creator';
          try {
            await Message.updateMany(
              { bookingId: new mongoose.Types.ObjectId(bookingId), senderRole: senderRoleToMarkRead, read: false },
              { $set: { read: true } }
            );
            console.log(`Marked messages as read for room: ${bookingId}`);
          } catch (e) {
            console.error('Error marking messages as read:', e);
          }
        }

        // Broadcast room size (presence) to everyone in the room
        const count = roomClients.size;
        roomClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'presence', bookingId, count }));
            // If they are both in the room, send a read receipt event to mark ticks as blue
            if (count > 1) {
              client.send(JSON.stringify({ type: 'read_receipt', bookingId }));
            }
          }
        });
      } 
      
      else if (data.type === 'message') {
        const { bookingId, senderId, senderRole, content } = data;
        if (!bookingId || !senderId || !senderRole || !content) {
          console.warn('Invalid message structure:', data);
          return;
        }

        // Database-level check: block users from messaging if booking is locked
        try {
          const booking = await mongoose.models.Booking.findById(bookingId).exec();
          if (booking && senderRole === 'user') {
            const hasMessages = await Message.exists({ bookingId: new mongoose.Types.ObjectId(bookingId) });
            const isLocked = booking.isLocked !== undefined ? booking.isLocked : !hasMessages;
            if (isLocked) {
              console.log(`Message blocked: Chat room ${bookingId} is locked.`);
              return;
            }
          }
        } catch (dbErr) {
          console.error('Error verifying booking lock status in DB:', dbErr);
        }

        const roomClients = rooms.get(bookingId);
        const isRead = roomClients && roomClients.size > 1;

        // 1. Save to Database
        const newMsg = new Message({
          bookingId: new mongoose.Types.ObjectId(bookingId),
          senderId: new mongoose.Types.ObjectId(senderId),
          senderRole,
          content,
          read: isRead
        });
        await newMsg.save();
        console.log('Message saved to DB:', newMsg._id);

        // 2. Broadcast to everyone in the room
        if (roomClients) {
          const payload = JSON.stringify({
            type: 'message',
            message: {
              id: newMsg._id.toString(),
              bookingId,
              senderId,
              senderRole,
              content,
              read: isRead,
              createdAt: newMsg.createdAt
            }
          });

          roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(payload);
            }
          });
        }
      }
      
      else if (data.type === 'lock_status') {
        const { bookingId, isLocked } = data;
        const roomClients = rooms.get(bookingId);
        if (roomClients) {
          roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'lock_status', bookingId, isLocked }));
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
    if (currentBookingId && rooms.has(currentBookingId)) {
      const roomClients = rooms.get(currentBookingId);
      roomClients.delete(ws);
      const count = roomClients.size;
      if (count === 0) {
        rooms.delete(currentBookingId);
      } else {
        // Broadcast new size to remaining clients
        roomClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'presence', bookingId: currentBookingId, count }));
          }
        });
      }
      console.log(`Client left room: ${currentBookingId}`);
    }
  });
});
