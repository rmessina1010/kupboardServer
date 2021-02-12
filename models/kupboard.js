const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ScheduleSchema = new Schema({
    day: {
        type: String,
        required: true,
    },
    toDay: {
        type: String,
        default: "",
    },
    open: {
        type: String,
        required: true,
    },
    close: {
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
    password: {
        type: String,
        required: true
    },
});


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
    hours: [ScheduleSchema],
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
    map: {
        type: Boolean,
        default: true
    },
},
    { timestamps: true }
);


const Kupboard = mongoose.model('Kupboard', kupboardSchema);
const KBUser = mongoose.model('KBUser', KBUserSchema);
module.exports = { Kupboard, KBUser };
