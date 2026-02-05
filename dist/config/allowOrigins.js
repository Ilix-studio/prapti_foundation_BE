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
    "https://prapti-foundation-site.vercel.app",
    "https://prapti-foundation-site.vercel.app/admin/login",
    "https://prapti-foundation-site.vercel.app/admin/dashboard",
    "https://prapti-foundation-site.vercel.app/blog",
    "https://prapti-foundation-be.onrender.com/api/blogs/getAll",
    "",
];
// Add environment-specific origins
if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
    allowOrigins.push(process.env.FRONTEND_URL);
}
exports.default = allowOrigins;
