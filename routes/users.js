const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.getRegisterForm)
    .post(catchAsync(users.createUser))

router.route('/login')
    .get(users.getLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)
    
router.route('/profile')
    .get(users.getProfileForm)
    .post(catchAsync(users.updateUser))

router.route('/password')
    .post(catchAsync(users.updatePassword))

router.get('/logout', users.logout)

module.exports = router;