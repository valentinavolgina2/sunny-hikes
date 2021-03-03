const { hikeValidSchema, reviewValidSchema} = require('./validationSchemas'); //Joi - for data validation
const ExpressError = require('./utils/ExpressError'); // for error catching
const Hike = require('./models/hike');
const Review = require('./models/review');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const multer = require('multer');
const { storage } = require('./cloudinary');

const validLocation = async (req) => { 
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hike.location,
        limit: 1
    }).send();

    const locationInfo = geoData.body.features[0].context;
    if (locationInfo === 'undefined') {
        req.flash('error', 'Cannot determine the location.');
        return false;
    } else { 
        const result = locationInfo.find(info => info.id.includes("region"));
        if (typeof(result) === 'undefined' || result.text !== 'Washington') {
            req.flash('error', 'Recreation must be in Washington State!');
            return false;
        } 
    }
    return true;
}

const validHikeData = (req) => { 
    let activities = (req.body.hike.activities) ? req.body.hike.activities : [];
    if (!Array.isArray(activities)) activities = [activities];
    req.body.hike.activities = activities;

    const { error } = hikeValidSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        req.flash('error', message);
        return false;
    } else { 
        return true;
    }
}

async function hasValidData (req) {
    const validLocationData = await validLocation(req);
    return validLocationData && validHikeData(req);
}

const upload = multer({
    fileFilter: async function (req, file, cb) {
        const validationSucceeded = await hasValidData(req);
        req.body.validation = validationSucceeded;
        cb(null, validationSucceeded)
    },
    storage,
    limits: { fileSize: 3000000 }
}).array('image', 5);

module.exports.isLoggedIn = (req, res, next) => { 
    if (!req.isAuthenticated()) { 
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAdmin = async (req, res, next) => { 
    if (!req.user.admin) { 
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/hikes');;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => { 
    const { id } = req.params;
    let hike = await Hike.findById(id);
    if (!req.user.admin && !hike.owner.equals(req.user._id)) { 
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hikes/${id}`);
    }
    next();
}

module.exports.uploadImages = (req, res, next) => { 
    upload(req, res, function (err) {
        if (err) {
            req.flash('error', 'Error! You can upload up to 5 images, each file must be at most 3MB (.jpg, .jpeg, .png only).');
            return res.redirect(`/hikes`);
        }

        next();
    })
}

module.exports.validateHike = (req, res, next) => { 
    if (typeof (req.body.validation) != 'undefined') {
        next();
    } else { 
        req.body.validation = validHikeData(req);
        next();
    }
}

module.exports.validateLocation = async (req, res, next) => { 
    if (typeof (req.body.validation) != 'undefined') { 
        next();
    } else { 
        req.body.validation = await validLocation(req);
        next();
    }
}

module.exports.validateReview = (req, res, next) => { 
    const { error } = reviewValidSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    } else { 
        next();
    }
}

module.exports.isReviewOwner = async (req, res, next) => { 
    const { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!req.user.admin && !review.owner.equals(req.user._id)) { 
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hikes/${id}`);
    }
    next();
}

