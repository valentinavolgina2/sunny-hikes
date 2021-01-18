const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
const passes = require('./models/pass');

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
        title: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        pass: Joi.string().required().escapeHTML().valid(...Object.values(passes))
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewValidSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().min(0).required()
    }).required()
})