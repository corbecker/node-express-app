const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register' });
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must provide a name.').notEmpty();
    req.checkBody('email', 'Not a valid email addredd').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password cannot be empty.').notEmpty();
    req.checkBody('confirm-password', 'Confirm password cannot be empty').notEmpty();
    req.checkBody('confirm-password', 'Passwords do not match.').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    }
    next();
};

exports.register = async(req, res, next) => {
    const user = new User({ email: req.body.email, name: req.body.name });
    const promisifiedRegister = promisify(User.register, User);
    await promisifiedRegister(user, req.body.password);
    next();
}