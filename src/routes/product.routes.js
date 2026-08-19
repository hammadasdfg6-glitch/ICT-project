import { addProduct, delProducts, getProductById, getProducts, updProducts } from "../controllers/product.controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../config/cloudinary.config.js";
import express from 'express'

const productRouter = express.Router()

productRouter.get("/", getProducts)
productRouter.get('/:id', getProductById)
productRouter.post("/", authenticate, restrictTo('admin'), upload.single('image'), addProduct)
productRouter.patch("/", authenticate, restrictTo('admin'), upload.single('image'), updProducts)
productRouter.delete("/", authenticate, restrictTo('admin'), delProducts)


export default productRouter