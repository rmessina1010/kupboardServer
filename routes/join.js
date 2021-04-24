var express = require('express');
var joinRouter = express.Router();
const kupboardModule = require('../models/kupboard');
const Kupboard = kupboardModule.Kupboard;
const KBUser = kupboardModule.KBUser;
const passport = require('passport');
const authenticate = require('../authenticate');// also in dash and login
const cors = require('./cors');


joinRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    //comment out
    .get(cors.cors, (req, res, next) => {
        KBUser.find().populate('kup', 'name userEmail userName')
            .then(users => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(users);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        newKup = {
            name: req.body.kupboadName,
            img: "/assets/_default_thumb.jpg",
            alt: "",
            mast: "/assets/_default_mast.jpg",
            mastAlt: "",
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            itemTypeCt: 0,
            hours: [],
            inventory: [],
            bulletins: [],
            details: "",
            share: "",
            userName: req.body.firstName,
            userLastName: req.body.lastName,
            userEmail: req.body.email,
            map: true
        };
        Kupboard.create(newKup)
            .then(kupboard => {
                KBUser.register(
                    new KBUser({ kup: kupboard._id, username: req.body.kupboadName }),
                    req.body.password
                ).then(user => {
                    console.log('New Account created ', kupboard, user);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                })
            })
            .catch(err => next(err));
    })
    .all(cors.cors, (req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });
module.exports = joinRouter;