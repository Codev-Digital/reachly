const mongoose = require('mongoose');

async function fix() {
    await mongoose.connect('mongodb://pyrohassan786_db_user:4YYYN5ARKCKqF5N3@ac-3wbnxkp-shard-00-00.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-01.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-02.8oxzeex.mongodb.net:27017/reachly?ssl=true&replicaSet=atlas-sthats-shard-0&authSource=admin&appName=Cluster0');
    
    const bookings = await mongoose.connection.collection('bookings').find({}).toArray();
    let count = 0;
    for (const b of bookings) {
        if (b.scheduledDate) {
            let d = new Date(b.scheduledDate);
            // Check if it's shifted (not exactly at UTC midnight)
            if (d.getUTCHours() !== 0) {
                // In PKT (+5), midnight local is 19:00 UTC the previous day.
                // Add 5 hours to get to intended UTC midnight.
                d.setUTCHours(d.getUTCHours() + 5);
                const utcMidnight = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
                
                await mongoose.connection.collection('bookings').updateOne(
                    { _id: b._id },
                    { $set: { scheduledDate: utcMidnight } }
                );
                count++;
            }
        }
    }
    console.log('Fixed DB timezone shifts: ' + count + ' records updated.');
    process.exit(0);
}

fix().catch(console.error);
