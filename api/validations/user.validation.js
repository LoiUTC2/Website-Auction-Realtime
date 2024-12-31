const Joi = require('joi');

const { UserStatus } = require("../common/constant")
const mongoose = require('mongoose'); 


const createUserSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z\s-.'\u00C0-\u024F\u1E00-\u1EFF]+$/, 'valid characters')
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'string.max': "'{#key}' should have a maximum length of {#limit}",
            'string.pattern.name': "'{#key}' can only contain letters and spaces",
            'any.required': "'{#key}' is required",
        }),
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
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.email': "'{#key}' must be a valid email",
            'any.required': "'{#key}' is required",
        }),
    phoneNumber: Joi.string()
        .pattern(/^[0-9]{10,15}$/, 'numbers')
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.pattern.name': "'{#key}' must be a valid phone number containing only digits and must be 10 to 15 digits long",
            'any.required': "'{#key}' is required",
        }),
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'any.required': "'{#key}' is required",
        }),
    address: Joi.string()
        .optional()
        .custom((value, helpers) => {
            if (value.trim() === '') return helpers.message("'{#key}' cannot be empty");
            return value;
        })
        .messages({
            'string.base': "'{#key}' should be a string",
        }),
    avatar: Joi.string()
    .uri({ allowRelative: false }) // Chỉ chấp nhận URL tuyệt đối
    .optional()
    .messages({
        'string.base': "'{#key}' should be a valid URL string",
        'string.uri': "'{#key}' must be a valid absolute URL",
        }),
    status: Joi.string()
        .valid(...Object.values(UserStatus))
        .optional()
        .default(UserStatus.ACTIVE)
        .messages({
            'string.base': "'{#key}' should be a string",
            'any.only': "'{#key}' must be one of {#valids}",
        }),
    gender: Joi.string()
        .valid('Nam', 'Nữ', 'Khác')
        .required()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'any.only': "'{#key}' must be one of ['Nam', 'Nữ', 'Khác']",
            'any.required': "'{#key}' is required",
        }),
    rolePermission: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required()
});

const updateUserSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z\s-.'\u00C0-\u024F\u1E00-\u1EFF]+$/, 'valid characters')
        .optional()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'string.max': "'{#key}' should have a maximum length of {#limit}",
            'string.pattern.name': "'{#key}' can only contain letters and spaces",
        }),
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .optional()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
            'string.max': "'{#key}' should have a maximum length of {#limit}",
            'string.alphanum': "'{#key}' can only contain alphanumeric characters",
        }),
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .optional()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.email': "'{#key}' must be a valid email",
        }),
    phoneNumber: Joi.string()
        .pattern(/^[0-9]{10,15}$/, 'numbers')
        .optional()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.pattern.name': "'{#key}' must be a valid phone number containing only digits and must be 10 to 15 digits long",
        }),
    password: Joi.string()
        .min(8)
        .optional()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.min': "'{#key}' should have a minimum length of {#limit}",
        }),
    address: Joi.string()
        .optional()
        .custom((value, helpers) => {
            if (value.trim() === '') return helpers.message("'{#key}' cannot be empty");
            return value;
        })
        .messages({
            'string.base': "'{#key}' should be a string",
        }),
    avatar: Joi.string()
        .uri({ allowRelative: false }) // Chỉ chấp nhận URL tuyệt đối
        .optional()
        .messages({
            'string.base': "'{#key}' should be a valid URL string",
            'string.uri': "'{#key}' must be a valid absolute URL",
        }),
    status: Joi.string()
        .valid(...Object.values(UserStatus))
        .optional()
        .messages({
            'string.base': "'{#key}' should be a string",
            'any.only': "'{#key}' must be one of {#valids}",
        }),
    gender: Joi.string()
        .valid('Nam', 'Nữ', 'Khác')
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'any.only': "'{#key}' must be one of ['Nam', 'Nữ', 'Khác']",
        }),
    rolePermission: Joi.string()
        .alphanum()
        .optional()
        .messages({
            'string.base': "'{#key}' should be a string",
            'string.empty': "'{#key}' cannot be empty",
            'string.alphanum': "'{#key}' should be a valid alphanumeric ID",
    })
});




module.exports = { createUserSchema, updateUserSchema };