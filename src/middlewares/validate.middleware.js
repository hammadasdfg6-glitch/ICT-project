import appError from "../utils/appError.js";

/**
 * Reusable Joi validation middleware.
 * Validates req.body, req.params, or req.query against a given Joi schema.
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema object
 * @param {'body' | 'params' | 'query'} [source='body'] - Request property to validate
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        if (!schema) return next();

        const dataToValidate = req[source] || {};
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: false,
            errors: { wrap: { label: '' } }
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');
            return next(new appError(errorMessage, 'Fail', 400));
        }

        if (source === 'body') {
            req.body = value;
        } else if (req[source] && typeof req[source] === 'object') {
            try {
                Object.assign(req[source], value);
            } catch {
                // Read-only property in Express, preserve original
            }
        }
        next();
    };
};

export default validate;