import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

export interface UserRequest extends Request {
  id?: User["id"];
  role?: User["role"];
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

      const user = await User.findByPk(payload["id"]);

      if (!user || !user.isEmailVerified) {
        return res
          .status(403)
          .json({ msg: "Accès interdit: email non vérifié" });
      }
      req.id = payload["id"];
      next();
    } catch (error) {
      res.status(401).json({ msg: "Accès interdit: token invalide" });
    }
  }
  public async isAdmin(req: UserRequest, res: Response, next: NextFunction) {
    try {
      this.token = req.headers["authorization"] as string;
      if (!this.token) {
        return res.status(401).json({ msg: "Accès interdit: token manquant" });
      }

      const payload = await this.verifyJWT();
      req.id = payload["id"];
      req.role = payload["role"];
      if (req.id && req.role && req.role === "admin") {
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

// Génère un token de vérification pour l'utilisateur
export const generateEmailVerificationToken = (userId: string): string => {
  const payload = { id: userId };
  const token = jwt.sign(payload, process.env.EMAIL_VERIFICATION_KEY!, {
    expiresIn: "1d",
  });
  return token;
};
