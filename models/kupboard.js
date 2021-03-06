const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;
const KupItem = require('./item');
const Announcement = require('./announcement');


const ScheduleSchema = new Schema({
    day: {
        type: String,
        required: true,
    },
    toDay: {
        type: String,
    },
    open: {
        type: String,
        required: true,
    },
    close: {
        type: String,
        required: true,
    },

    inKB: {
        type: String,
        required: true,
    }
});

/// User
const KBUserSchema = new Schema({
    kup: {
        type: Schema.Types.ObjectId,
        ref: 'Kupboard',
    },
    last: {
        type: Number,
        default: 0
    }
});
KBUserSchema.plugin(passportLocalMongoose, { populateFields: { path: 'kup', select: { _id: 1, userName: 1, name: 1 } } });

// Kupboard
const kupboardSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    img: {
        type: String,
        default: "/assets/_default_thumb.jpg",
    },
    alt: {
        type: String,
        default: "",
    },
    mast: {
        type: String,
        default: "/assets/_default_mast.jpg",
    },
    mastAlt: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    itemTypeCt: {
        type: Number,
        required: true,
    },
    hours: [{
        type: Schema.Types.ObjectId,
        ref: 'Schedule',
    }],
    details: {
        type: String,
        default: ""
    },
    share: {
        type: String,
        default: ""
    },
    userName: {
        type: String,
        required: true
    },
    userLastName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    inventory: [{
        type: Schema.Types.ObjectId,
        ref: 'KupItem',
    }],
    bulletins: [{
        type: Schema.Types.ObjectId,
        ref: 'Announcement',
    }],
    map: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'active'
    },
},
    { timestamps: true }
);


const Kupboard = mongoose.model('Kupboard', kupboardSchema);
const KBUser = mongoose.model('KBUser', KBUserSchema);
const Schedule = mongoose.model('Schedule', ScheduleSchema);
module.exports = { Kupboard, KBUser, Schedule };
