var express = require('express');
var viewRouter = express.Router();
const cors = require('./cors');

const kupboardModule = require('../models/kupboard');
const Kupboard = kupboardModule.Kupboard;
const Annoucement = require('../models/announcement');
const Item = require('../models/item');


viewRouter.route('/')
    .options(/*cors.corsWithOptions,*/(req, res) => res.sendStatus(200))
    .get(/*cors.cors,*/(req, res, next) => {
        res.statusCode = 404;
        res.end('Data not available.');
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });


viewRouter.route('/confirm/:kupName')
    .options(/*cors.corsWithOptions,*/(req, res) => res.sendStatus(200))
    .get(/*cors.cors,*/(req, res, next) => {
        Kupboard.findOne({ name: req.params.kupName }).select('name')
            .then(kupboard => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');//////
                res.json(kupboard);
            })
            .catch((err) => err);
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });



viewRouter.route('/:kupId')
    .options(/*cors.corsWithOptions,*/(req, res) => res.sendStatus(200))
    .get(/*cors.corsWithOptions,*/(req, res, next) => {
        Kupboard.findById(req.params.kupId, { userName: 0, userLastName: 0, userEmail: 0 })
            .populate('hours')
            .populate({
                path: 'inventory',
                match: { act: true },
                options: { sort: { 'sortName': 1 } }
            })
            .populate({
                path: 'bulletins',
                match: { pubbed: true },
                options: { sort: { 'createdAt': -1 } }
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
    .options(/*cors.corsWithOptions,*/(req, res) => res.sendStatus(200))
    .get(/*cors.cors,*/(req, res, next) => {
        Annoucement.find({ inKB: req.params.kupId, pubbed: true })
            .sort({ 'createdAt': -1 })
            .then(announce => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');//////
                res.json(announce);
            })
            .catch(err => next(err));
    })
    .all(/*cors.cors,*/(req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported');
    });

viewRouter.route('/:kupId/inventory')
    .options(/*cors.corsWithOptions,*/(req, res) => res.sendStatus(200))
    .get(/*cors.cors,*/(req, res, next) => {
        Item.find({ inKB: req.params.kupId, act: true })
            .sort({ 'sortName': 1 })
            .then(items => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');//////
                res.json(items);
            })
            .catch(err => next(err));
    })
    .all(/*cors.cors,*/(req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported');
    });

module.exports = viewRouter;
