import dotenv from "dotenv";

import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required");
}

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
