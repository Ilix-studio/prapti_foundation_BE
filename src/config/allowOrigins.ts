const allowOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://praptifoundation.in",
  "https://www.praptifoundation.in",
  "https://biswajitphukan.com",
  "https://www.biswajitphukan.com",
];

// Add environment-specific origins
if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
  allowOrigins.push(process.env.FRONTEND_URL);
}

export default allowOrigins;
