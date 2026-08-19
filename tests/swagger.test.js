import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Swagger Documentation Endpoints (/api-docs)", () => {
  it("GET /api-docs.json should return a valid OpenAPI 3.0 specification", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.0");
    expect(res.body.info.title).toMatch(/HM Sports/i);
    expect(res.body.paths).toBeDefined();
    expect(Object.keys(res.body.paths).length).toBeGreaterThan(10);
  });

  it("GET /api-docs/ should serve the Swagger UI HTML", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/swagger-ui/i);
  });
});
