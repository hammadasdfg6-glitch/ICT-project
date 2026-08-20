import express from "express";
import { getAllOrders, markOrder, searchOrder } from "../controllers/order.controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { markOrderSchema, orderQuerySchema } from "../validations/order.validation.js";

const orderRouter = express.Router();

orderRouter.get('/', authenticate, searchOrder);
orderRouter.get('/get', authenticate, restrictTo('admin'), validate(orderQuerySchema, 'query'), getAllOrders);
orderRouter.patch('/', authenticate, restrictTo('admin'), validate(markOrderSchema), markOrder);

export default orderRouter;