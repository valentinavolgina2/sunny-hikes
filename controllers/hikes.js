const Hike = require('../models/hike');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const passes = require('../models/pass');
const conditions = require('../models/weather');
const weatherKey = process.env.WEATHER_KEY;
const got = require('got');

const units = 'imperial'; 
let lastWeatherRequestTime = new Date();

module.exports.list = async (req, res) => {
    const location = (req.query.location) ? req.query.location : "Seattle WA";
    const distance = (req.query.distance) ? req.query.distance : 250;

    //https://www.sunzala.com/why-the-javascript-date-is-one-day-off/
    const day = (req.query.date) ? new Date(req.query.date.replace('-', '/')) : new Date();
    const { long, lat } = await getSearchCenter(location);

    let hikes = await Hike.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long, lat]
                },
                distanceField: "dist.calculated",
                maxDistance: toMeters(distance), //meters
                spherical: true
            }
        }
    ]);


    //return virtuals
    hikes = hikes.map(d => {
        let hike = new Hike(d);
        if (hike.weather === undefined || hike.weather.length == 0) {
            hike.weatherMain = 'None';
        } else { 
            let filteredWeather = hike.weather.filter(x => (x.day.getUTCDate() === day.getUTCDate() && x.day.getUTCMonth() === day.getUTCMonth() && x.day.getUTCFullYear() === day.getUTCFullYear()));
//            console.log(filteredWeather[0].day);
            hike.weatherMain = (filteredWeather && filteredWeather.length > 0) ? String(filteredWeather.map(x => x.main)[0]) : 'None';
        }
        
        return hike;
    });

    //  console.log({ hikes: hikes, filter: {location: location, distance: distance, long: long, lat: lat, forecastDay: day}, conditions: [...Object.values(conditions)]});

    res.render('hikes/index', { hikes: hikes, filter: {location: location, distance: distance, long: long, lat: lat, forecastDay: day}, conditions: [...Object.values(conditions)]});

}

module.exports.getNewForm = (req, res) => {
    res.render('hikes/new', {passes: [...Object.values(passes)]});
}

module.exports.showHike = async (req, res) => {

    const page = (!isNaN(req.query.page)) ? parseInt(req.query.page) : 1;
    const PAGE_SIZE = 3;                       
    const skip = (page - 1) * PAGE_SIZE;

    const hike = await Hike.findById(req.params.id).populate({
        path: 'reviews',
        options: {sort: '-date',skip: skip, limit: PAGE_SIZE },
        populate:{ 
            path: 'owner',
        }
    }).populate('owner');
    if (!hike) { 
        req.flash('error', 'Cannot find that page!');
        return res.redirect('/hikes');
    }

    const nextReviewHike = await Hike.findById(req.params.id).populate({
        path: 'reviews',
        options: { skip: page*PAGE_SIZE, limit: 1 }
    });

    const previousPage = (page - 1);
    const nextPage = (nextReviewHike.reviews.length === 0) ? -1 : (page + 1);
    res.render('hikes/show', { hike: hike, nextPage: nextPage, previousPage: previousPage});
}

module.exports.createHike = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hike.location,
        limit: 1
    }).send();

    const hike = new Hike(req.body.hike);
    hike.geometry = geoData.body.features[0].geometry;
    hike.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hike.owner = req.user._id;
    await hike.save();
    req.flash('success', 'Successfully made a new recommendation!');
    res.redirect(`/hikes/${hike._id}`);

}

module.exports.getEditForm = async (req, res) => { 
    const { id } = req.params;
    const hike = await Hike.findById(id);
    if (!hike) { 
        req.flash('error', 'Cannot find that page!');
        return res.redirect('/hikes');
    }
    res.render('hikes/edit', { hike: hike, passes: [...Object.values(passes)]});
}

module.exports.updateHike = async (req, res) => { 
    const { id } = req.params;
    const hike = await Hike.findByIdAndUpdate(id, { ...req.body.hike });
    const addedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hike.images.push(...addedImages);
    await hike.save();
    if (req.body.deleteImages) { 
        for (let img of req.body.deleteImages) { 
            await cloudinary.uploader.destroy(img);
        }
        await hike.updateOne({ $pull: { images: { filename: {$in: req.body.deleteImages}}}});
    }

    req.flash('success', 'Successfully updated the recommendation!');
    res.redirect(`/hikes/${hike._id}`);
}

module.exports.deleteHike = async (req, res) => { 
    const { id } = req.params;
    const hike = await Hike.findByIdAndDelete(id);
    req.flash('success', 'The recommendation has been deleted!');
    res.redirect("/hikes");
}

module.exports.getWeather = async (req, res) => { 
    
    if (getMinuteDifference(new Date(), lastWeatherRequestTime) > 2) {

        const MAX_REQUEST = 50;
        let requests = MAX_REQUEST;

        //new hikes
        let hikes = await Hike.find({ "weatherUpdate": { "$exists": false } }).limit(requests);
        for (const hike of hikes) {
            const result = await updateHikeWeather(hike);
            console.log(result);
        }
        
        requests = (requests - hikes.length > 0 ) ? requests - hikes.length : 0;
        hikes = await Hike.find({ "weatherUpdate": { $lt: getDateWithoutTime() } }).limit(requests);
        // hikes = await Hike.find({ "weatherUpdate": { $lt: getDateWithoutTime() } }).limit(requests);
        for (const hike of hikes) {
            const result = await updateHikeWeather(hike);
            console.log(result);
        }
    
        lastWeatherRequestTime = new Date();
        requests = (requests - hikes.length > 0 ) ? requests - hikes.length : 0;
        req.flash('success', `Updated weather forecast  for ${MAX_REQUEST - requests} hikes!`);
        res.redirect("/hikes");
    
    } else { 
        req.flash('error', "Too early to get weather. Wait for 2 minutes!");
        res.redirect("/hikes");
    }


}

async function getSearchCenter(location) { 

    let long; 
    let lat; 

    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send();
    [long, lat] = geoData.body.features[0].geometry.coordinates;

    return { long, lat };
}

function toMeters(miles) {
    return miles * 1609.34;
}

function getDateWithoutTime() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}

function getMinuteDifference(day1, day2) { 
    const diffMs = (day1 - day2); // milliseconds 
    return Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
}

async function updateHikeWeather(hike) { 
    try {
        const [long, lat] = hike.geometry.coordinates;
        // console.log(`long: ${long}`);
        // console.log(`lat: ${lat}`);
        const response = await got(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=current,minutely,hourly,alerts&units=${units}&appid=${weatherKey}`);

//        console.log(response.body);
        const body = JSON.parse(response.body);
        let forecast = [];
        body.daily.forEach(day => {
            const dayForecast = {
                day: new Date(day.dt * 1000),
                temperature: {
                    day: day.temp.day,
                    night: day.temp.night,
                    morning: day.temp.morn,
                    evening: day.temp.eve
                },
                feels: {
                    day: day.feels_like.day,
                    night: day.feels_like.night,
                    morning: day.feels_like.morn,
                    evening: day.feels_like.eve
                },
                main: day.weather[0].main,
                description: day.weather[0].description,
                precipitationProbability: day.pop,
                windSpeed: day.wind_speed,
                clouds: day.clouds,
                snow: (day.snow) ? day.snow : 0,
                rain: (day.rain) ? day.rain : 0,
                icon: day.weather[0].icon
            };
            forecast.push(dayForecast);
        });
        hike.weather = forecast;
        hike.weatherUpdate = getDateWithoutTime();
        await hike.save();
        return true;

//        console.log(forecast);
    } catch (error) {
        console.log(error);
        return false;
    } 
}

