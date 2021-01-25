const express = require('express');
const router = express.Router();
const hikes = require('../controllers/hikes');
const catchAsync = require('../utils/catchAsync'); // for error catching
const ExpressError = require('../utils/ExpressError'); // for error catching
const { validateHike, isLoggedIn, isOwner } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(hikes.list))
    .post(isLoggedIn, upload.array('image'),validateHike, catchAsync(hikes.createHike));

router.get('/new', isLoggedIn, hikes.getNewForm);

router.route('/weather')
    .get(catchAsync(hikes.getWeather))

router.route('/:id')
    .get(catchAsync(hikes.showHike))
    .put(isLoggedIn, isOwner, upload.array('image'), validateHike, catchAsync(hikes.updateHike))
    .delete(isLoggedIn, isOwner, catchAsync(hikes.deleteHike));
    
router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(hikes.getEditForm));


module.exports = router;

