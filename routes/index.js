var express = require("express");
var router = express.Router();
var passport = require("passport");
var middleware = require("../middleware/index");
var User = require("../models/user");
var async = require("async");
const { check, validationResult } = require('express-validator');

// Root Route
router.get("/", middleware.isLoggedIn, function(req, res){
    res.render("index");
});

// Show signup form
router.get("/register", function(req, res){
    var errors = {};
    res.render("register", { errors });
});

// Handle signup
router.post("/register", middleware.registerValidation, (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render("register", { errors: errors.mapped() });
    }
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
    });
    if(req.body.password === process.env.ADMIN_KEY){
        newUser.isAdmin = true;
    };
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            req.flash("error", err.message);
            return res.redirect('register');
        } passport.authenticate("local")(req, res, () => {
            req.flash("success", `Welcome to Boar's Gluttony ${user.username[0].toUpperCase() + user.username.substring(1)}`);
            res.redirect("/");
        });
    });
});

// Show login form
router.get("/login", function(req, res){
    var errors = {};
    res.render("login", { errors });
});

// Handle login
router.post("/login", middleware.loginValidation, middleware.handleLoginValidation, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function(req, res){
});

/*// Handle logout
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});*/

module.exports = router