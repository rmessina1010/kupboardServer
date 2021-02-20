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
const e = require('express');

// const handleUpdate = (data, model, inKB = null) => {
//     data.forEach(mongoDoc => {
//         if (inKB) { item.inKB = inKB; }
//         if (mongoDoc._id) { model.findByIdAndUpdate(mongoDoc._id, { $set: mongoDoc }, { new: true }) }
//         else { model.create(mongoDoc, { new: true }); }
//     });
// }

dashRouter
    .all('/', authenticate.verifyUser, (req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported.');
    });

dashRouter.route('/:kupBoardId')
    .get(authenticate.verifyUser, (req, res, next) => {
        Kupboard.findById(req.params.kupBoardId)
            .then(theKup => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json(theKup);
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        const updated = Kupboard.findByIdAndUpdate(req.params.kupBoardId, { $set: req.body.updateKup }, { new: true })
            .then(updated => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json({ updated: updated });
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'applications/json');
        res.json('Operation not supported!');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Kupboard.findByIdAndDelete(req.params.kupBoardId)
            .then(() => {
                Promise.all([
                    KBuser.findOneAndDelete({ kup: req.params.kupBoardId }),
                    Schedule.deleteMany({ inKB: req.params.kupBoardId }),
                    Annoucement.deleteMany({ inKB: req.params.kupBoardId }),
                    Item.deleteMany({ inKB: req.params.kupBoardId })
                ])
                    .then(() => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'applications/json');
                        res.json({ deleted: true });
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    });


//route announcements
dashRouter.route('/:kupBoardId/announce')
    .get(authenticate.verifyUser, (req, res, next) => {
        Annoucement.find({ inKB: req.params.kupBoardId })
            .then(announcements => {
                announcements = announcements || [];
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json(announcements);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        if (req.body.newRows) {
            Annoucement.insertMany(req.body.newRows.map(row => { row.inKB = req.params.kupBoardId; return row; }))
                .then(newDocs => {
                    updateKBArrField(req.params.kupBoardId, 'bulletins', Annoucement);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'applications/json');
                    res.json({ added: newDocs });
                })
                .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'applications/json');
            res.json({ added: false, message: 'nothing to insert' });
        }

    })
    .put(authenticate.verifyUser, (req, res, next) => {
        const updateRows = req.body.updateRows || [];
        let deleted;
        let updates = [];
        let AFNeedsUpdate = false;
        let promiseList = updateRows.map(row => {
            if (!row.id) {
                AFNeedsUpdate = true;
                row.id = new mongoose.mongo.ObjectID();
            }
            return Annoucement.updateOne({ _id: row._id }, row, { upsert: true, new: true });
        });
        Promise.all(promiseList)
            .then(ups => {
                updates = ups;
                if (req.body.deleteTargets) {
                    AFNeedsUpdate = true;
                    deleted = Annoucement.deleteMany({ _id: { $in: req.body.deleteTargets }, inKB: req.params.kupBoardId });
                }
            })
            .then(() => {
                if (AFNeedsUpdate) { updateKBArrField(req.params.kupBoardId, 'bulletins', Annoucement); }
            })
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json({ deleted: deleted, updates: updates });
            })
            .catch(err => next(err));

    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Annoucement.deleteMany(req.body.deleteTargets ? { _id: { $in: req.body.deleteTargets }, inKB: req.params.kupBoardId } : { inKB: req.params.kupBoardId })
            .then(deleted => {
                updateKBArrField(req.params.kupBoardId, 'bulletins', Annoucement);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json({ deleted: deleted });
            })
            .catch(err => next(err));
    })








//route items
dashRouter.route('/:kupBoardId/items')
    .get(authenticate.verifyUser, (req, res, next) => {
        Item.find({ inKB: req.params.kupBoardId })
            .then(items => {
                items = items || [];
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json(items);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        if (req.body.newRows) {
            Item.insertMany(req.body.newRows.map(row => { row.inKB = req.params.kupBoardId; return row; }))
                .then(newDocs => {
                    Item.find({ inKB: req.params.kupBoardId })
                        .then(toCount => {
                            updateKBArrField(req.params.kupBoardId, 'inventory', Item, { itemTypeCt: toCount.length });
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'applications/json');
                            res.json({ added: newDocs });
                        })
                        .catch(err => next(err));
                })
                .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'applications/json');
            res.json({ added: false, message: 'nothing to insert' });
        }

    })
    .put(authenticate.verifyUser, (req, res, next) => {
        const updateRows = req.body.updateRows || [];
        let deleted;
        let updates = [];
        let AFNeedsUpdate = false;
        let promiseList = updateRows.map(row => {
            if (!row.id) {
                AFNeedsUpdate = true;
                row.id = new mongoose.mongo.ObjectID();
            }
            return Item.updateOne({ _id: row._id }, row, { upsert: true, new: true });
        });
        Promise.all(promiseList)
            .then(ups => {
                updates = ups;
                if (req.body.deleteTargets) {
                    AFNeedsUpdate = true;
                    deleted = Item.deleteMany({ _id: { $in: req.body.deleteTargets }, inKB: req.params.kupBoardId });
                }
            })
            .then(() => {
                if (AFNeedsUpdate) {
                    Item.find({ inKB: req.params.kupBoardId })
                        .then(toCount => {
                            updateKBArrField(req.params.kupBoardId, 'inventory', Item, { itemTypeCt: toCount.length });
                        })
                        .catch(err => next(err));

                }
            })
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json({ deleted: deleted, updates: updates });
            })
            .catch(err => next(err));

    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Item.deleteMany(req.body.deleteTargets ? { _id: { $in: req.body.deleteTargets }, inKB: req.params.kupBoardId } : { inKB: req.params.kupBoardId })
            .then(deleted => {
                Item.find({ inKB: req.params.kupBoardId })
                    .then(toCount => {
                        updateKBArrField(req.params.kupBoardId, 'inventory', Item, { itemTypeCt: toCount.length });
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'applications/json');
                        res.json({ deleted: deleted });
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    })












//route hours
dashRouter.route('/:kupBoardId/hours')
    .get(authenticate.verifyUser, (req, res, next) => {
        Schedule.find({ inKB: req.params.kupBoardId })
            .then(hours => {
                hours = hours || [];
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json(hours);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        if (req.body.newRows) {
            Schedule.insertMany(req.body.newRows.map(row => { row.inKB = req.params.kupBoardId; return row; }))
                .then(newDocs => {
                    updateKBArrField(req.params.kupBoardId, 'hours', Schedule);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'applications/json');
                    res.json({ added: newDocs });
                })
                .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'applications/json');
            res.json({ added: false, message: 'nothing to insert' });
        }
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        const updateRows = req.body.updateRows || [];
        let deleted;
        let updates = [];
        let AFNeedsUpdate = false;
        let promiseList = updateRows.map(row => {
            if (!row.id) {
                AFNeedsUpdate = true;
                row.id = new mongoose.mongo.ObjectID();
            }
            return Schedule.updateOne({ _id: row._id }, row, { upsert: true, new: true });
        });
        Promise.all(promiseList)
            .then(ups => {
                updates = ups;
                if (req.body.deleteTargets) {
                    AFNeedsUpdate = true;
                    deleted = Schedule.deleteMany({ _id: { $in: req.body.deleteTargets }, inKB: req.params.kupBoardId });
                }
            })
            .then(() => {
                if (AFNeedsUpdate) { updateKBArrField(req.params.kupBoardId, 'hours', Schedule); }
            })
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json({ deleted: deleted, updates: updates });
            })
            .catch(err => next(err));

    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Schedule.deleteMany(req.body.deleteTargets ? { _id: { $in: req.body.deleteTargets }, inKB: req.params.kupBoardId } : { inKB: req.params.kupBoardId })
            .then(deleted => {
                updateKBArrField(req.params.kupBoardId, 'hours', Schedule);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json({ deleted: deleted });
            })
            .catch(err => next(err));
    })








function updateKBArrField(id, field, model, extra = {}) {
    model.distinct("_id", { inKB: id })
        .then(results => {
            return Kupboard.findByIdAndUpdate(id, { ...extra, [field]: results });
        })
        .catch(err => { console.log(err) });
}

module.exports = dashRouter;