var express = require('express');
var signinRouter = express.Router();
var signoutRouter = express.Router();
const kupboardModule = require('../models/kupboard');
const KBUser = kupboardModule.KBUser;
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');


signinRouter.route('/')
    .options(/*cors.corsWithOptions,*/(req, res) => res.sendStatus(200))
    .post(/*cors.corsWithOptions,*/ passport.authenticate('local'), (req, res) => {
        const token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            token: token,
            status: 'You are successfully logged in!',
            kupName: req.user.kup.name,
            kupId: req.user.kup._id,
            userName: req.user.kup.userName
        });
    })
    .get(/*cors.corsWithOptions,*/ authenticate.verifyUser, (req, res) => {
        KBUser.find(req.user._id).populate('kup', 'name userEmail userName')
            .then(user => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user);
            });
    })
    .all(/*cors.cors,*/(req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });

signoutRouter.route('/')
    .options(/*cors.corsWithOptions,*/(req, res) => res.sendStatus(200))
    .get(/*cors.corsWithOptions,*/ authenticate.verifyUser, (req, res, next) => {
        KBUser.findByIdAndUpdate(req.user._id, { last: Math.floor(Date.now() / 1000) })
            .then(() => {
                if (req.session) {
                    req.session.destroy();
                    res.clearCookie('session-id');
                }
                res.setHeader('Content-Type', 'text/html');
                res.statusCode = 200;
                res.end('See you later.')
            })
            .catch(err => {
                err.status = 401;
                return next(err);
            });
    })
    .all(/*cors.cors,*/(req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });


module.exports = { signinRouter, signoutRouter };