export const CONFIG = {
  port: Number(process.env.PORT || 3001),
  jwtSecret: process.env.JWT_SECRET || "dailyworklog-secret",
  timezone: "Asia/Singapore",
  corsOrigin: ["http://localhost:3000"]
};
