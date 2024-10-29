import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

export interface UserRequest extends Request {
  user?: User;
}
export class JwtMiddlewares {
  private token: string | undefined;

  constructor() {
    this.token = undefined;
    this.isConnect = this.isConnect.bind(this);
    this.isAdmin = this.isConnect.bind(this);
    this.verifyJWT = this.verifyJWT.bind(this);
  }
  private async verifyJWT() {
    try {
      const decoded = jwt.verify(this.token, process.env.JWT_KEY);
      return decoded;
    } catch (error) {
      throw error;
    }
  }
  // Middleware pour vérifier le token
  public async isConnect(req: UserRequest, res: Response, next: NextFunction) {
    try {
      this.token = req.headers["authorization"];
      if (!this.token) {
        return res.status(401).json({ msg: "Accès interdit: token manquant" });
      }
      const payload = await this.verifyJWT();
      req.user = payload as User;
      next();
    } catch (error) {
      res.status(401).json({ msg: "Accès interdit: token invalide" });
    }
  }
  // Middleware pour vérifier le rôle administrateur
  public async isAdmin(req: UserRequest, res: Response, next: NextFunction) {
    try {
      this.token = req.headers["authorization"] as string;
      if (!this.token) {
        return res.status(401).json({ msg: "Accès interdit: token manquant" });
      }

      const payload = await this.verifyJWT();
      req.user = payload as User;

      if (req.user && req.user.role && req.user.role === "admin") {
        next();
      } else {
        res
          .status(403)
          .json({ msg: "Accès interdit: rôle administrateur requis" });
      }
    } catch (error) {
      res.status(401).json({ msg: "Accès interdit: token invalide" });
    }
  }
}
