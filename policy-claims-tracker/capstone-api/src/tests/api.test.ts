import request from "supertest";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

import { app } from "../app.js";
import { Claim } from "../models/Claim.js";
import { Policy } from "../models/Policy.js";
import { User } from "../models/User.js";

let mongoServer: MongoMemoryServer;
let token = "";
let policyId = "";

describe("API integration", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Promise.all([Claim.deleteMany({}), Policy.deleteMany({}), User.deleteMany({})]);

    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Test Admin",
      email: "admin@test.local",
      password: "Password123!",
      role: "admin",
    });

    token = registerResponse.body.token as string;

    const user = await User.findOne({ email: "admin@test.local" });
    const policy = await Policy.create({
      policyNumber: "POL-TEST-1",
      holderName: "Policy Holder",
      type: "auto",
      premium: 500,
      status: "active",
      effectiveDate: new Date("2026-01-01"),
      expirationDate: new Date("2027-01-01"),
      owner: user!._id,
    });
    policyId = String(policy._id);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("register returns token", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "user2@test.local",
      password: "Password123!",
      role: "adjuster",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
  });

  it("login wrong password returns 401", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@test.local",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
  });

  it("create claim returns 201", async () => {
    const response = await request(app)
      .post("/api/claims")
      .set("Authorization", `Bearer ${token}`)
      .send({
        policy: policyId,
        description: "Accident claim",
        incidentDate: "2026-04-10",
        amount: 1200,
      });

    expect(response.status).toBe(201);
    expect(response.body.claimNumber).toMatch(/^CLM-/);
  });

  it("get claims without auth returns 401", async () => {
    const response = await request(app).get("/api/claims");
    expect(response.status).toBe(401);
  });

  it("create claim missing fields returns 400", async () => {
    const response = await request(app)
      .post("/api/claims")
      .set("Authorization", `Bearer ${token}`)
      .send({
        policy: policyId,
      });

    expect(response.status).toBe(400);
  });
});
