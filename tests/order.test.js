import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { databaseConnection } from "../src/config/db.config.js";
import { Order } from "../src/models/orders.model.js";
import jwt from "jsonwebtoken";

describe("Order & Fulfillment Endpoints (/order)", () => {
  const customerEmail = `order_test_${Date.now()}@test.com`;
  let customerToken = "";
  let adminToken = "";
  let createdOrderId = "";

  beforeAll(async () => {
    await databaseConnection();

    customerToken = jwt.sign(
      { _id: "6a84355321f079d0a4263660", email: customerEmail, role: "customer" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { _id: "6a84355321f079d0a4263661", email: "admin@hmsports.com", role: "admin" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    // Create a sample test order
    const order = await Order.create({
      product: ["Test Soccer Ball"],
      productId: ["6a84361a277874bb50ec7f70"],
      quantity: 1,
      price: 1850,
      Address: "Sector G-10, Islamabad",
      phone: 3001234567,
      email: customerEmail,
      status: "confirmed"
    });
    createdOrderId = order._id.toString();
  });

  describe("GET /order (Customer Order History)", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/order");
      expect(res.status).toBe(401);
    });

    it("should return the customer's order history", async () => {
      const res = await request(app)
        .get("/order")
        .set("Cookie", `token=${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.order)).toBe(true);
      expect(res.body.order.length).toBeGreaterThan(0);
      expect(res.body.order[0].email).toBe(customerEmail);
    });
  });

  describe("GET /order/get (Admin Access)", () => {
    it("should return 401 if not logged in", async () => {
      const res = await request(app).get("/order/get");
      expect(res.status).toBe(401);
    });

    it("should return 403 if called by a customer", async () => {
      const res = await request(app)
        .get("/order/get")
        .set("Cookie", `token=${customerToken}`);

      expect(res.status).toBe(403);
    });

    it("should return all orders when called by an admin", async () => {
      const res = await request(app)
        .get("/order/get")
        .set("Cookie", `token=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThan(0);
    });

    it("should support status filter query", async () => {
      const res = await request(app)
        .get("/order/get?status=confirmed")
        .set("Cookie", `token=${adminToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe("PATCH /order (Admin Status Update)", () => {
    it("should return 400 if orderId or status is missing", async () => {
      const res = await request(app)
        .patch("/order")
        .set("Cookie", `token=${adminToken}`)
        .send({ status: "shipping" });

      expect(res.status).toBe(400);
    });

    it("should successfully update order status", async () => {
      const res = await request(app)
        .patch("/order")
        .set("Cookie", `token=${adminToken}`)
        .send({ orderId: createdOrderId, status: "shipping" });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/order updated/i);

      // Verify in DB
      const updated = await Order.findById(createdOrderId);
      expect(updated.status).toBe("shipping");
    });

    it("should return 404 for non-existent orderId", async () => {
      const res = await request(app)
        .patch("/order")
        .set("Cookie", `token=${adminToken}`)
        .send({ orderId: "6a84355321f079d0a4263699", status: "delivered" });

      expect(res.status).toBe(404);
    });
  });
});
