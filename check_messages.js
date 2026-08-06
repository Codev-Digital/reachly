const mongoose = require('mongoose');

// Manually load env variables from .env
const fs = require('fs');
const path = require('path');
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
        process.env[key] = value;
      }
    });
  }
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('No MONGODB_URI');
  process.exit(1);
}

mongoose.connect(MONGODB_URI).then(async () => {
  const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
  const msgs = await Message.find({}).sort({ createdAt: -1 }).limit(3).lean();
  console.log('Latest messages in database:', JSON.stringify(msgs, null, 2));
  process.exit(0);
});
