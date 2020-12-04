require('dotenv').config();

var express = require("express"),
bodyParser = require("body-parser"),
mongoose = require("mongoose"),
methodOverride = require("method-override"),
User = require("./models/user"),
flash = require("connect-flash"),
passport = require("passport"),
localStrategy = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
session = require('express-session'),
MongoStore = require('connect-mongo')(session);

// Requiring Routes
var indexRoutes = require("./routes/index");

// Connect to Database
var url = process.env.DATABASEURL || "mongodb://localhost:27017/voting_test"
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

mongoose.set('useFindAndModify', false);
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// Passport Configuration
app.use(session({
    secret: process.env.PASSPORTSECRET,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("SERVER LIVE!!!");
});