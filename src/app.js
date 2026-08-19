import express from "express"
import buyRouter from "./routes/buy.routes.js";
import productRouter from "./routes/product.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
import orderRouter from "./routes/order.routes.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import helmet from "helmet";
import cors from 'cors'
import cookieParser from "cookie-parser";
import { serveSwagger, setupSwagger, swaggerSpec } from "./config/swagger.js";

const app = express();

app.use("/webhook", webhookRouter)

app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:9000",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5500"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature', 'Cookie']
}))
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
}))

// Health check endpoint for Render/uptime monitors
app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Serve Swagger API Documentation
app.use('/api-docs', serveSwagger, setupSwagger);
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use(express.static('frontend'))

app.use("/user", userRouter)
app.use("/buy", buyRouter)
app.use('/product', productRouter)
app.use('/order', orderRouter)
app.get("/", (req,res) => {
    return res.status(200).json({ message: "HM Sports API is running smoothly", status: "online" })
})

app.use("/*splat", (req, res, next) => {
    const error = new Error("Path Not Found!")
    error.status = "Fail";
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler)

export default app;