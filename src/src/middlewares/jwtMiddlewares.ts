import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

// Définir le type pour la propriété 'user' sur l'objet Request
export interface UserRequest extends Request {
  user?: User; // Définissez ici le type de 'user' selon vos besoins
}

const verifyJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY as string);
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Middleware pour vérifier le token
export const verifyToken = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(403).json({ msg: "Accès interdit: token manquant" });
    }

    const payload = verifyJWT(token as string);
    req.user = payload as User;
    next();
  } catch (error) {
    res.status(403).json({ msg: "Accès interdit: token invalide" });
  }
};

// Middleware pour vérifier le rôle administrateur
export const isAdmin = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"] as string;
    if (!token) {
      return res.status(403).json({ msg: "Accès interdit: token manquant" });
    }

    const payload = verifyJWT(token);
    req.user = payload as User;

    // Vérification du rôle admin
    if (req.user && req.user.role && req.user.role === "admin") {
      next(); // Si l'utilisateur est admin, continuer
    } else {
      res
        .status(403)
        .json({ msg: "Accès interdit: rôle administrateur requis" });
    }
  } catch (error) {
    res.status(403).json({ msg: "Accès interdit: token invalide" });
  }
};
