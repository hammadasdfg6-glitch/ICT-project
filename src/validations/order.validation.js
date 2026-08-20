import Joi from "joi";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const markOrderSchema = Joi.object({
    orderId: Joi.string().pattern(objectIdRegex).required().messages({
        "any.required": "Order ID (orderId) is required",
        "string.empty": "Order ID is required",
        "string.pattern.base": "Invalid Order ID format (must be 24-character hexadecimal ObjectId)"
    }),
    status: Joi.string().valid("confirmed", "shipping", "delivering", "delivered", "cancelled").insensitive().required().messages({
        "any.required": "Order status is required",
        "string.empty": "Order status is required",
        "any.only": "Status must be one of: confirmed, shipping, delivering, delivered, cancelled"
    })
});

export const orderQuerySchema = Joi.object({
    status: Joi.string().valid("confirmed", "shipping", "delivering", "delivered", "cancelled").insensitive().optional(),
    createdAt: Joi.string().optional()
});