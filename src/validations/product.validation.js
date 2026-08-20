import Joi from "joi";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(120).required().messages({
        "any.required": "Product name is required",
        "string.empty": "Product name is required"
    }),
    category: Joi.string().trim().required().messages({
        "any.required": "Category is required",
        "string.empty": "Category is required"
    }),
    price: Joi.number().positive().required().messages({
        "any.required": "Price is required",
        "number.positive": "Price must be a positive number"
    }),
    quantity: Joi.number().integer().min(0).required().messages({
        "any.required": "Quantity is required",
        "number.min": "Quantity cannot be negative"
    }),
    description: Joi.string().trim().optional().allow(""),
    status: Joi.string().valid("available", "Out of Stock").optional().default("available"),
    img_url: Joi.string().trim().optional().allow("")
});

export const updateProductSchema = Joi.object({
    _id: Joi.string().pattern(objectIdRegex).required().messages({
        "any.required": "Product ID (_id) is required",
        "string.pattern.base": "Invalid Product ID format (must be 24-character hexadecimal ObjectId)"
    }),
    name: Joi.string().trim().min(2).max(120).optional(),
    category: Joi.string().trim().optional(),
    price: Joi.number().positive().optional().messages({
        "number.positive": "Price must be a positive number"
    }),
    quantity: Joi.number().integer().min(0).optional().messages({
        "number.min": "Quantity cannot be negative"
    }),
    description: Joi.string().trim().optional().allow(""),
    status: Joi.string().valid("available", "Out of Stock").optional(),
    img_url: Joi.string().trim().optional().allow("")
});

export const deleteProductSchema = Joi.object({
    _id: Joi.string().pattern(objectIdRegex).required().messages({
        "any.required": "Product ID (_id) is required",
        "string.pattern.base": "Invalid Product ID format (must be 24-character hexadecimal ObjectId)"
    })
});

export const productIdParamSchema = Joi.object({
    id: Joi.string().pattern(objectIdRegex).required().messages({
        "any.required": "Product ID param is required",
        "string.pattern.base": "Invalid Product ID format in URL parameter"
    })
});