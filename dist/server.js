"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const corOptions_1 = __importDefault(require("./config/corOptions"));
const logger_1 = __importDefault(require("./utils/logger"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const auth_1 = __importDefault(require("./routes/auth"));
const blog_1 = __importDefault(require("./routes/blog"));
const cloudinary_1 = __importDefault(require("./routes/cloudinary"));
const volunteer_1 = __importDefault(require("./routes/volunteer"));
const contact_1 = __importDefault(require("./routes/contact"));
//updated
const category_1 = __importDefault(require("./routes/category"));
const photos_1 = __importDefault(require("./routes/photos"));
const video_1 = __importDefault(require("./routes/video"));
const visitor_1 = __importDefault(require("./routes/visitor"));
//new
const impact_1 = __importDefault(require("./routes/impact"));
const testimonials_1 = __importDefault(require("./routes/testimonials"));
//
const awards_1 = __importDefault(require("./routes/awards"));
const rescue_1 = __importDefault(require("./routes/rescue"));
// Create Express application
const app = (0, express_1.default)();
dotenv_1.default.config();
const PORT = process.env.PORT || 8080;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
//CORS
app.use((0, cors_1.default)(corOptions_1.default));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((0, morgan_1.default)("combined", {
    stream: { write: (message) => logger_1.default.info(message.trim()) },
}));
// Health check endpoints (no rate limiting)
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Prapti Foundation API is running",
        version: "1.0.0",
    });
});
app.get("/_ah/health", (req, res) => {
    res.status(200).send("OK");
});
app.get("/_ah/start", (req, res) => {
    res.status(200).send("OK");
});
// Handle favicon.ico requests silently
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});
app.listen(PORT, () => {
    console.log(`Listening to http://localhost:${PORT}`);
});
app.use("/api/admin", auth_1.default);
app.use("/api/blogs", blog_1.default);
app.use("/api/cloudinary", cloudinary_1.default);
app.use("/api/volunteers", volunteer_1.default);
app.use("/api/messages", contact_1.default);
//
app.use("/api/categories", category_1.default);
app.use("/api/photos", photos_1.default);
app.use("/api/videos", video_1.default);
app.use("/api/visitor", visitor_1.default);
//
app.use("/api/impact", impact_1.default);
app.use("/api/testimonials", testimonials_1.default);
//
app.use("/api/awards", awards_1.default);
app.use("/api/rescue", rescue_1.default);
// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
    res.status(500).json({
        success: false,
        error: "Something went wrong!",
        message: process.env.NODE_ENV === "development"
            ? err.message
            : "Internal server error",
    });
});
// Centralized Error Handler
app.use(errorMiddleware_1.routeNotFound);
app.use(errorMiddleware_1.errorHandler);
// Connect to MongoDB
(0, dbConnection_1.default)();
