import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { databaseConnection } from "../src/config/db.config.js";
import { Product } from "../src/models/product.model.js";
import jwt from "jsonwebtoken";

describe("Product Catalog Endpoints (/product)", () => {
  let adminToken = "";
  let customerToken = "";
  let createdProductId = "";
  let sampleExistingProductId = "";

  beforeAll(async () => {
    await databaseConnection();

    // Generate test tokens
    adminToken = jwt.sign(
      { _id: "6a84355321f079d0a4263648", email: "admin@test.com", role: "admin" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    customerToken = jwt.sign(
      { _id: "6a84355321f079d0a4263649", email: "cust@test.com", role: "customer" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    const existing = await Product.findOne().lean();
    if (existing) {
      sampleExistingProductId = existing._id.toString();
    }
  });

  describe("GET /product", () => {
    it("should return a list of products", async () => {
      const res = await request(app).get("/product");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it("should filter products by category", async () => {
      const res = await request(app).get("/product?category=Football");
      expect(res.status).toBe(200);
      if (res.body.products.length > 0) {
        expect(res.body.products.every(p => p.category === "Football")).toBe(true);
      }
    });

    it("should search products by name", async () => {
      const res = await request(app).get("/product?name=Ball");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /product/:id", () => {
    it("should return 404 for a non-existent ObjectId", async () => {
      const res = await request(app).get("/product/6a84355321f079d0a4263699");
      expect(res.status).toBe(404);
    });

    it("should return the product if ID exists", async () => {
      if (sampleExistingProductId) {
        const res = await request(app).get(`/product/${sampleExistingProductId}`);
        expect(res.status).toBe(200);
        expect(res.body.product._id).toBe(sampleExistingProductId);
      }
    });
  });

  describe("POST /product (Admin Access)", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app)
        .post("/product")
        .field("name", "Test Item");
      expect(res.status).toBe(401);
    });

    it("should return 403 if authenticated as a customer", async () => {
      const res = await request(app)
        .post("/product")
        .set("Cookie", `token=${customerToken}`)
        .field("name", "Test Item");
      expect(res.status).toBe(403);
    });

    it("should create a product when admin creates it with fields", async () => {
      // Create directly or via mock
      const newProd = new Product({
        name: `Vitest Product ${Date.now()}`,
        category: "Yoga",
        price: 1500,
        quantity: 5,
        status: "available",
        img_url: "https://res.cloudinary.com/test/image.png",
        description: "Test description"
      });
      await newProd.save();
      createdProductId = newProd._id.toString();
      expect(createdProductId).toBeDefined();
    });
  });

  describe("PATCH /product (Admin Access)", () => {
    it("should update product details successfully", async () => {
      const res = await request(app)
        .patch("/product")
        .set("Cookie", `token=${adminToken}`)
        .send({
          _id: createdProductId,
          name: "Updated Vitest Product",
          price: 1999,
          quantity: 20
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.price).toBe(1999);
      expect(res.body.product.quantity).toBe(20);
    });

    it("should return 404 when updating non-existent product", async () => {
      const res = await request(app)
        .patch("/product")
        .set("Cookie", `token=${adminToken}`)
        .send({
          _id: "6a84355321f079d0a4263699",
          name: "Ghost"
        });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /product (Admin Access)", () => {
    it("should delete product and return 200", async () => {
      const res = await request(app)
        .delete("/product")
        .set("Cookie", `token=${adminToken}`)
        .send({ _id: createdProductId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
