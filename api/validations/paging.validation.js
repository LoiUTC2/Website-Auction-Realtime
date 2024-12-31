const Joi = require("joi");

const pagingSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": `'{#key}' must be a number`,
    "number.integer": `'{#key}' must be a integer`,
    "number.min": `'{#key}' must be greater than or equal to 1`,
  }),
  limit: Joi.number().integer().min(1).default(10).messages({
    "number.base": `'{#key}' must be a number`,
    "number.integer": `'{#key}' must be an integer`,
    "number.min": `'{#key}' must be greater than or equal to 1`,
  }),
});



module.exports = { pagingSchema };