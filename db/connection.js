const mongoose = require('mongoose');
const connection = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASS}@${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin&retryWrites=true&w=majority`;
const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(connection, opts, (err) => {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log("Connected to DB.");
  }
})