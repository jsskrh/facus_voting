var User = require("../models/user");
const { check, validationResult } = require('express-validator');

// all the middleware goes here
var middlewareObj = {};

middlewareObj.registerValidation = [
    check('username', 'Username is not valid.')
        .exists()
        .bail()
        .notEmpty().withMessage('Value cannot be blank.')
        .bail()
        .isLength({ min: 5, max: 16 }).withMessage('Must be at least 5 characters long.')
        .bail()
        .custom(value => {
            return User.findOne({ username: value }).then(user => {
                if (user) {
                    return Promise.reject('Username already in use.');
                }
            })
        }),
    check('password')
        .exists()
        .bail()
        .notEmpty().withMessage('Value cannot be blank.')
        .bail()
        .isLength({ min: 5, max: 16 }).withMessage('Must be at least 5 characters long'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match.');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),
    check('termsAndConditions', 'Box must be checked.').notEmpty()
]

middlewareObj.loginValidation = [
    check('username', 'Username cannot be empty.').notEmpty(),
    check('password', 'Password cannot be empty.').notEmpty()
]

middlewareObj.handleLoginValidation = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render("login", { errors: errors.mapped() });
    }
    next();
}

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.isAdmin = (req, res, next) => {
    if(req.user.isAdmin){
        return next();
    }
    req.flash("error", "You ncannot to do that");
    res.redirect("/");
}

middlewareObj.isCurrentUser = (req, res, next) => {
    if(req.params.username == req.user.username) {
        next();
    } else {
        req.flash("error", "You don't have permission to do that");
        res.redirect("back");
    }
}

module.exports = middlewareObj;