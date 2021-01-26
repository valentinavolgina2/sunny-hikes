const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const passes = require('./pass');
const conditions = require('./weather');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

//indexes by geometry, weatherUpdate
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
    pass: [...Object.values(passes)],
    weather: [
        {
            day: Date,
            temperature: {
                day: Number,
                night: Number,
                morning: Number,
                evening: Number
            },
            feels: {
                day: Number,
                night: Number,
                morning: Number,
                evening: Number
            },
            main: [...Object.values(conditions)],
            description: String,
            precipitationProbability: Number,
            windSpeed: Number,
            clouds: Number,
            snow: Number,
            rain: Number,
            icon: String
        }
    ],
    weatherUpdate: Date,
    weatherMain: String
}, opts);

HikeSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/hikes/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,40)}...</p>`
});

HikeSchema.virtual('properties.weatherIcon').get(function () {
    return this.weatherMain;
});



HikeSchema.post('findOneAndDelete', async function (doc) { 
    if (doc) { 
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

module.exports = mongoose.model('Hike',HikeSchema);