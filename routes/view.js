var express = require('express');
var viewRouter = express.Router();
const kupboardModule = require('../models/kupboard');
const Kupboard = kupboardModule.Kupboard;
const Annoucement = require('../models/announcement');
const Item = require('../models/item');


viewRouter.route('/')
    .get((req, res, next) => {
        res.statusCode = 404;
        res.end('Data not available.');
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });

viewRouter.route('/:kupId')
    .get(function (req, res, next) {
        Kupboard.findById(req.params.kupId, { userName: 0, userLastName: 0, userEmail: 0 })
            .populate('hours')
            .populate({
                path: 'inventory',
                match: { act: true }
            })
            .populate({
                path: 'bulletins',
                match: { pubbed: true }
            })
            .then(kupboard => {
                res.statusCode = kupboard ? 200 : 404;
                kupboard = kupboard || { err: 'Kupboard not available' }
                res.setHeader('Content-Type', 'application/json');//////
                res.json(kupboard);
            })
            .catch(err => next(err));
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported');
    });

viewRouter.route('/:kupId/announce')
    .get(function (req, res, next) {
        Annoucement.find({ inKB: req.params.kupId, pubbed: true })
            .then(announce => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');//////
                res.json(announce);
            })
            .catch(err => next(err));
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported');
    });

viewRouter.route('/:kupId/inventory')
    .get(function (req, res, next) {
        Item.find({ inKB: req.params.kupId, act: true })
            .then(items => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');//////
                res.json(items);
            })
            .catch(err => next(err));
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported');
    });

module.exports = viewRouter;
