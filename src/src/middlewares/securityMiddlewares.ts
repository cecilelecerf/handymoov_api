import { NextFunction, Request, Response } from "express";

export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none';"
  );

  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("X-Frame-Options", "DENY");

  res.setHeader("X-XSS-Protection", "1; mode=block");

  next();
};
