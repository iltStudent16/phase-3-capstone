import { Router } from "express";
import { type NextFunction, type Request, type Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { authenticate, validate } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

function signToken(userId: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "1d" });
}

router.post(
  "/register",
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["adjuster", "admin"]),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body;

      const existing = await User.findOne({ email: String(email).toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role ?? "adjuster",
      });

      const token = signToken(String(user._id));
      return res.status(201).json({ token, user: user.toJSON() });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: String(email).toLowerCase() });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(String(user._id));
      return res.json({ token, user: user.toJSON() });
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/me", authenticate, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
