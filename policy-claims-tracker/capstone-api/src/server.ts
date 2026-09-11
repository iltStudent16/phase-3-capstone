import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDatabase } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import claimsRoutes from "./routes/claims.js";
import dashboardRoutes from "./routes/dashboard.js";
import healthRoutes from "./routes/health.js";
import policiesRoutes from "./routes/policies.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required");
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/policies", policiesRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

connectDatabase(mongoUri)
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Database connection failed", error);
    process.exit(1);
  });
