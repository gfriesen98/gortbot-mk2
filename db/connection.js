const mongoose = require('mongoose');
const colors = require('colors');
const connection = `mongodb://gortbot:${process.env.DB_PASS}@${process.env.MONGO_IP}:27017/gortbot?authSource=admin&retryWrites=true&w=majority`;
const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(connection, opts, (err) => {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log('mongoose:'.yellow+" Connected to DB.".green);
  }
})