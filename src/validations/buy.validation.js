import Joi from "joi";

export const addToCartSchema = Joi.object({
    _id: Joi.string().trim().optional(),
    id: Joi.string().trim().optional(),
    name: Joi.string().trim().optional(),
    quantity: Joi.number().integer().min(1).optional().default(1).messages({
        "number.min": "Quantity must be at least 1"
    })
}).or("_id", "id", "name").messages({
    "object.missing": "Product ID or Name is required to add item to cart"
});

export const checkoutSchema = Joi.object({
    name: Joi.string().trim().optional().allow(""),
    phone: Joi.alternatives().try(Joi.string().trim(), Joi.number()).optional().allow(""),
    address: Joi.string().trim().optional().allow(""),
    city: Joi.string().trim().optional().allow(""),
    postalCode: Joi.string().trim().optional().allow("")
});

export const cartItemParamSchema = Joi.object({
    id: Joi.string().trim().required().messages({
        "any.required": "Item ID parameter is required",
        "string.empty": "Item ID parameter cannot be empty"
    })
});