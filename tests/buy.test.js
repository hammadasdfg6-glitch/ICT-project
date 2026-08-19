import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { databaseConnection } from "../src/config/db.config.js";
import { Product } from "../src/models/product.model.js";
import redis from "../src/config/redis.config.js";
import jwt from "jsonwebtoken";

describe("Cart & Stripe Checkout Endpoints (/buy)", () => {
  const customerEmail = `buy_test_${Date.now()}@test.com`;
  let customerToken = "";
  let sampleProduct = null;

  beforeAll(async () => {
    await databaseConnection();

    customerToken = jwt.sign(
      { _id: "6a84355321f079d0a4263650", email: customerEmail, role: "customer" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    sampleProduct = await Product.findOne().lean();
  });

  describe("POST /buy (Add to Cart)", () => {
    it("should return 401 if not logged in", async () => {
      const res = await request(app)
        .post("/buy")
        .send({ name: sampleProduct?.name, quantity: 1 });

      expect(res.status).toBe(401);
    });

    it("should add product to Redis cart when authenticated", async () => {
      const res = await request(app)
        .post("/buy")
        .set("Cookie", `token=${customerToken}`)
        .send({
          name: sampleProduct?.name,
          id: sampleProduct?._id.toString(),
          quantity: 2
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/added to cart/i);
    });
  });

  describe("GET /buy/cart", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/buy/cart");
      expect(res.status).toBe(401);
    });

    it("should return customer active cart items", async () => {
      const res = await request(app)
        .get("/buy/cart")
        .set("Cookie", `token=${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.cart)).toBe(true);
      expect(res.body.cart.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /buy/checkout (Stripe Checkout Session)", () => {
    it("should create a Stripe session and return hosted checkout URL", async () => {
      const res = await request(app)
        .patch("/buy/checkout")
        .set("Cookie", `token=${customerToken}`)
        .send({
          name: "Test Customer",
          phone: "03001234567",
          address: "House 1, Street 2, F-8/1",
          city: "Islamabad",
          postalCode: "44000"
        });

      expect(res.status).toBe(200);
      expect(res.body.url).toBeDefined();
      expect(res.body.url).toMatch(/stripe\.com/i);
    });
  });

  describe("DELETE /buy/:id", () => {
    it("should remove item from Redis cart", async () => {
      const res = await request(app)
        .delete(`/buy/${sampleProduct?._id}`)
        .set("Cookie", `token=${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });

    it("should return 400 or 404 when cart is empty or item is not found", async () => {
      const res = await request(app)
        .delete(`/buy/${sampleProduct?._id}`)
        .set("Cookie", `token=${customerToken}`);

      expect([400, 404]).toContain(res.status);
    });
  });

  describe("GET /buy/confirm-session", () => {
    it("should return 400 if session_id is missing", async () => {
      const res = await request(app).get("/buy/confirm-session");
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/session id is required/i);
    });
  });
});
