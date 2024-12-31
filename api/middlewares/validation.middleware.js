
/**
 * Middleware to validate request body against a Joi schema.
 * @param {Joi.ObjectSchema} schema 
 * @returns {Function(req: Object, res: Object, next: Function): void}
 */
const validateBodyRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {

        const validationError = new Error();
        validationError.name = 'ValidationError';
        validationError.errors = error.details.map(detail => detail.message).join(', ');

        throw validationError;  

    }
    next();
};

/**
 * Middleware to validate request params against a Joi schema.
 * @param {Joi.ObjectSchema} schema 
 * @returns {Function(req: Object, res: Object, next: Function): void}
 */
const validateParamsRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {

        const validationError = new Error();
        validationError.name = 'ValidationError';
        validationError.errors = error.details.map(detail => detail.message).join(', ');

        throw validationError;

    }
    next();
};


/**
 * Middleware to validate request queries against a Joi schema.
 * @param {Joi.ObjectSchema} schema 
 * @returns {Function(req: Object, res: Object, next: Function): void}
 */
const validateQueryRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {

        const validationError = new Error();
        validationError.name = 'ValidationError';
        validationError.errors = error.details.map(detail => detail.message).join(', ');

        throw validationError;

    }
    next();
};

module.exports = { validateBodyRequest, validateParamsRequest, validateQueryRequest };
