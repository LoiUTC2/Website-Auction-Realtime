const Joi = require('joi');


const employeeLoginSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'string.max': "'{#key}' should have a maximum length of {#limit}",
            'string.alphanum': "'{#key}' can only contain alphanumeric characters",
            'any.required': "'{#key}' is required",
        }),
    password: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'any.required': "'{#key}' is required",
        }),
});

const employeeResetPasswordSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'string.max': "'{#key}' should have a maximum length of {#limit}",
            'string.alphanum': "'{#key}' can only contain alphanumeric characters",
            'any.required': "'{#key}' is required",
        }),
    newPassword: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'any.required': "'{#key}' is required"
        }),

    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/, 'numbers')
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.length': "'{#key}' must be {#limit} digits long",
            'string.pattern.name': "'{#key}' must contain only numbers",
            'any.required': "'{#key}' is required"
        }),
});

const employeeResetPasswordSchemaSendOTPSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.email': "'{#key}' must be a valid email",
            'any.required': "'{#key}' is required",
        }),
});


module.exports = { employeeLoginSchema, employeeResetPasswordSchemaSendOTPSchema, employeeResetPasswordSchema };