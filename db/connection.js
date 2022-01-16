const mongoose = require('mongoose');
const colors = require('colors');

module.exports = {
  connect: () => {
    console.log('connecting...');
    mongoose.connect(`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASS}@${process.env.MONGO_IP}:27017/${process.env.MONGO_DB}?authSource=admin&w=1`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      console.log('mongoose:'.yellow+" connected to db.".green);
    }).catch(err => {
      console.error(err);
      process.exit();
    });
  }
}