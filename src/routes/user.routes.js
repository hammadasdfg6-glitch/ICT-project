import express from "express";
import { registerCustomer, registerAdmin, login, logout, getMe } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/me", authenticate, getMe);
userRouter.post("/register-customer", registerCustomer);
userRouter.post("/register-admin", registerAdmin);
userRouter.post("/login", login);
userRouter.post("/logout", logout);

export default userRouter;
