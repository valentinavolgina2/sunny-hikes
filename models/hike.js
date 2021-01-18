const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const passes = require('./pass');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

const HikeSchema = new Schema({
    title: String,
    description: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    pass: [...Object.values(passes)]
}, opts);

HikeSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/hikes/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,40)}...</p>`
});


HikeSchema.post('findOneAndDelete', async function (doc) { 
    if (doc) { 
        await Review.remove({ _id: { $in: doc.reviews } });
    }
});

module.exports = mongoose.model('Hike',HikeSchema);