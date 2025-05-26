import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbConnection";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware";
import auth from "./routes/auth";
import blogs from "./routes/blog";
import cloudinaryRoutes from "./routes/cloudinary";
import corsOptions from "./config/corOptions";

// Create Express application
const app: Application = express();
dotenv.config();

const PORT = process.env.PORT || 8080;

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (add this before other routes)
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("server is ready");
});
app.get("/_ah/health", (req: Request, res: Response) => {
  res.status(200).send("server is ready");
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
