var mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose");

//set schema
var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);