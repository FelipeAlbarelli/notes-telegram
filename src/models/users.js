const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username : {
        type : String
    },
    telegramId : {
        type : Number,
        required : true,
        unique : true
    },
    name : {
        type : String
    }
})

const User = mongoose.model("User" , userSchema);

module.exports = User