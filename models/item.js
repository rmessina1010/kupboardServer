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
    sortName: {
        type: String,
        default: "an item"
    },
    req: {
        type: Boolean,
        default: false
    },
    act: {
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