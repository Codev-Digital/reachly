import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://pyrohassan786_db_user:4YYYN5ARKCKqF5N3@ac-3wbnxkp-shard-00-00.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-01.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-02.8oxzeex.mongodb.net:27017/?ssl=true&replicaSet=atlas-sthats-shard-0&authSource=admin&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error('Please set MONGODB_URI in your environment or update this script with your connection string.');
}

const UserSchema = new mongoose.Schema(
  {
    email: String,
    onboardingStep: Number,
    approvalStatus: String,
  },
  { strict: false }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ onboardingStep: 7 }).select('email approvalStatus onboardingStep');
    console.log(`Found ${users.length} user(s) with onboardingStep 7.`);

    if (users.length === 0) {
      return;
    }

    users.forEach((user) => {
      console.log(`- ${user.email || '<no-email>'} current approvalStatus=${user.approvalStatus ?? 'missing'}`);
    });

    const result = await User.updateMany(
      { onboardingStep: 7 },
      { $set: { approvalStatus: 'approved' } }
    );

    console.log(`Updated ${result.modifiedCount ?? result.nModified ?? 0} user(s) to approvalStatus='approved'.`);
  } catch (err) {
    console.error('Error updating users:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();
