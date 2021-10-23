const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queueSchema = new Schema({
  user: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }],
  notificationsQueue: {
    type: Array
  },
  uuid: {
    type: String,
    required: true,
    default: uuid.v4()
  }
});

module.exports = mongoose.model('Queue');