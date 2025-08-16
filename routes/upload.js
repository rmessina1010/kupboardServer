var express = require('express');
const uploadRouter = express.Router();
const FormData = require('form-data');
const fetch = require('node-fetch');

const Kupboard = require('../models/kupboard').Kupboard;

const cors = require('./cors');

const authenticate = require('../authenticate');
const multer = require('multer');
const fs = require('fs');

const isRemote = !!process.env.SECRET_DEST_URL;

// returns a multer instance for either thumb or mast uploads
function createUploader(imageType) {
  const storage = isRemote
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          const path = `public/images/${req.params.kupboardId}/${imageType}`;
          fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        },
        filename: (req, file, cb) => cb(null, file.originalname),
      });

  return multer({ storage, fileFilter: imageFileFilter }).single('imageFile');
}

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const uploadThumb = createUploader('thumbs');
const uploadMast = createUploader('mast');

// Handle thumb upload
uploadRouter.route('/thumb/:kupboardId')
  .post(cors.corsWithOptions, authenticate.verifyUser, uploadThumb, async (req, res, next) => {
    try {
      if (isRemote) {
        const form = new FormData();
        form.append('thumbs', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        form.append('token', process.env.SECRET_DEST);
        form.append('kbid', req.params.kupboardId || 'defaultkup');

        const response = await fetch(process.env.SECRET_DEST_URL + '/kb_uploads.php', {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });

        await Kupboard.findOneAndUpdate(
          { _id: req.params.kupboardId },
          { mast: `${process.env.SECRET_DEST_URL}/${req.params.kupboardId}/thumbs/${req.file.originalname}`}
        );

        res.status(200).json({ success: true, data });
      } else {
        await Kupboard.findOneAndUpdate(
          { _id: req.params.kupboardId },
          { img: req.file.path.replace('public', '') }
        );
        res.status(200).json(req.file);
      }
    } catch (err) {
      next(err);
    }
  });

// Handle mast upload
uploadRouter.route('/mast/:kupboardId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .post(cors.corsWithOptions, authenticate.verifyUser, uploadMast, async (req, res, next) => {
      try {
      if (isRemote) {
        const form = new FormData();
        form.append('mast', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        form.append('token', process.env.SECRET_DEST);
        form.append('kbid', req.params.kupboardId || 'defaultkup');

        const response = await fetch(process.env.SECRET_DEST_URL + '/kb_uploads.php', {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });

        const data = await Kupboard.findOneAndUpdate(
          { _id: req.params.kupboardId },
          { mast: `${process.env.SECRET_DEST_URL}/${req.params.kupboardId}/mast/${req.file.originalname}`}
        );

        res.status(200).json({ success: true, data }); // remove-update
      } else {
        await Kupboard.findOneAndUpdate(
          { _id: req.params.kupboardId },
          { mast: req.file.path.replace('public', '') }
        );
        res.status(200).json(req.file);
      }
    } catch (err) {
      next(err);
    }
  });

module.exports = uploadRouter;