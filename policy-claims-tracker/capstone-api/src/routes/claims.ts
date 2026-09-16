import { Router } from "express";
import { type NextFunction, type Request, type Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";

import { authenticate, validate } from "../middleware/auth.js";
import { Claim } from "../models/Claim.js";

const router = Router();

router.use(authenticate);

router.get("/stats", async (_req, res, next) => {
  try {
    const [byStatus, totals] = await Promise.all([
      Claim.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]),
      Claim.aggregate([
        {
          $group: {
            _id: null,
            totalClaims: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    return res.json({
      totals: totals[0] ?? { totalClaims: 0, totalAmount: 0 },
      byStatus,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.policy) {
      filter.policy = req.query.policy;
    }

    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search), "i");
      filter.$or = [{ claimNumber: searchRegex }, { description: searchRegex }];
    }

    const [items, total] = await Promise.all([
      Claim.find(filter)
        .populate("policy")
        .populate("assignedTo", "name email role")
        .populate("notes.author", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Claim.countDocuments(filter),
    ]);

    return res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/",
  validate([
    body("policy").custom((value) => mongoose.isValidObjectId(value)).withMessage("Valid policy id is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("incidentDate").isISO8601(),
    body("amount").isFloat({ min: 0 }),
    body("status").optional().isIn(["submitted", "under-review", "approved", "denied", "closed"]),
    body("assignedTo").optional().custom((value) => mongoose.isValidObjectId(value)),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await Claim.create(req.body);
      await claim.populate("policy");
      await claim.populate("assignedTo", "name email role");
      await claim.populate("notes.author", "name email role");

      return res.status(201).json(claim);
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/:id", async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("policy")
      .populate("assignedTo", "name email role")
      .populate("notes.author", "name email role");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    return res.json(claim);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("policy")
      .populate("assignedTo", "name email role")
      .populate("notes.author", "name email role");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    return res.json(claim);
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/:id/notes",
  validate([body("text").trim().notEmpty().withMessage("Note text is required")]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await Claim.findById(req.params.id);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      claim.notes.push({
        author: req.user!._id,
        text: req.body.text,
        createdAt: new Date(),
      });

      await claim.save();

      const populated = await Claim.findById(claim._id)
        .populate("policy")
        .populate("assignedTo", "name email role")
        .populate("notes.author", "name email role");

      return res.status(201).json(populated);
    } catch (error) {
      return next(error);
    }
  },
);

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Claim.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Claim not found" });
    }
    return res.json({ message: "Claim deleted" });
  } catch (error) {
    return next(error);
  }
});

export default router;
