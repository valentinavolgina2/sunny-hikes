const Hike = require('../models/hike');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const passes = require('../models/pass');
const conditions = require('../models/weather');
const restrooms = require('../models/restroom');
const weatherKey = process.env.WEATHER_KEY;
const got = require('got');
const activities = require('../models/activity');

const units = 'imperial'; 
let lastWeatherRequestTime = new Date();

function getValues(enumObject){
    var all = [];
    for(var key in enumObject){
       all.push(enumObject[key]);
    }
    return all;
 }

module.exports.list = async (req, res) => {
    const location = (req.query.location) ? req.query.location : "Seattle WA";
    const distance = (req.query.distance) ? req.query.distance : 250;
    const myHikes = (req.query.mine) ? true : false;
    //https://www.sunzala.com/why-the-javascript-date-is-one-day-off/
    const day = (req.query.date) ? new Date(req.query.date.replace('-', '/')) : new Date();
    const allConditions = getValues(conditions);
    let conditionFilter = (req.query.conditionFilter) ? req.query.conditionFilter : allConditions;
    if (!Array.isArray(conditionFilter)) conditionFilter = [conditionFilter];
    const { long, lat } = await getSearchCenter(location);

    //https://stackoverflow.com/questions/25584279/combine-geonear-query-with-another-query-for-a-value
    let query;
    if (conditionFilter.includes(conditions.NONE)) {
        query = {
            $or: [{ "weather.1": { $exists: false } }, {
                weather: {
                    $elemMatch: {
                        main: { $in: conditionFilter }, day: {
                            $gte: new Date(new Date(day).setHours(00, 00, 00)),
                            $lt: new Date(new Date(day).setHours(23, 59, 59))
                        }
                    }
                }
            }],
            
        };
    } else { 
        query = {
            $and: [{ "weather.1": { $exists: true } }, {
                weather: {
                    $elemMatch: {
                        main: { $in: conditionFilter }, day: {
                            $gte: new Date(new Date(day).setHours(00, 00, 00)),
                            $lt: new Date(new Date(day).setHours(23, 59, 59))
                        }
                    }
                }
            }],
            
        }
    }

    if (myHikes) { 
        query.owner = req.user._id;
    }

    let hikes = await Hike.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long, lat]
                },
                distanceField: "dist.calculated",
                maxDistance: toMeters(distance), //meters
                spherical: true,
                query: query
            }
        }
    ]);

    //return virtuals
    hikes = hikes.map(d => {
        return new Hike(d);
    });

    res.render('hikes/index', { hikes: hikes, filter: {location: location, distance: distance, long: long, lat: lat, forecastDay: day, conditions: conditionFilter, mine: myHikes}, conditions: allConditions});

}

module.exports.getNewForm = (req, res) => {
    res.render('hikes/new', {passes: [...Object.values(passes)], restrooms: [...Object.values(restrooms)], activities: [...Object.values(activities)]});
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
    res.render('hikes/edit', { hike: hike, passes: [...Object.values(passes)], restrooms: [...Object.values(restrooms)], activities: [...Object.values(activities)]});
}

module.exports.updateHike = async (req, res) => { 
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hike.location,
        limit: 1
    }).send();
    const hike = await Hike.findByIdAndUpdate(id, { ...req.body.hike });
    const addedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hike.images.push(...addedImages);
    hike.geometry = geoData.body.features[0].geometry;

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

async function updateWeather() { 
    const MAX_REQUEST = 50;
    let requests = MAX_REQUEST;

    //new hikes
    let hikes = await Hike.find({ "weatherUpdate": { "$exists": false } }).limit(requests);
    for (const hike of hikes) {
        await updateHikeWeather(hike);
    }
    
    requests = (requests - hikes.length > 0 ) ? requests - hikes.length : 0;
    hikes = await Hike.find({ "weatherUpdate": { $lt: getDateWithoutTime() } }).limit(requests);
    for (const hike of hikes) {
        await updateHikeWeather(hike);
    }

    lastWeatherRequestTime = new Date();
    requests = (requests - hikes.length > 0) ? requests - hikes.length : 0;
    return MAX_REQUEST - requests;
}

setTimeout(async function getWeatherScheduled() {
    if (getMinuteDifference(new Date(), lastWeatherRequestTime) > 1) {
        const updatedHikes = await updateWeather();
        console.log(lastWeatherRequestTime);
        console.log(`Updated weather forecast  for ${updatedHikes} hikes!`);
    
    } else { 
        console.log(new Date());
        console.log("Too early to get weather. Wait for 2 minutes!");
    }    

    setTimeout(getWeatherScheduled, 1000*60*2); // 2000 = 2sec
}, 1000 * 60 * 2);


module.exports.getWeather = async (req, res) => { 
    if (getMinuteDifference(new Date(), lastWeatherRequestTime) > 1) {
        const updatedHikes = await updateWeather();
        req.flash('success', `Updated weather forecast  for ${updatedHikes} hikes!`);
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
                    day: Math.round(day.temp.day),
                    night: Math.round(day.temp.night),
                    morning: Math.round(day.temp.morn),
                    evening: Math.round(day.temp.eve),
                    min: Math.round(day.temp.min),
                    max: Math.round(day.temp.max)
                },
                main: day.weather[0].main,
                description: day.weather[0].description,
                precipitationProbability: Math.round(day.pop),
                windSpeed: Math.round(day.wind_speed),
                clouds: day.clouds,
                snow: (day.snow) ? day.snow : 0,
                rain: (day.rain) ? Math.round(day.rain) : 0,
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

