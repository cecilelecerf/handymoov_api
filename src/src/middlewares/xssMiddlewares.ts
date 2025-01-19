import { NextFunction, Request, Response } from "express";
import xss from "xss";

export const xssMiddlewares = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      req.body[key] = xss(req.body[key]);
    });
  }
  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      req.params[key] = xss(req.params[key]);
    });
  }
  next();
};
