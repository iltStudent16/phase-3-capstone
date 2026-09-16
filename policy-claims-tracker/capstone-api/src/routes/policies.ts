import { Router } from "express";
import { type NextFunction, type Request, type Response } from "express";
import { body } from "express-validator";

import { authenticate, validate } from "../middleware/auth.js";
import { Policy } from "../models/Policy.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search), "i");
      filter.$or = [{ holderName: searchRegex }, { policyNumber: searchRegex }];
    }

    const [items, total] = await Promise.all([
      Policy.find(filter)
        .populate("owner", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Policy.countDocuments(filter),
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
    body("policyNumber").trim().notEmpty().withMessage("Policy number is required"),
    body("holderName").trim().notEmpty().withMessage("Holder name is required"),
    body("type").isIn(["auto", "home", "life"]),
    body("premium").isFloat({ min: 0 }),
    body("status").optional().isIn(["active", "expired", "cancelled"]),
    body("effectiveDate").isISO8601(),
    body("expirationDate").isISO8601(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        ...req.body,
        owner: req.user?._id,
      };

      const policy = await Policy.create(payload);
      const populated = await policy.populate("owner", "name email role");
      return res.status(201).json(populated);
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/:id", async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id).populate("owner", "name email role");
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    return res.json(policy);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
      "owner",
      "name email role",
    );
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    return res.json(policy);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Policy.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Policy not found" });
    }
    return res.json({ message: "Policy deleted" });
  } catch (error) {
    return next(error);
  }
});

export default router;
