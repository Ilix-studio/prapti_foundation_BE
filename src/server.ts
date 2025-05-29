import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import connectDB from "./config/dbConnection";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware";
import auth from "./routes/auth";
import blogs from "./routes/blog";
import cloudinaryRoutes from "./routes/cloudinary";
import corsOptions from "./config/corOptions";
import logger from "./utils/logger";

// Create Express application
const app: Application = express();
dotenv.config();

const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

app.use(compression());

//CORS
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(
  morgan("combined", {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

// Apply general rate limiting to all routes
// app.use(generalLimiter);

// Health check endpoints (no rate limiting)
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Prapti Foundation API is running",
    version: "1.0.0",
  });
});
app.get("/_ah/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.get("/_ah/start", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});

app.use("/api/admin", auth);
app.use("/api/blogs", blogs);
app.use("/api/cloudinary", cloudinaryRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Centralized Error Handler
app.use(routeNotFound);
app.use(errorHandler);

// Connect to MongoDB
connectDB();
