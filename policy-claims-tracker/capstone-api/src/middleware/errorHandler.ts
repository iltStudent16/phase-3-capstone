import mongoose from "mongoose";
import { type NextFunction, type Request, type Response } from "express";

import { HttpError } from "../utils/httpError.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError("Route not found", 404));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const fields = Object.values(error.errors).map((entry) => ({
      field: entry.path,
      message: entry.message,
    }));
    return res.status(400).json({ message: "Validation failed", fields });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${error.path}` });
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    return res.status(409).json({ message: "Duplicate value error" });
  }

  return res.status(500).json({ message: "Internal server error" });
}
