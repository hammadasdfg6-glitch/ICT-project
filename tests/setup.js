import "dotenv/config";
import mongoose from "mongoose";
import { databaseConnection } from "../src/config/db.config.js";
import redis from "../src/config/redis.config.js";
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await databaseConnection();
  }
});

afterAll(async () => {
  // Graceful teardown
});
