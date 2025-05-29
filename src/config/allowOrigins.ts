const allowOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://prapti-foundation-site.vercel.app/",
  "https://prapti-foundation-site.vercel.app/admin/login",
  "https://prapti-foundation-site.vercel.app/admin/dashboard",
  "https://prapti-foundation-site.vercel.app//blog",
];

// Add environment-specific origins
// if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
//   allowOrigins.push(process.env.FRONTEND_URL);
// }

export default allowOrigins;
