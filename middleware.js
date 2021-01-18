const { hikeValidSchema, reviewValidSchema} = require('./validationSchemas'); //Joi - for data validation
const ExpressError = require('./utils/ExpressError'); // for error catching
const Hike = require('./models/hike');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => { 
    if (!req.isAuthenticated()) { 
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isOwner = async (req, res, next) => { 
    const { id } = req.params;
    let hike = await Hike.findById(id);
    if (!hike.owner.equals(req.user._id)) { 
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hikes/${id}`);
    }
    next();
}

module.exports.validateHike = (req, res, next) => { 
    
    const { error } = hikeValidSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    } else { 
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
    if (!review.owner.equals(req.user._id)) { 
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hikes/${id}`);
    }
    next();
}
