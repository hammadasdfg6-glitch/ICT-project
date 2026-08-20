import express from 'express';
import { addProduct, delProducts, getProductById, getProducts, updProducts } from "../controllers/product.controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../config/cloudinary.config.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    addProductSchema,
    updateProductSchema,
    deleteProductSchema,
    productIdParamSchema
} from "../validations/product.validation.js";

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.get('/:id', validate(productIdParamSchema, 'params'), getProductById);
productRouter.post("/", authenticate, restrictTo('admin'), upload.single('image'), validate(addProductSchema), addProduct);
productRouter.patch("/", authenticate, restrictTo('admin'), upload.single('image'), validate(updateProductSchema), updProducts);
productRouter.delete("/", authenticate, restrictTo('admin'), validate(deleteProductSchema), delProducts);

export default productRouter;