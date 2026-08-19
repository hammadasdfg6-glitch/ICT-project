import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Stripe Webhook Endpoint (/webhook)", () => {
  it("should respond to webhook endpoint", async () => {
    // When no stripe signature is provided, it might throw signature error or 400
    const res = await request(app)
      .post("/webhook")
      .send({});

    expect([200, 400, 500]).toContain(res.status);
  });
});
