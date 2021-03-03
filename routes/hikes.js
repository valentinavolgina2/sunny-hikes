const express = require('express');
const router = express.Router();
const hikes = require('../controllers/hikes');
const catchAsync = require('../utils/catchAsync'); // for error catching
const ExpressError = require('../utils/ExpressError'); // for error catching
const { validateHike, isLoggedIn, isOwner, isAdmin, validateLocation, uploadImages} = require('../middleware');

router.route('/')
    .get(catchAsync(hikes.list))
    .post(isLoggedIn, uploadImages, catchAsync(validateLocation), validateHike, catchAsync(hikes.createHike));

router.get('/new', isLoggedIn, hikes.getNewForm);

router.route('/weather')
    .get(isLoggedIn, isAdmin,catchAsync(hikes.getWeather))

router.route('/:id')
    .get(catchAsync(hikes.showHike))
    .put(isLoggedIn, uploadImages, catchAsync(validateLocation), validateHike, catchAsync(hikes.updateHike))
    .delete(isLoggedIn, isOwner, catchAsync(hikes.deleteHike));
    
router.get('/:id/edit', isLoggedIn, catchAsync(hikes.getEditForm));


module.exports = router;

