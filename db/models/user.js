const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModel = new Schema({
    uid: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    team: {
        type: Array,
        default: []
    },
    latestBattle: {
        type: String
    }
});

module.exports = mongoose.model('users', userModel);