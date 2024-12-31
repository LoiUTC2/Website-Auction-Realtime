const Joi = require('joi');


const idSchema = Joi.object({
    id: Joi.string().length(24).hex().required() // Validate MongoDB ObjectId
});


module.exports = { idSchema };