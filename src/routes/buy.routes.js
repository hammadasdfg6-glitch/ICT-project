import express from "express";
import { addToCart, checkout, delCart, getCart, confirmSession } from "../controllers/buy.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { addToCartSchema, checkoutSchema, cartItemParamSchema } from "../validations/buy.validation.js";

const buyRouter = express.Router();

buyRouter.get('/cart', authenticate, getCart);
buyRouter.get('/confirm-session', confirmSession);
buyRouter.post("/", authenticate, validate(addToCartSchema), addToCart);
buyRouter.patch("/checkout", authenticate, validate(checkoutSchema), checkout);
buyRouter.delete('/cart/:id', authenticate, validate(cartItemParamSchema, 'params'), delCart);
buyRouter.delete('/:id', authenticate, validate(cartItemParamSchema, 'params'), delCart);

export default buyRouter;