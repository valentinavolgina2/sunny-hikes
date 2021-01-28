const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const passes = require('./pass');
const conditions = require('./weather');
const restrooms = require('./restroom');

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
    facilities: {
        trail: Boolean,
        park: Boolean,
        dogsAllowed: Boolean,
        beachAccess: Boolean,
        restrooms: [...Object.values(restrooms)],
        picnicArea: Boolean,
        barbeque: Boolean,
        childrenPlayground: Boolean,
    },
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
    weatherUpdate: Date
}, opts);

const getFacilities = (hike) => { 
    return ((hike.facilities.trail) ? "Trail, " : "") +
        ((hike.facilities.park) ? "Park, " : "") +
        ((hike.facilities.beachAccess) ? "Beach, " : "") +
        ((hike.facilities.picnicArea) ? "Picnic area, " : "") +
        ((hike.facilities.barbeque) ? "Barbeque, " : "") +
        ((hike.facilities.dogsAllowed) ? "Dogs allowed, " : "No pets, ") +
        ((hike.facilities.childrenPlayground) ? "Children playground, " : "") +
        (hike.facilities.restrooms);
}

HikeSchema.virtual('properties.facility').get(function () {
    return getFacilities(this);
});

HikeSchema.virtual('properties.popUpMarkup').get(function () {

    const imageUrl = (this.images.length) ? this.images[0].thumbnail : 'https://res.cloudinary.com/dlpn4rtaa/image/upload/v1610948282/YelpHike/noImage_h2tqne.png';

    return `
    <strong><a href="/hikes/${this._id}">${this.title}</a></strong>
    <img  src = ${ imageUrl.replace('/upload', '/upload/w_150')} alt="">
    <p class="multiline-text">${getFacilities(this)}</p>`

        
});



HikeSchema.post('findOneAndDelete', async function (doc) { 
    if (doc) { 
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

module.exports = mongoose.model('Hike',HikeSchema);