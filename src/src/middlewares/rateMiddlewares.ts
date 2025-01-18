import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Trop de tentatives échouées. Réessayez dans 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
