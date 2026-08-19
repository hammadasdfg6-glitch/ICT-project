import express from "express"
import { getAllOrders, markOrder, searchOrder } from "../controllers/order.controller.js"
import { authenticate, restrictTo } from "../middlewares/auth.middleware.js"

const orderRouter = express.Router()

orderRouter.get('/', authenticate, searchOrder)
orderRouter.get('/get',authenticate,restrictTo('admin'),getAllOrders)
orderRouter.patch('/',authenticate,restrictTo('admin'),markOrder)

export default orderRouter