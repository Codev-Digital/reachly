import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb://pyrohassan786_db_user:4YYYN5ARKCKqF5N3@ac-3wbnxkp-shard-00-00.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-01.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-02.8oxzeex.mongodb.net:27017/?ssl=true&replicaSet=atlas-sthats-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(MONGODB_URI);

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: { type: String, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    isRegistrationComplete: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        const email = "abdullahgotaccess@gmail.com";
        const password = "abdoo10204";

        let user = await User.findOne({ email });
        
        if (user) {
            console.log("User already exists, updating password and setting verified flags.");
        } else {
            user = new User({ email, name: "Admin Abdullah" });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.isVerified = true;
        user.isRegistrationComplete = true;
        user.onboardingStep = 0;
        
        await user.save();
        console.log("Admin user created/updated successfully.");
    } catch (err) {
        console.error("Error creating user:", err);
    } finally {
        mongoose.disconnect();
    }
}

run();
