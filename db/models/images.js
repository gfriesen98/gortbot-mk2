const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageModel = new Schema({
    name: {
        type: String,
    },
    path: {
        type: String,
    },
    filesize: {
        type: String
    }
});

imageModel.statics.random = function(cb) {
    this.count(function(err, count) {
        if (err) return cb(err);
        let r = Math.floor(Math.random() * count);
        this.findOne().skip(r).exec(cb);
    }.bind(this));
}

module.exports = mongoose.model("images", imageModel);