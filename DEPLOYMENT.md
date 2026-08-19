# 🚀 HM Sports Full-Stack Deployment Guide

This guide details how to deploy the **Backend on Render** and the **Frontend on Vercel**.

---

## 🛠️ Part 1: Deploy Backend to Render

### Step 1: Create a New Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository (`hammadasdfg6-glitch/ICT-project`).
4. Configure the following settings:
   - **Name**: `hmsports-backend` (or your chosen name)
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Step 2: Set Environment Variables on Render
Under the **Environment** tab, add the following variables:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production cookie & security mode |
| `PORT` | `10000` | Render default port |
| `MONGO_URI` | `mongodb+srv://<username>:<password>@cluster0.yepkpik.mongodb.net/hmsports?appName=Cluster0` | MongoDB Atlas Connection |
| `REDIS_HOST` | `your-redis-host.db.redis.io` | Redis Cloud host |
| `REDIS_PORT` | `12041` | Redis Cloud port |
| `REDIS_USERNAME` | `default` | Redis username |
| `REDIS_PASSWORD` | `your_redis_password` | Redis password |
| `JWT_SECRET` | `your_jwt_secret_key` | Secret key for auth tokens |
| `ADMIN_SECRET` | `1234` | Master key for admin registration |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary name |
| `CLOUDINARY_API_KEY` | `your_cloudinary_api_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_api_secret` | Cloudinary API Secret |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>` | Cloudinary Full URL |
| `STRIPE_SECRET_KEY` | `sk_test_your_stripe_secret_key` | Stripe Test Secret Key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_your_stripe_webhook_secret` | Stripe Webhook Secret |
| `FRONTEND_URL` | `https://your-frontend-app.vercel.app` | Your Vercel frontend URL |

5. Click **Create Web Service**.
6. Once deployed, note down your Render backend URL (e.g., `https://hmsports-backend.onrender.com`).

---

## ⚡ Part 2: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository (`hammadasdfg6-glitch/ICT-project`).
4. In the configuration screen:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (or `frontend` if deploying standalone static folder)
5. (Optional) If you want direct client calls instead of Vercel proxy rewrites, update the destination in `vercel.json` to your exact Render URL.

### Step 2: Deploy
1. Click **Deploy**.
2. Vercel will deploy the site in under 30 seconds.
3. Update `FRONTEND_URL` in your Render service with the newly generated Vercel URL (e.g. `https://hmsports.vercel.app`).

---

## 💳 Part 3: Stripe Webhook Configuration (Production)
1. Go to [Stripe Dashboard ➔ Developers ➔ Webhooks](https://dashboard.stripe.com/test/webhooks).
2. Click **Add endpoint**.
3. **Endpoint URL**: `https://hmsports-backend.onrender.com/webhook`
4. **Events to send**: Select `checkout.session.completed`.
5. Copy the **Signing secret** (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` on Render.

---

## 🧪 Post-Deployment Checklist
- [ ] Visit `https://hmsports-backend.onrender.com/health` ➔ should return `{ status: "healthy" }`.
- [ ] Visit `https://hmsports-backend.onrender.com/api-docs` ➔ Swagger UI loads.
- [ ] Open your Vercel URL, register/login, add items to cart, and checkout with Stripe test card.
