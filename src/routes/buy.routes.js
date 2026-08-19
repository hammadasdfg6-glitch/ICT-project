import express from "express"
import { addToCart, checkout, delCart, getCart, confirmSession } from "../controllers/buy.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const buyRouter = express.Router()

buyRouter.get('/cart',authenticate,getCart)
buyRouter.get('/confirm-session',confirmSession)
buyRouter.post("/",authenticate,addToCart)
buyRouter.patch("/checkout",authenticate,checkout)
buyRouter.delete('/cart/:id',authenticate,delCart)
buyRouter.delete('/:id',authenticate,delCart)

export default buyRouter