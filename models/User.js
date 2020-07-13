const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        requred: true
    },
    email : {
        type: String,
        requred: true,
        unique: true
    },
    password: {
        type: String,
        requred: true
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = user = mongoose.model('user', UserSchema);