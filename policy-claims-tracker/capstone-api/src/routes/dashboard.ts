import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { Claim } from "../models/Claim.js";
import { Policy } from "../models/Policy.js";
import { User } from "../models/User.js";

const router = Router();

router.use(authenticate);

router.get("/", async (_req, res, next) => {
  try {
    const [totalClaims, totalPolicies, totalUsers, amountAgg, claimsByStatus, recentClaims] = await Promise.all([
      Claim.countDocuments(),
      Policy.countDocuments(),
      User.countDocuments(),
      Claim.aggregate([{ $group: { _id: null, totalClaimAmount: { $sum: "$amount" } } }]),
      Claim.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Claim.find().sort({ createdAt: -1 }).limit(5).populate("policy").populate("assignedTo", "name email role"),
    ]);

    return res.json({
      totalClaims,
      totalPolicies,
      totalUsers,
      totalClaimAmount: amountAgg[0]?.totalClaimAmount ?? 0,
      claimsByStatus,
      recentClaims,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
