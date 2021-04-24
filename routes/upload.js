var express = require('express');
const uploadRouter = express.Router();
const Kupboard = require('../models/kupboard').Kupboard;

const cors = require('./cors');

const authenticate = require('../authenticate');
const multer = require('multer');
const fs = require('fs');

const storageThumb = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = 'public/images/' + req.params.kupboardId + '/thumbs';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const storageMast = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = 'public/images/' + req.params.kupboardId + '/mast';
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const uploadThumb = multer({ storage: storageThumb, filer: imageFileFilter });
const uploadMast = multer({ storage: storageMast, filer: imageFileFilter });



uploadRouter.route('/thumb/:kupboardId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .post(cors.corsWithOptions, authenticate.verifyUser, uploadThumb.single('imageFile'), (req, res, next) => {
        Kupboard.findOneAndUpdate({ _id: req.params.kupboardId }, { img: req.file.path.replace('public', '') })
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(req.file);
            })
            .catch(err => next(err));
    })
    .all((req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported for file uploads.');
    });

uploadRouter.route('/mast/:kupboardId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .post(cors.corsWithOptions, authenticate.verifyUser, uploadMast.single('imageFile'), (req, res) => {
        Kupboard.findOneAndUpdate({ _id: req.params.kupboardId }, { mast: req.file.path.replace('public', '') })
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(req.file);
            })
            .catch(err => next(err));
    })
    .all(cors.cors, (req, res) => {
        res.statusCode = 405;
        res.end(req.method + ' operation not supported for file uploads.');
    });
module.exports = uploadRouter;