var express = require('express');
var viewRouter = express.Router();
const kupboardModule = require('../models/kupboard');
const Kupboard = kupboardModule.Kupboard;


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
        Kupboard.findById(req.params.kupId)
            .then(kupboard => {
                res.statusCode = kupboard ? 200 : 404;
                kupboard = kupboard || { err: 'Kupboard not available' }
                res.setHeader('Content-Type', 'text/html');//////
                res.json(kupboard);
            })
            .catch(err => next(err));
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported');
    });


module.exports = viewRouter;
