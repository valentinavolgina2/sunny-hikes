const Hike = require('../models/hike');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => { 
    const hike = await Hike.findById(req.params.id);
    const review = new Review(req.body.review);
    review.owner = req.user._id;
    review.date = new Date();
    hike.reviews.push(review);
    await review.save();
    console.log(review);
    await hike.save();
    req.flash('success', 'New review has been added!');
    res.redirect(`/hikes/${hike._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Hike.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'The review has been deleted!');
    res.redirect(`/hikes/${id}`);
}