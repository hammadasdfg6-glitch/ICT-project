import express from "express";
import { registerCustomer, registerAdmin, login, logout, getMe } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerCustomerSchema, registerAdminSchema, loginSchema } from "../validations/user.validation.js";

const userRouter = express.Router();

userRouter.get("/me", authenticate, getMe);
userRouter.post("/register-customer", validate(registerCustomerSchema), registerCustomer);
userRouter.post("/register-admin", validate(registerAdminSchema), registerAdmin);
userRouter.post("/login", validate(loginSchema), login);
userRouter.post("/logout", logout);

export default userRouter;