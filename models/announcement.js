const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
    comID: {
        type: String,
        required: true
    },
    inKB: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    text: {
        type: String,
        default: ""
    },
},
    { timestamps: true }
);

const Announcement = mongoose.model('Announcement', AnnouncementSchema);
module.exports.Announcement;