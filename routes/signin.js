var express = require('express');
var loginRouter = express.Router();
const kupboardModule = require('../models/kupboard');
const KBUser = kupboardModule.KBUser;
const passport = require('passport');

loginRouter
    .post('/signin', passport.authenticate('local'), (req, res) => {
        const token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            token: token,
            status: 'You are successfully logged in!',
            userName: '',
            kupName: '',
            kupId: '',
        });
    })
    .all('/login', (req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });

loginRouter.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
}).all('/logout', (req, res) => {
    res.statusCode = 405;
    res.end(req.method + ' operation not supported.');
});


module.exports = loginRouter;