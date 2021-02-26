var express = require('express');
var findRouter = express.Router();
const kupboardModule = require('../models/kupboard');
const cors = require('./cors');

const Kupboard = kupboardModule.Kupboard;

const segmentSize = 20;

/* GET users listing. */
findRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    let searchParams = buildSearchParams(req.body.search);
    let segment = req.body.all ? null : segmentSize;
    Kupboard.count(searchParams)
      .then(ofTotal => {
        Kupboard.find(searchParams, { bulletins: 0, userName: 0, userLastName: 0, userEmail: 0, inventory: 0 })
          .populate('hours')
          .limit(segment)
          .then(
            kupboards => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ kupboards: kupboards, ofTotal: ofTotal, segmentSize: segmentSize });
            })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  })
  .all(cors.cors, (req, res) => {
    res.statusCode = 405;
    res.end(req.method + ' operation not supported');
  });

findRouter.route('/:pagination')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    let searchParams = buildSearchParams(req.body);
    let page = parseInt(req.params.pagination) - 1;
    page = isNaN(page) || page < 0 ? 0 : page;
    Kupboard.count(searchParams)
      .then(ofTotal => {
        Kupboard.find(searchParams, { bulletins: 0, userName: 0, userLastName: 0, userEmail: 0 })
          .populate('hours')
          .limit(segmentSize)
          .skip(page * segmentSize)
          .then(
            kupboards => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ kupboards: kupboards, ofTotal: ofTotal, segmentSize: segmentSize });
            })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  })
  .all(cors.cors, (req, res) => {
    res.statusCode = 405;
    res.end(req.method + ' operation not supported');
  });

function buildSearchParams(reqBod) {
  let searchParams = { status: "active" };
  if (reqBod) {
    if (reqBod.city) { searchParams.city = reqBod.city; }
    if (reqBod.zip) { searchParams.zip = reqBod.zip; }
    if (reqBod.state) { searchParams.state = reqBod.state; }
  }
  return searchParams;
}

module.exports = findRouter;
