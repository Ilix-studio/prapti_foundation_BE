"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://www.praptifoundation.in",
    "https://www.praptifoundation.in/",
    "https://www.praptifoundation.in/admin/login",
    "https://www.praptifoundation.in/admin/dashboard",
    "https://www.praptifoundation.in/blog",
    "https://biswajitphukan.com",
    "https://www.biswajitphukan.com",
    "",
];
// Add environment-specific origins
if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
    allowOrigins.push(process.env.FRONTEND_URL);
}
exports.default = allowOrigins;
