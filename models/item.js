const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KupItemSchema = new Schema({
    inKB: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        default: "An Item"
    },
    req: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    qty: {
        type: Number,
        default: 1
    }
});

const KupItem = mongoose.model('KupItem', KupItemSchema);
module.exports = KupItem;