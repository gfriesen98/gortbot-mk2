const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const grievanceModel = new Schema({
    user: {
        type: Schema.Types.ObjectId, ref: 'users',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        immutable: true,
        default: Date.now()
    }
});

module.exports = mongoose.model("grievances", grievanceModel);