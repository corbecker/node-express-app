const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'Logged in.'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged out.');
    res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
        return;
    }
    req.flash('error', 'You must be logged in.');
    res.redirect('/login');
};

exports.forgot = async(req, res) => {
    // Does user exist?
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        req.flash('success', 'Password reset sent.')
        return res.redirect('/login');
    }
    // Reset tokens & expiry
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 36000000;
    await user.save();
    // Send email with token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    req.flash('success', `Password reset link: ${resetURL}`);
    // Redirect to login
    res.redirect('/login');
}

exports.reset = async(req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Invalid token.');
        return res.redirect('/login');
    }
    res.render('reset', { title: 'Reset Password' });
};

exports.passwordsMatch = (req, res, next) => {
    if (req.body.password === req.body['confirm-password']) {
        next();
        return;
    }
    req.flash('error', "Passwords don't match");
}

exports.update = async(req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Invalid token.');
        return res.redirect('/login');
    }
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('Success', 'Password updated.');
    res.redirect('/');
}