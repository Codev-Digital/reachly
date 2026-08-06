const mongoose = require('mongoose');
mongoose.connect('mongodb://pyrohassan786_db_user:4YYYN5ARKCKqF5N3@ac-3wbnxkp-shard-00-00.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-01.8oxzeex.mongodb.net:27017,ac-3wbnxkp-shard-00-02.8oxzeex.mongodb.net:27017/?ssl=true&replicaSet=atlas-sthats-shard-0&authSource=admin&appName=Cluster0')
  .then(async () => {
    const db = mongoose.connection.db;
    const notifications = await db.collection('notifications').find().sort({_id: -1}).limit(5).toArray();
    console.log(JSON.stringify(notifications, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
