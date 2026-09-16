import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDatabase } from "./config/db.js";
import { Claim } from "./models/Claim.js";
import { Policy } from "./models/Policy.js";
import { User } from "./models/User.js";

dotenv.config();

async function seed(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await connectDatabase(mongoUri);

  await Promise.all([Claim.deleteMany({}), Policy.deleteMany({}), User.deleteMany({})]);
  await mongoose.connection.collection("counters").deleteMany({ key: "claimNumber" });

  const users = await User.create([
    { name: "Alice Admin", email: "alice@pct.local", password: "Password123!", role: "admin" },
    { name: "Mark Adjuster", email: "mark@pct.local", password: "Password123!", role: "adjuster" },
    { name: "Jane Adjuster", email: "jane@pct.local", password: "Password123!", role: "adjuster" },
  ]);

  const admin = users[0];
  const adjusterOne = users[1];
  const adjusterTwo = users[2];

  if (!admin || !adjusterOne || !adjusterTwo) {
    throw new Error("Failed to create seed users");
  }

  const policies = await Policy.create([
    {
      policyNumber: "POL-1001",
      holderName: "John Carter",
      type: "auto",
      premium: 1200,
      status: "active",
      effectiveDate: new Date("2026-01-01"),
      expirationDate: new Date("2027-01-01"),
      owner: admin._id,
    },
    {
      policyNumber: "POL-1002",
      holderName: "Laura Wilson",
      type: "home",
      premium: 2000,
      status: "active",
      effectiveDate: new Date("2025-07-01"),
      expirationDate: new Date("2026-07-01"),
      owner: adjusterOne._id,
    },
    {
      policyNumber: "POL-1003",
      holderName: "Tim Green",
      type: "life",
      premium: 1500,
      status: "expired",
      effectiveDate: new Date("2024-01-01"),
      expirationDate: new Date("2025-01-01"),
      owner: adjusterTwo._id,
    },
    {
      policyNumber: "POL-1004",
      holderName: "Maria Chen",
      type: "auto",
      premium: 900,
      status: "cancelled",
      effectiveDate: new Date("2025-02-15"),
      expirationDate: new Date("2026-02-15"),
      owner: adjusterOne._id,
    },
    {
      policyNumber: "POL-1005",
      holderName: "Peter Adams",
      type: "home",
      premium: 1800,
      status: "active",
      effectiveDate: new Date("2026-03-01"),
      expirationDate: new Date("2027-03-01"),
      owner: admin._id,
    },
  ]);

  const policyOne = policies[0];
  const policyTwo = policies[1];
  const policyThree = policies[2];
  const policyFour = policies[3];
  const policyFive = policies[4];

  if (!policyOne || !policyTwo || !policyThree || !policyFour || !policyFive) {
    throw new Error("Failed to create seed policies");
  }

  await Claim.create([
    {
      policy: policyOne._id,
      description: "Rear-end collision at traffic signal",
      incidentDate: new Date("2026-03-18"),
      amount: 3200,
      status: "submitted",
      assignedTo: adjusterOne._id,
      notes: [{ author: admin._id, text: "Initial intake complete", createdAt: new Date() }],
    },
    {
      policy: policyTwo._id,
      description: "Kitchen water damage from burst pipe",
      incidentDate: new Date("2026-02-09"),
      amount: 8500,
      status: "under-review",
      assignedTo: adjusterTwo._id,
      notes: [{ author: adjusterTwo._id, text: "Requested plumber report", createdAt: new Date() }],
    },
    {
      policy: policyThree._id,
      description: "Beneficiary payout request",
      incidentDate: new Date("2025-09-11"),
      amount: 25000,
      status: "approved",
      assignedTo: adjusterOne._id,
      notes: [],
    },
    {
      policy: policyFour._id,
      description: "Windshield replacement",
      incidentDate: new Date("2026-04-21"),
      amount: 650,
      status: "denied",
      assignedTo: adjusterOne._id,
      notes: [{ author: adjusterOne._id, text: "Damage excluded by policy", createdAt: new Date() }],
    },
    {
      policy: policyFive._id,
      description: "Roof storm damage",
      incidentDate: new Date("2026-01-29"),
      amount: 12000,
      status: "closed",
      assignedTo: adjusterTwo._id,
      notes: [{ author: admin._id, text: "Claim settled and closed", createdAt: new Date() }],
    },
    {
      policy: policyOne._id,
      description: "Theft of vehicle mirrors",
      incidentDate: new Date("2026-05-02"),
      amount: 1100,
      status: "submitted",
      assignedTo: adjusterTwo._id,
      notes: [],
    },
  ]);

  // eslint-disable-next-line no-console
  console.log("Seed complete");
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
