<div align="center">

# 🏆 HM SPORTS — High-Performance E-Commerce & Inventory Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-v9.9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis_Cloud-v6.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Stripe_Payments-v22.5-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vitest](https://img.shields.io/badge/Vitest-43_Tests_Passed-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![OpenAPI/Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:9000/api-docs)

<p align="center">
  A full-stack, enterprise-ready sports goods e-commerce platform and inventory management system engineered with <b>Express 5, MongoDB Atlas, Redis caching, Cloudinary media delivery, Stripe Checkout</b>, and interactive <b>Swagger API Documentation</b>.
</p>

[Explore API Docs](http://localhost:9000/api-docs) • [View Deployment Guide](DEPLOYMENT.md) • [Report Issue](https://github.com/hammadasdfg6-glitch/ICT-project/issues)

</div>

---

## 🌟 Key Features

### 🛍️ Customer Experience & Storefront
* **Catalog Exploration**: Real-time product browsing across 5 categories (*Cricket, Football, Basketball, Running, Yoga*) with case-insensitive search and price filtering.
* **Instant Sub-Millisecond Caching**: In-memory Redis caching (`products:all`, `products:{query}`) with 70-second TTL offloading 90%+ of read load.
* **Smart Shopping Cart**: Dedicated Redis-backed customer cart (`cart:<email>`) with automatic quantity consolidation and real-time inventory ceiling validation.
* **Pre-Checkout Shipping Verification**: Interactive shipping details modal collecting customer delivery address, city, postal code, and phone before payment.
* **Stripe Hosted Checkout (PKR)**: Automated Stripe Checkout Session generation with locked pre-filled customer email, comprehensive item metadata, and cryptographic webhook verification.
* **Order History & Milestone Tracking**: Real-time customer order tracking cached in Redis with instant delivery milestone status updates.

### ⚙️ Administrator & Store Management
* **Secure Admin Onboarding**: Admin registration verified via server-side `ADMIN_SECRET` environment validation.
* **Live Inventory Management**: Complete CRUD operations for products with automatic Cloudinary CDN media uploads (`hmsports/products`).
* **Instant Product Modification**: Dedicated edit modal allowing real-time price updates, stock changes, description edits, and photo replacements.
* **Order Status Lifecycle Tracking**: Interactive fulfillment dropdowns (*🟡 Confirmed ➔ 🔵 Shipping ➔ 🟠 Delivering ➔ 🟢 Delivered*) with instant Redis customer cache invalidation.

### 🛡️ Security & Architecture
* **HTTP-Only JWT Authentication**: Multi-cookie clearing on logout (`token`, `refreshToken`, `accessToken`, `jwt`) with environment-aware `SameSite=None; Secure=true` for cross-origin deployments.
* **Password Encryption**: Secure password hashing with `bcrypt` (10 salt rounds).
* **Idempotent Order Creation**: Unique `stripeSessionId` verification prevents duplicate orders and double-decrementing stock.
* **Modern Security Headers**: `helmet` and fine-tuned CORS configuration.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    Client["🌐 Web Browser (Desktop & Mobile)"] -->|HTTPS / REST API| Express["⚡ Express 5 Application Server"]
    
    subgraph Security ["Security & Auth Middleware"]
        Express --> Auth["🔐 JWT Cookie & Role Verifier"]
        Express --> Cors["🛡️ CORS & Helmet Security"]
    end
    
    subgraph Data ["Data & Caching Layer"]
        Express -->|Sub-ms Reads & Carts| Redis["🚀 Redis Cloud (ioredis)"]
        Express -->|Persistent Documents| Mongo["🍃 MongoDB Atlas"]
    end
    
    subgraph External ["External Cloud Services"]
        Express -->|Payment Sessions & Webhooks| Stripe["💳 Stripe Payment Gateway"]
        Express -->|Image CDN Hosting| Cloudinary["☁️ Cloudinary Storage"]
    end
```

---

## 📁 Project Structure

```
ICT-Project/
├── frontend/                     # Client-side UI & Assets
│   ├── images/                   # High-resolution product images & logos
│   ├── about.html & about.css    # About Us page
│   ├── admin.html                # Administrator portal & inventory manager
│   ├── booking-cancelled.html    # Stripe payment cancel return page
│   ├── booking-success.html      # Stripe payment success & order fulfillment
│   ├── contact.html & contact.css# Customer support & inquiries
│   ├── faq.html & faq.css        # Frequently asked questions
│   ├── index.html                # Homepage & Hero storefront
│   ├── orders.html               # Customer order history & tracking
│   ├── products.html & products.css # Product catalog with filter drawer
│   ├── script.js                 # Global frontend state, cart & auth manager
│   └── style.css                 # Custom design system & Bootstrap styling
├── src/                          # Backend API Source
│   ├── config/                   # Cloudinary, Database, Redis & Swagger configs
│   ├── controllers/              # Route controllers (Buy, Checkout, Order, Product, User, Webhook)
│   ├── middlewares/              # JWT Auth verification & Global Error Handler
│   ├── models/                   # Mongoose schemas (Orders, Product, Users)
│   ├── routes/                   # Modular Express routers
│   ├── utils/                    # appError & catchAsync helper utilities
│   └── app.js                    # Express app initialization & middleware stack
├── tests/                        # Vitest Automated Test Suite (43 Tests)
│   ├── setup.js                  # Test database & lifecycle hooks
│   ├── buy.test.js               # Cart & Stripe checkout tests
│   ├── order.test.js             # Order history & admin status update tests
│   ├── product.test.js           # Catalog queries, search & CRUD tests
│   ├── swagger.test.js           # OpenAPI 3.0 specification tests
│   ├── user.test.js              # Authentication, cookie & profile tests
│   └── webhook.test.js           # Stripe webhook handler tests
├── .env.example                  # Environment variables template
├── .gitignore                    # Production git ignore rules
├── DEPLOYMENT.md                 # Complete Render & Vercel deployment guide
├── package.json                  # Dependencies & scripts
├── render.yaml                   # 1-Click Render infrastructure blueprint
├── server.js                     # Server entrypoint (Port 9000)
├── vercel.json                   # Vercel static routing & API proxy rewrites
└── vitest.config.js              # Vitest runner configuration
```

---

## 📚 API Endpoints Summary (OpenAPI 3.0)

Interactive documentation available at: **`http://localhost:9000/api-docs`**

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/user/register-customer` | Register customer account | No |
| **Auth** | `POST` | `/user/register-admin` | Register admin with `ADMIN_SECRET` | No |
| **Auth** | `POST` | `/user/login` | Login user & set auth cookie | No |
| **Auth** | `POST` | `/user/logout` | Purge all auth cookies | No |
| **Auth** | `GET` | `/user/me` | Get current logged-in profile | 🔒 Yes |
| **Catalog** | `GET` | `/product` | List products with filters & Redis cache | No |
| **Catalog** | `GET` | `/product/:id` | Get single product by ID | No |
| **Catalog** | `POST` | `/product` | Add product with Cloudinary photo | 👑 Admin |
| **Catalog** | `PATCH` | `/product` | Update product details & image | 👑 Admin |
| **Catalog** | `DELETE` | `/product` | Delete product & flush cache | 👑 Admin |
| **Cart** | `POST` | `/buy` | Add item to customer Redis cart | 🔒 Yes |
| **Cart** | `GET` | `/buy/cart` | Get active cart items | 🔒 Yes |
| **Cart** | `DELETE` | `/buy/:id` | Remove specific item from cart | 🔒 Yes |
| **Checkout** | `PATCH` | `/buy/checkout` | Create Stripe Hosted Checkout Session | 🔒 Yes |
| **Checkout** | `GET` | `/buy/confirm-session`| Verify Stripe return & create order | No |
| **Orders** | `GET` | `/order` | Get customer purchase history | 🔒 Yes |
| **Orders** | `GET` | `/order/get` | Get all store orders with status filter | 👑 Admin |
| **Orders** | `PATCH` | `/order` | Update order fulfillment status | 👑 Admin |
| **Webhook** | `POST` | `/webhook` | Stripe automated event webhook | Stripe Signature |

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
* [Node.js](https://nodejs.org/) `>= 18.0.0`
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance
* [Redis Cloud](https://redis.io/cloud/) or local Redis server
* [Stripe Developer Account](https://stripe.com/)
* [Cloudinary Account](https://cloudinary.com/)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/hammadasdfg6-glitch/ICT-project.git
cd ICT-project
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to [`.env.example`](.env.example)):
```env
PORT=9000
NODE_ENV=development

# Database & Cache
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.yepkpik.mongodb.net/hmsports?appName=Cluster0
REDIS_HOST=money-charcoal-adaptable-53915.db.redis.io
REDIS_PORT=12041
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password

# Authentication
JWT_SECRET=your_jwt_secret_key
ADMIN_SECRET=1234

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# Stripe Gateway
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
FRONTEND_URL=http://localhost:9000
```

### 4. Start the Application
```bash
npm start
```
* **Storefront**: Open [http://localhost:9000](http://localhost:9000)
* **Admin Portal**: Open [http://localhost:9000/admin.html](http://localhost:9000/admin.html)
* **Swagger API Docs**: Open [http://localhost:9000/api-docs](http://localhost:9000/api-docs)

---

## 🧪 Running Automated Tests

Run the full automated test suite using **Vitest**:
```bash
npm test
```

### Test Suite Results: `43 / 43 Passed (100%)`
```
 ✓ tests/product.test.js  (11 tests)
 ✓ tests/buy.test.js      (8 tests)
 ✓ tests/order.test.js    (9 tests)
 ✓ tests/user.test.js     (12 tests)
 ✓ tests/webhook.test.js  (1 test)
 ✓ tests/swagger.test.js  (2 tests)

 Test Files  6 passed (6)
      Tests  43 passed (43)
```

---

## 🌐 Production Deployment

* **Backend on Railway (Current)**: Pre-configured with [`railway.json`](railway.json) and [`Procfile`](Procfile).
* **Backend on Render (Alternative)**: 1-click configuration via [`render.yaml`](render.yaml).
* **Frontend on Vercel**: Full edge proxy rewrite configuration via [`vercel.json`](vercel.json).
* Refer to the comprehensive [**`DEPLOYMENT.md`**](DEPLOYMENT.md) guide for complete walkthrough instructions.

---

## 👥 Authors & Contributors

* **Muhammad Hammad** — Full-Stack Engineer & Project Lead ([@hammadasdfg6-glitch](https://github.com/hammadasdfg6-glitch))

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
