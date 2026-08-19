import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/users.model.js";
import { databaseConnection } from "../src/config/db.config.js";

describe("User & Authentication Endpoints (/user)", () => {
  const timestamp = Date.now();
  const testCustomer = {
    name: "Vitest Customer",
    email: `vitest_cust_${timestamp}@test.com`,
    password: "Password123!",
    phone: "03001234567"
  };

  const testAdmin = {
    name: "Vitest Admin",
    email: `vitest_admin_${timestamp}@test.com`,
    password: "AdminPassword123!",
    phone: "03009876543",
    adminSecret: process.env.ADMIN_SECRET || "1234"
  };

  let customerCookie = "";
  let adminCookie = "";

  beforeAll(async () => {
    await databaseConnection();
  });

  describe("POST /user/register-customer", () => {
    it("should return 400 when email or password is missing", async () => {
      const res = await request(app)
        .post("/user/register-customer")
        .send({ name: "Incomplete User" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    it("should successfully register a customer and return a token with cookie", async () => {
      const res = await request(app)
        .post("/user/register-customer")
        .send(testCustomer);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testCustomer.email);
      expect(res.body.user.role).toBe("customer");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return 409 when registering with an existing email", async () => {
      const res = await request(app)
        .post("/user/register-customer")
        .send(testCustomer);

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe("POST /user/register-admin", () => {
    it("should return 401 when adminSecret is invalid", async () => {
      const res = await request(app)
        .post("/user/register-admin")
        .send({
          ...testAdmin,
          email: `wrong_secret_${timestamp}@test.com`,
          adminSecret: "wrong_key_123"
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid admin secret/i);
    });

    it("should register an admin successfully when adminSecret matches", async () => {
      const res = await request(app)
        .post("/user/register-admin")
        .send(testAdmin);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe("admin");
    });
  });

  describe("POST /user/login", () => {
    it("should return 400 when email or password is missing", async () => {
      const res = await request(app)
        .post("/user/login")
        .send({ email: testCustomer.email });

      expect(res.status).toBe(400);
    });

    it("should return 401 for incorrect password", async () => {
      const res = await request(app)
        .post("/user/login")
        .send({ email: testCustomer.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
    });

    it("should successfully log in customer and return auth cookie", async () => {
      const res = await request(app)
        .post("/user/login")
        .send({ email: testCustomer.email, password: testCustomer.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      customerCookie = cookies.map(c => c.split(";")[0]).join("; ");
    });

    it("should successfully log in admin", async () => {
      const res = await request(app)
        .post("/user/login")
        .send({ email: testAdmin.email, password: testAdmin.password });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("admin");

      const cookies = res.headers["set-cookie"];
      adminCookie = cookies.map(c => c.split(";")[0]).join("; ");
    });
  });

  describe("GET /user/me", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/user/me");
      expect(res.status).toBe(401);
    });

    it("should return authenticated user profile when cookie is provided", async () => {
      const res = await request(app)
        .get("/user/me")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testCustomer.email);
    });
  });

  describe("POST /user/logout", () => {
    it("should clear auth cookies and return 200", async () => {
      const res = await request(app)
        .post("/user/logout")
        .set("Cookie", customerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });
});
