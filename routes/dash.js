var express = require('express');
var dashRouter = express.Router();
const kupboardModule = require('../models/kupboard');
const Kupboard = kupboardModule.Kupboard;
const KBUser = kupboardModule.KBUser;
const Schedule = kupboardModule.Schedule;
const Annoucement = require('../models/announcement');
const Item = require('../models/item');

const passport = require('passport');
const authenticate = require('../authenticate');

const handleUpdate = (data, model, inKB = null) => {
    data.forEach(mongoDoc => {
        if (inKB) { item.inKB = inKB; }
        if (mongoDoc._id) { model.findByIdAndUpdate(mongoDoc._id, { $set: mongoDoc }, { new: true }) }
        else { model.create(mongoDoc, { new: true }); }
    });
}

dashRouter
    .all('/', authenticate.verifyUser, (req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });

dashRouter.route('/:kupBoardId')
    .put(authenticate.verifyUser, (req, res, next) => {
        const kupData = {};
        // delete annouce, items, hours
        const itemsToDelte = [];
        const annoucementsToDelte = [];
        const hoursToDelte = [];
        Annoucement.deleteMany({ _id: { $in: annoucementsToDelte } })
            .then(() => Schedule.deleteMany({ _id: { $in: hoursToDelte } }))
            .then(() => Item.deleteMany({ _id: { $in: itemsToDelte } }))
            // add or update annouce, items, hours
            .then(() => {
                const theItems = [];
                const theHours = [];
                const theAnnouncements = [];
                handleUpdate(theItems, Item, req.params.kupBoardId)
                handleUpdate(theHours, Schedule, req.params.kupBoardId)
                handleUpdate(theAnnouncements, Annoucement, req.params.kupBoardId)
            })
            .then(() => {
                Kupboard.findByIdAndUpdate(req.params.kupBoardId, { $set: kupData }, { new: true })
                    .then(() => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'applications/json');
                        res.json({ updated: true });
                    })
                    .catch(err => next(err));
            }
            )
            .catch(err => next(err))
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Kupboard.findByIdAndDelete(req.params.kupBoardId)
            .then(kupBoard => {
                KBuser.find({ kup: kupBoard._id })
                    .then(user => {
                        Kupboard.findByIdAndDelete(user._id).then(response => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'applications/json');
                            res.json({ deleted: true });
                        })
                            .catch(err => next(err));

                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });

//route announcements
dashRouter.route('/:kupBoardId/annouce')
//route items
dashRouter.route('/:kupBoardId/items')
//route hours
dashRouter.route('/:kupBoardId/hours')


//db.kbusers.distinct("_id", {"inKB" : req.params.kupBoardId})