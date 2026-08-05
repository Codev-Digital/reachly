/**
 * Migration script: Create Conversation documents for all existing creator-user booking pairs
 * and link their messages to the new conversationId.
 *
 * Run once: node migrate-conversations.js
 * Then delete this file.
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load env
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
  }
} catch (e) { console.error('Error loading .env:', e); }

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

// Schemas
const BookingSchema = new mongoose.Schema({
  creatorId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  isLocked: Boolean,
}, { collection: 'bookings' });

const ConversationSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isLocked: { type: Boolean, default: true },
}, { timestamps: true, collection: 'conversations' });
ConversationSchema.index({ creatorId: 1, userId: 1 }, { unique: true });

const MessageSchema = new mongoose.Schema({
  bookingId: mongoose.Schema.Types.ObjectId,
  conversationId: mongoose.Schema.Types.ObjectId,
  senderId: mongoose.Schema.Types.ObjectId,
  senderRole: String,
  content: String,
  read: Boolean,
}, { timestamps: true, collection: 'messages' });

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const Booking = mongoose.model('Booking', BookingSchema);
  const Conversation = mongoose.model('Conversation', ConversationSchema);
  const Message = mongoose.model('Message', MessageSchema);

  // 1. Get all bookings that have at least one message
  const bookingsWithMessages = await Message.distinct('bookingId');
  console.log(`Found ${bookingsWithMessages.length} bookings with messages`);

  let conversationsCreated = 0;
  let messagesUpdated = 0;

  for (const bookingId of bookingsWithMessages) {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking || !booking.userId) {
      console.log(`  Skipping bookingId ${bookingId}: no userId`);
      continue;
    }

    const { creatorId, userId, isLocked } = booking;

    // 2. Upsert conversation for this creator-user pair
    let conv = await Conversation.findOneAndUpdate(
      { creatorId, userId },
      {
        $setOnInsert: {
          creatorId,
          userId,
          // Use unlocked if the booking was already unlocked
          isLocked: isLocked === false ? false : true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If the booking was explicitly unlocked and conv is still locked, unlock it
    if (isLocked === false && conv.isLocked !== false) {
      conv.isLocked = false;
      await conv.save();
    }

    conversationsCreated++;
    console.log(`  Conversation ${conv._id} for creator ${creatorId} <-> user ${userId}`);

    // 3. Update all messages for this bookingId to also set conversationId
    const result = await Message.updateMany(
      { bookingId: new mongoose.Types.ObjectId(bookingId.toString()), conversationId: { $exists: false } },
      { $set: { conversationId: conv._id } }
    );
    messagesUpdated += result.modifiedCount;
    console.log(`    → Updated ${result.modifiedCount} messages`);
  }

  // 4. Also create conversations for bookings that exist between creator-user pairs,
  //    even if they have no messages yet (so new bookings work)
  const allBookingsWithUsers = await Booking.find({ userId: { $exists: true, $ne: null } })
    .distinct('_id');
  console.log(`\nFound ${allBookingsWithUsers.length} total bookings with registered users`);

  const allBookings = await Booking.find({ userId: { $exists: true, $ne: null } }).lean();
  const pairs = new Map();
  for (const b of allBookings) {
    const key = `${b.creatorId}-${b.userId}`;
    if (!pairs.has(key)) {
      pairs.set(key, { creatorId: b.creatorId, userId: b.userId, isLocked: b.isLocked });
    } else if (b.isLocked === false) {
      // If any booking for this pair is unlocked, conversation is unlocked
      pairs.get(key).isLocked = false;
    }
  }

  for (const [key, { creatorId, userId, isLocked }] of pairs) {
    await Conversation.findOneAndUpdate(
      { creatorId, userId },
      {
        $setOnInsert: {
          creatorId,
          userId,
          isLocked: isLocked === false ? false : true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Conversations processed: ${conversationsCreated}`);
  console.log(`   Messages updated: ${messagesUpdated}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
