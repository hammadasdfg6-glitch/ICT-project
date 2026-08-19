import swaggerUi from "swagger-ui-express";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "HM Sports E-Commerce & Inventory REST API",
    version: "1.0.0",
    description: `### 🏆 Welcome to the HM Sports API Documentation
This REST API powers the **HM Sports** store platform featuring:
- **Authentication**: JWT Cookies & Bearer Tokens for Customers & Admins.
- **Product Catalog**: High-performance MongoDB queries with Redis caching & Cloudinary CDN integration.
- **Shopping Cart**: Real-time Redis-backed cart operations.
- **Stripe Checkout**: Integrated card payments in PKR, locked email prefill, and shipping address recording.
- **Order Management & Fulfillment**: Admin order status lifecycle tracking (Confirmed ➔ Shipping ➔ Delivering ➔ Delivered).
- **Webhooks**: Stripe raw webhook signature verification and inventory deduction.`,
    contact: {
      name: "HM Sports Engineering Team",
      email: "hammadasdfg6@gmail.com"
    }
  },
  servers: [
    {
      url: "https://hmsports-backend-production.up.railway.app",
      description: "Live Production Server (Railway)"
    },
    {
      url: "http://localhost:9000",
      description: "Local Development Server"
    }
  ],
  tags: [
    {
      name: "Authentication & Users",
      description: "Customer/Admin registration, login, logout, and profile session endpoints."
    },
    {
      name: "Product Catalog",
      description: "Public catalog querying, Redis caching, and Admin product management (Add, Update, Delete)."
    },
    {
      name: "Cart & Checkout",
      description: "Redis shopping cart storage, Stripe Checkout session creation, and confirmation."
    },
    {
      name: "Orders & Fulfillment",
      description: "Customer order history and Admin status updates & fulfillment tracking."
    },
    {
      name: "Webhooks",
      description: "Stripe event webhooks for automated order processing and stock reduction."
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "HTTP-only JWT cookie named 'token' automatically set upon login."
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Bearer token sent in the Authorization header: 'Bearer <token>'"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6a84355321f079d0a4263648" },
          name: { type: "string", example: "Ali Khan" },
          email: { type: "string", format: "email", example: "alikhan@gmail.com" },
          phone: { type: "number", example: 3001234567 },
          role: { type: "string", enum: ["customer", "admin"], example: "customer" }
        }
      },
      CustomerRegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Ali Khan" },
          email: { type: "string", format: "email", example: "alikhan@gmail.com" },
          password: { type: "string", format: "password", minLength: 6, example: "password123" },
          phone: { type: "string", example: "03001234567" }
        }
      },
      AdminRegisterInput: {
        type: "object",
        required: ["name", "email", "password", "adminSecret"],
        properties: {
          name: { type: "string", example: "Admin Name" },
          email: { type: "string", format: "email", example: "admin@hmsports.com" },
          password: { type: "string", format: "password", example: "adminPassword123" },
          phone: { type: "string", example: "03001234567" },
          adminSecret: { type: "string", example: "your_admin_secret_key" }
        }
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "hammadasdfg6@gmail.com" },
          password: { type: "string", format: "password", example: "1234" }
        }
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6a84361a277874bb50ec7f74" },
          name: { type: "string", example: "Official Indoor Basketball" },
          description: { type: "string", example: "High-grip composite leather basketball engineered for competitive indoor games." },
          category: { type: "string", enum: ["Cricket", "Football", "Basketball", "Running", "Yoga"], example: "Basketball" },
          price: { type: "number", example: 3500 },
          quantity: { type: "number", example: 15 },
          status: { type: "string", enum: ["available", "Out of Stock"], example: "available" },
          img_url: { type: "string", format: "uri", example: "https://res.cloudinary.com/bs2muvbu/image/upload/v1787050082/hmsports/products/basketball1.png" }
        }
      },
      AddToCartInput: {
        type: "object",
        required: ["name", "quantity"],
        properties: {
          name: { type: "string", example: "Pro-Series Elite Soccer Ball" },
          id: { type: "string", example: "6a84361a277874bb50ec7f70" },
          quantity: { type: "number", minimum: 1, example: 2 }
        }
      },
      CartItem: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6a84361a277874bb50ec7f70" },
          name: { type: "string", example: "Pro-Series Elite Soccer Ball" },
          price: { type: "number", example: 1850 },
          img_url: { type: "string", example: "https://res.cloudinary.com/bs2muvbu/image/upload/v1787050070/hmsports/products/football1.png" },
          quantity: { type: "number", example: 2 }
        }
      },
      CheckoutInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Ali Khan" },
          phone: { type: "string", example: "03001234567" },
          address: { type: "string", example: "House 12, Street 4, Sector F-7/2" },
          city: { type: "string", example: "Islamabad" },
          postalCode: { type: "string", example: "44000" }
        }
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6a8443d21a6028c56cc4d3a2" },
          product: {
            type: "array",
            items: { type: "string" },
            example: ["Pro-Series Elite Soccer Ball", "Official Indoor Basketball"]
          },
          productId: {
            type: "array",
            items: { type: "string" },
            example: ["6a84361a277874bb50ec7f70", "6a84361a277874bb50ec7f74"]
          },
          quantity: { type: "number", example: 3 },
          price: { type: "number", example: 5350 },
          Address: { type: "string", example: "House 12, Street 4, Sector F-7/2, Islamabad 44000" },
          phone: { type: "number", example: 3001234567 },
          email: { type: "string", example: "alikhan@gmail.com" },
          status: { type: "string", enum: ["confirmed", "shipping", "delivering", "delivered"], example: "confirmed" },
          createdAt: { type: "string", format: "date-time", example: "2026-08-18T11:36:50.000Z" }
        }
      },
      OrderStatusUpdateInput: {
        type: "object",
        required: ["orderId", "status"],
        properties: {
          orderId: { type: "string", example: "6a8443d21a6028c56cc4d3a2" },
          status: { type: "string", enum: ["confirmed", "shipping", "delivering", "delivered"], example: "shipping" }
        }
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation executed successfully." }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "Fail" },
          statusCode: { type: "number", example: 400 },
          message: { type: "string", example: "Validation or operational error message." }
        }
      }
    }
  },
  paths: {
    "/user/register-customer": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Register a new customer",
        description: "Creates a new customer account, hashes password with bcrypt, generates JWT, and sets an HTTP-only authentication cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerRegisterInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Customer successfully registered and authenticated.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Customer successfully registered!" },
                    success: { type: "boolean", example: true },
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          400: { description: "Missing required fields.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "Email already registered.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/user/register-admin": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Register a new store administrator",
        description: "Registers an admin account protected by `ADMIN_SECRET` environment key verification.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminRegisterInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Admin successfully registered.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Admin successfully registered!" },
                    success: { type: "boolean", example: true },
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          401: { description: "Invalid admin secret key.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/user/login": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Login customer or administrator",
        description: "Validates email and password, generates JWT token, and sets the HTTP-only 'token' cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Successfully logged in.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Successfully logged in!" },
                    success: { type: "boolean", example: true },
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          401: { description: "Invalid email or password.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/user/logout": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Logout user and purge all auth cookies",
        description: "Clears all auth cookie variations (`token`, `refreshToken`, `accessToken`, `jwt`) with `Path=/` matching.",
        responses: {
          200: {
            description: "Successfully logged out.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" }
              }
            }
          }
        }
      }
    },
    "/user/me": {
      get: {
        tags: ["Authentication & Users"],
        summary: "Get current authenticated user profile",
        description: "Retrieves logged-in user identity from JWT cookie or Bearer token.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: "Authenticated user details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          401: { description: "Unauthenticated.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/product": {
      get: {
        tags: ["Product Catalog"],
        summary: "List all store products with filters & Redis cache",
        description: "Fetches products from MongoDB with Redis caching. Supports filtering by category, search by name, price range, and availability status.",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category (Cricket, Football, Basketball, Running, Yoga)" },
          { name: "name", in: "query", schema: { type: "string" }, description: "Search products by name substring" },
          { name: "status", in: "query", schema: { type: "string", enum: ["available", "Out of Stock"] }, description: "Filter by stock status" },
          { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum price in PKR" },
          { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum price in PKR" }
        ],
        responses: {
          200: {
            description: "List of catalog products.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Successfully got products" },
                    success: { type: "boolean", example: true },
                    products: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Product Catalog"],
        summary: "Add new product (Admin Only)",
        description: "Uploads product image to Cloudinary folder `hmsports/products`, saves product in MongoDB, and flushes Redis cache.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "category", "price", "image"],
                properties: {
                  name: { type: "string", example: "Pro Willow Bat" },
                  category: { type: "string", enum: ["Cricket", "Football", "Basketball", "Running", "Yoga"], example: "Cricket" },
                  price: { type: "number", example: 12500 },
                  quantity: { type: "number", example: 10 },
                  status: { type: "string", enum: ["available", "Out of Stock"], example: "available" },
                  description: { type: "string", example: "Hand-selected English willow for powerful strokes." },
                  image: { type: "string", format: "binary", description: "Image file to upload to Cloudinary" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Product created successfully.",
            content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, success: { type: "boolean" }, product: { $ref: "#/components/schemas/Product" } } } } }
          },
          403: { description: "Forbidden: Admin access required." }
        }
      },
      patch: {
        tags: ["Product Catalog"],
        summary: "Update existing product (Admin Only)",
        description: "Modifies product attributes and optionally uploads a replacement photo to Cloudinary. Invalidate Redis `products:*` cache.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["_id"],
                properties: {
                  _id: { type: "string", example: "6a84361a277874bb50ec7f74" },
                  name: { type: "string", example: "Official Indoor Basketball" },
                  category: { type: "string", example: "Basketball" },
                  price: { type: "number", example: 3500 },
                  quantity: { type: "number", example: 15 },
                  status: { type: "string", enum: ["available", "Out of Stock"], example: "available" },
                  description: { type: "string", example: "High-grip composite leather basketball." },
                  image: { type: "string", format: "binary", description: "Optional replacement image file" }
                }
              }
            },
            "application/json": {
              schema: {
                type: "object",
                required: ["_id"],
                properties: {
                  _id: { type: "string", example: "6a84361a277874bb50ec7f74" },
                  name: { type: "string" },
                  category: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "number" },
                  status: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Product updated successfully.",
            content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, success: { type: "boolean" }, product: { $ref: "#/components/schemas/Product" } } } } }
          },
          404: { description: "Product not found." }
        }
      },
      delete: {
        tags: ["Product Catalog"],
        summary: "Delete a product (Admin Only)",
        description: "Removes product from MongoDB and purges Redis product caches.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["_id"],
                properties: {
                  _id: { type: "string", example: "6a84361a277874bb50ec7f74" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Successfully Deleted Product.", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      }
    },
    "/product/{id}": {
      get: {
        tags: ["Product Catalog"],
        summary: "Get single product by ID",
        description: "Retrieves complete product metadata by its MongoDB ObjectId.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, example: "6a84361a277874bb50ec7f74" }
        ],
        responses: {
          200: {
            description: "Product found.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Successfully got Product" },
                    success: { type: "boolean", example: true },
                    product: { $ref: "#/components/schemas/Product" }
                  }
                }
              }
            }
          },
          404: { description: "Product not found." }
        }
      }
    },
    "/buy": {
      post: {
        tags: ["Cart & Checkout"],
        summary: "Add product to customer cart",
        description: "Stores selected product quantity in customer's Redis cart cache key `cart:<email>`.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddToCartInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Product successfully added to cart.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } }
          }
        }
      }
    },
    "/buy/cart": {
      get: {
        tags: ["Cart & Checkout"],
        summary: "Get customer's current cart items",
        description: "Retrieves all items stored in customer's Redis cart `cart:<email>`.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: "Active cart items.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cart is loaded successfully" },
                    success: { type: "boolean", example: true },
                    cart: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CartItem" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/buy/{id}": {
      delete: {
        tags: ["Cart & Checkout"],
        summary: "Remove an item from cart",
        description: "Removes specific product from Redis cart key `cart:<email>`.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, example: "6a84361a277874bb50ec7f70" }
        ],
        responses: {
          200: { description: "Product deleted Successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } }
        }
      }
    },
    "/buy/checkout": {
      patch: {
        tags: ["Cart & Checkout"],
        summary: "Initiate Stripe Checkout Session",
        description: "Creates a Stripe Hosted Checkout Session in PKR. Auto-fills & locks `customer_email`, includes shipping address details, and attaches item metadata.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckoutInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Stripe Checkout session URL created.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Successfully purchased" },
                    success: { type: "string", example: "true" },
                    url: { type: "string", format: "uri", example: "https://checkout.stripe.com/c/pay/cs_test_..." }
                  }
                }
              }
            }
          },
          400: { description: "Cart is empty." }
        }
      }
    },
    "/buy/confirm-session": {
      get: {
        tags: ["Cart & Checkout"],
        summary: "Confirm Stripe session & create order on customer return",
        description: "Called by `booking-success.html`. Retrieves Stripe session, fulfills order in MongoDB, and flushes Redis cart cache.",
        parameters: [
          { name: "session_id", in: "query", required: true, schema: { type: "string" }, description: "Stripe Checkout Session ID" }
        ],
        responses: {
          200: {
            description: "Order confirmed and saved.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Order confirmed successfully" },
                    success: { type: "boolean", example: true },
                    order: { $ref: "#/components/schemas/Order" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/order": {
      get: {
        tags: ["Orders & Fulfillment"],
        summary: "Get logged-in customer's order history",
        description: "Fetches user's past purchases cached in Redis `orders:<email>` for 60 seconds.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: "Customer orders list.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Successfully got the orders!" },
                    success: { type: "boolean", example: true },
                    order: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Order" }
                    }
                  }
                }
              }
            }
          },
          404: { description: "No orders found." }
        }
      },
      patch: {
        tags: ["Orders & Fulfillment"],
        summary: "Update order status (Admin Only)",
        description: "Updates order status (confirmed ➔ shipping ➔ delivering ➔ delivered), invalidates Redis customer order cache.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderStatusUpdateInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Order status updated successfully.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } }
          },
          404: { description: "Order not found." }
        }
      }
    },
    "/order/get": {
      get: {
        tags: ["Orders & Fulfillment"],
        summary: "Get all customer orders (Admin Only)",
        description: "Admin portal endpoint to retrieve all customer orders with status filter.",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["confirmed", "shipping", "delivering", "delivered"] }, description: "Filter by order status" }
        ],
        responses: {
          200: {
            description: "List of all customer orders.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Orders Found" },
                    success: { type: "boolean", example: true },
                    orders: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Order" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/webhook": {
      post: {
        tags: ["Webhooks"],
        summary: "Stripe Webhook Event Handler",
        description: "Receives raw Stripe webhook payload. Verifies cryptographic signature using `STRIPE_WEBHOOK_SECRET`, creates confirmed order in MongoDB, decrements product inventory, and clears Redis cart.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", description: "Raw Stripe Event Payload" }
            }
          }
        },
        responses: {
          200: { description: "Webhook processed successfully." },
          400: { description: "Invalid webhook signature or payload." }
        }
      }
    }
  }
};

export const serveSwagger = swaggerUi.serve;
export const setupSwagger = swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "HM Sports API Docs",
  customCss: `
    .swagger-ui .topbar { background-color: #111827; }
    .swagger-ui .topbar img { content: url('/images/hmlogo.png'); width: 50px; }
  `
});
