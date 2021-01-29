const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
const passes = require('./models/pass');
const restrooms = require('./models/restroom');
const conditions = require('./models/weather');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.hikeValidSchema = Joi.object({
    hike: Joi.object({
        title: Joi.string().max(100, 'utf8').required().escapeHTML(),
        description: Joi.string().max(1000, 'utf8').required().escapeHTML(),
        location: Joi.string().max(100, 'utf8').required().escapeHTML(),
        pass: Joi.string().required().escapeHTML().valid(...Object.values(passes)),
        facilities: Joi.object({
            trail: Joi.boolean(),
            park:  Joi.boolean(),
            dogsAllowed:  Joi.boolean(),
            beachAccess:  Joi.boolean(),
            restrooms: Joi.string().required().escapeHTML().valid(...Object.values(restrooms)),
            picnicArea:  Joi.boolean(),
            barbeque:  Joi.boolean(),
            childrenPlayground:  Joi.boolean()
        }),
        weather: Joi.array().items({
            day: Joi.date(),
            description: Joi.string().max(30, 'utf8').escapeHTML(),
            precipitationProbability: Joi.number().min(0).max(100),
            windSpeed: Joi.number().min(0).max(500),
            clouds: Joi.number().min(0).max(100),
            snow: Joi.number().min(0).max(2000),
            rain: Joi.number().min(0).max(2000),
            icon: Joi.string().max(5, 'utf8').escapeHTML(),
            main: Joi.string().required().escapeHTML().valid(...Object.values(conditions)),
            temperature: Joi.object({
                day: Joi.number().min(-100).max(100),
                night: Joi.number().min(-100).max(100),
                morning: Joi.number().min(-100).max(100),
                evening: Joi.number().min(-100).max(100),
                min: Joi.number().min(-100).max(100),
                max: Joi.number().min(-100).max(100)
            })
        })
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewValidSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().max(1000, 'utf8').required().escapeHTML(),
        rating: Joi.number().min(0).required()
    }).required()
})