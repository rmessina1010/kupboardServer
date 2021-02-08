var express = require('express');
var findRouter = express.Router();
const Kupboard = require('../models/kupboard');
const segmentSize = 20;

/* GET users listing. */
findRouter.route('/')
  .get((req, res, next) => {
    let searchParams = {};
    if (req.body.city) { searchParams.city = req.body.city; }
    if (req.body.zip) { searchParams.zip = req.body.zip; }
    if (req.body.state) { searchParams.state = req.body.state; }
    Kupboard.find(searchParams)
      .then(kupboards => {
        let segment = kupboards.slice(0, segmentSize)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.json({ kupboards: segment, ofTotal: kupboards.length, segmentSize });
      })
      .catch(err => next(err));
  })
  .all((req, res) => {
    res.statusCode = 405;
    res.end(req.method + ' operation not supported');
  });

findRouter.route('/:pagination')
  .get(function (req, res, next) {
    let searchParams = {};
    if (req.body.city) { searchParams.city = req.body.city; }
    if (req.body.zip) { searchParams.zip = req.body.zip; }
    if (req.body.state) { searchParams.state = req.body.state; }
    Kupboard.find(searchParams)
      .then(kupboards => {
        let page = parseInt(req.params.pagination);
        if (!page || isNaN(page)) { page = 1 }
        let segment = kupboards.slice((req.params.pagination - 1) * segmentSize, req.params.pagination * segmentSize);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.json({ kupboards: segment, ofTotal: kupboards.length, segmentSize });
      })
      .catch(err => next(err));
  })
  .all((req, res) => {
    res.statusCode = 405;
    res.end(req.method + ' operation not supported');
  });


module.exports = findRouter;
