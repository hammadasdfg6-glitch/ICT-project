# 🚀 HM Sports Full-Stack Deployment Guide

This guide details how to deploy the **Backend on Railway or Render** and the **Frontend on Vercel**.

---

## 🚆 Part 1: Deploy Backend to Railway (Recommended / Current Plan)

### Step 1: Create a Project on Railway
1. Log in to [Railway](https://railway.app/).
2. Click **+ New Project** ➔ **Deploy from GitHub repo**.
3. Select your repository: `hammadasdfg6-glitch/ICT-project`.
4. Railway will automatically detect the Node.js environment via `railway.json` and `package.json`.

### Step 2: Configure Environment Variables on Railway
Click on your newly created service ➔ Go to the **Variables** tab ➔ Click **RAW Editor** or add each variable:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.yepkpik.mongodb.net/hmsports?appName=Cluster0
REDIS_HOST=your-redis-host.db.redis.io
REDIS_PORT=12041
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_jwt_secret_key
ADMIN_SECRET=1234
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Step 3: Generate Public Domain
1. In your service settings on Railway, go to the **Settings** tab.
2. Scroll to **Networking** ➔ Click **Generate Domain**.
3. You will receive a public URL (e.g. `https://ict-project-production.up.railway.app`).
4. Verify by opening `https://<your-railway-url>/health` ➔ should return `{ "status": "healthy" }`.

---

## 🛠️ Part 2: Deploy Backend to Render (Alternative / Future Plan)

### Step 1: Create a New Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository (`hammadasdfg6-glitch/ICT-project`).
4. Configure settings:
   - **Name**: `hmsports-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Add the same Environment Variables listed above under the **Environment** tab.
6. Note down your Render backend URL (e.g., `https://hmsports-backend.onrender.com`).

---

## ⚡ Part 3: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository (`hammadasdfg6-glitch/ICT-project`).
4. In `vercel.json`, ensure the proxy rewrite destination points to your live Railway (or Render) backend URL.

### Step 2: Deploy & Link
1. Click **Deploy**.
2. Once Vercel deploys (e.g. `https://hmsports.vercel.app`), update `FRONTEND_URL` in your Railway/Render variables.

---

## 💳 Part 4: Stripe Webhook Configuration (Production)
1. Go to [Stripe Dashboard ➔ Developers ➔ Webhooks](https://dashboard.stripe.com/test/webhooks).
2. Click **Add endpoint**.
3. **Endpoint URL**: `https://<your-railway-or-render-app>/webhook`
4. **Events to send**: Select `checkout.session.completed`.
5. Copy the **Signing secret** (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` on Railway/Render.

---

## 🧪 Post-Deployment Verification Checklist
- [ ] Visit `https://<backend-url>/health` ➔ returns `{ status: "healthy" }`.
- [ ] Visit `https://<backend-url>/api-docs` ➔ interactive Swagger UI renders.
- [ ] Open your Vercel URL, register/login, add items to cart, and checkout with Stripe.
