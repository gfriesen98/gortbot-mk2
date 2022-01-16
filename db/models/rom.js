const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const romModel = new Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    filesize: {
        type: String,
        required: true
    }

});
romModel.statics.searchPartial = function(q, cb) {
    return this.find({
        $or: [
            {"name": new RegExp(q, "gi")},
            {"category": new RegExp(q, "gi")}
        ]
    }, cb);
}

romModel.statics.searchFull = function(q, cb) {
    return this.find({
        $text: {$search: q, $caseSensitive: false}
    }, cb);
}

romModel.statics.search = function(q, cb) {
    this.searchFull(q, (err, data) => {
        if (err) return cb(err, data);
        if (!err && data.length) return cb(err, data);
        if (!err && data.length === 0) return this.searchPartial(q, cb)
    });
}

module.exports = mongoose.model("stuffs", romModel);