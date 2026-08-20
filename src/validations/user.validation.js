import Joi from "joi";

export const registerCustomerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(60).optional().allow(""),
    email: Joi.string().trim().email().required().messages({
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address"
    }),
    password: Joi.string().min(6).max(128).required().messages({
        "any.required": "Password is required",
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long"
    }),
    phone: Joi.alternatives().try(Joi.string().trim(), Joi.number()).optional().allow("")
});

export const registerAdminSchema = Joi.object({
    name: Joi.string().trim().min(2).max(60).optional().allow(""),
    email: Joi.string().trim().email().required().messages({
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address"
    }),
    password: Joi.string().min(6).max(128).required().messages({
        "any.required": "Password is required",
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long"
    }),
    phone: Joi.alternatives().try(Joi.string().trim(), Joi.number()).optional().allow(""),
    adminSecret: Joi.string().required().messages({
        "any.required": "Admin secret is required",
        "string.empty": "Admin secret is required"
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address"
    }),
    password: Joi.string().required().messages({
        "any.required": "Password is required",
        "string.empty": "Password is required"
    })
});