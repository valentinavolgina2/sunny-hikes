const Hike = require('../models/hike');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.list = async (req, res) => {
    const location = (req.query.location) ? req.query.location : "Seattle WA";
    const distance = (req.query.distance) ? req.query.distance : 250;
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
        return new Hike(d);
    });

    res.render('hikes/index', { hikes: hikes, filter: {location: location, distance: distance, long: long, lat: lat}});

}

module.exports.getNewForm = (req, res) => {
    res.render('hikes/new');
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
//    console.log(hike);
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
    res.render('hikes/edit', { hike });
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

