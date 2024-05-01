import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel";

dotenv.config();

// Définir le type pour la propriété 'user' sur l'objet Request
export interface UserRequest extends Request {
  user?: User; // Définissez ici le type de 'user' selon vos besoins
}

// Fonction pour vérifier le token JWT
const verifyJWT = async (token: string): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_KEY as string, (error, decoded) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded as Record<string, any>);
      }
    });
  });
};

// Middleware pour vérifier le token
export const verifyToken = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"] as string;
    if (!token) {
      return res
        .status(403)
        .json({ message: "Accès interdit: token manquant" });
    }

    const payload = await verifyJWT(token);
    req.user = payload as User;
    next();
  } catch (error) {
    console.error("Erreur de vérification du token:", error);
    res.status(403).json({ message: "Accès interdit: token invalide" });
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
      return res
        .status(403)
        .json({ message: "Accès interdit: token manquant" });
    }

    const payload = await verifyJWT(token);
    req.user = payload as User;

    // Vérification du rôle admin
    if (payload.role && payload.role === "admin") {
      next(); // Si l'utilisateur est admin, continuer
    } else {
      res
        .status(403)
        .json({ message: "Accès interdit: rôle administrateur requis" });
    }
  } catch (error) {
    console.error("Erreur de vérification du token:", error);
    res.status(403).json({ message: "Accès interdit: token invalide" });
  }
};
