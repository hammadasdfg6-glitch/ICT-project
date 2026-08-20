import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { databaseConnection } from "../src/config/db.config.js";
import jwt from "jsonwebtoken";

describe("Joi Request & Parameter Validation Suite", () => {
  let adminToken = "";
  let customerToken = "";

  beforeAll(async () => {
    await databaseConnection();

    adminToken = jwt.sign(
      { _id: "6a84355321f079d0a4263670", email: "admin_val@test.com", role: "admin" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    customerToken = jwt.sign(
      { _id: "6a84355321f079d0a4263671", email: "cust_val@test.com", role: "customer" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );
  });

  describe("User Registration & Login Validations", () => {
    it("should return 400 for invalid email format on customer registration", async () => {
      const res = await request(app)
        .post("/user/register-customer")
        .send({
          name: "John Doe",
          email: "invalid-email-format",
          password: "password123"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/valid email/i);
    });

    it("should return 400 for password less than 6 characters", async () => {
      const res = await request(app)
        .post("/user/register-customer")
        .send({
          name: "John Doe",
          email: "valid@email.com",
          password: "123"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });

    it("should return 400 when adminSecret is missing on admin registration", async () => {
      const res = await request(app)
        .post("/user/register-admin")
        .send({
          name: "Admin User",
          email: "admin_test@email.com",
          password: "adminpassword123"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/admin secret/i);
    });

    it("should return 400 for missing password on login", async () => {
      const res = await request(app)
        .post("/user/login")
        .send({ email: "test@user.com" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/password/i);
    });
  });

  describe("Product Validations", () => {
    it("should return 400 when GET /product/:id has an invalid ObjectId", async () => {
      const res = await request(app).get("/product/invalid-id-123");
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid Product ID/i);
    });

    it("should return 400 when admin creates product with negative price", async () => {
      const res = await request(app)
        .post("/product")
        .set("Cookie", `token=${adminToken}`)
        .field("name", "Negative Price Item")
        .field("category", "Football")
        .field("price", "-500")
        .field("quantity", "10");

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/positive/i);
    });

    it("should return 400 when admin updates product with invalid _id format", async () => {
      const res = await request(app)
        .patch("/product")
        .set("Cookie", `token=${adminToken}`)
        .send({
          _id: "not-an-objectid",
          price: 500
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid Product ID/i);
    });
  });

  describe("Cart & Order Validations", () => {
    it("should return 400 when adding to cart without product id or name", async () => {
      const res = await request(app)
        .post("/buy")
        .set("Cookie", `token=${customerToken}`)
        .send({ quantity: 2 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Product ID or Name/i);
    });

    it("should return 400 when marking order with invalid status value", async () => {
      const res = await request(app)
        .patch("/order")
        .set("Cookie", `token=${adminToken}`)
        .send({
          orderId: "6a84355321f079d0a4263672",
          status: "unknown_status"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Status must be one of/i);
    });
  });
});