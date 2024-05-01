// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// // Fonction pour vérifier le token JWT
// const verifyJWT = async (token: string): Promise<Record<string, any>> => {
//   return new Promise((resolve, reject) => {
//     jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(decoded as Record<string, any>);
//       }
//     });
//   });
// };

// // Middleware pour vérifier le token
// export const verifyToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token = req.headers["authorization"] as string;
//     if (!token) {
//       return res
//         .status(403)
//         .json({ message: "Accès interdit: token manquant" });
//     }

//     const payload = await verifyJWT(token);
//     req.user = payload;
//     next();
//   } catch (error) {
//     console.error("Erreur de vérification du token:", error);
//     res.status(403).json({ message: "Accès interdit: token invalide" });
//   }
// };

// // Middleware pour vérifier le rôle administrateur
// export const isAdmin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token = req.headers["authorization"] as string;
//     if (!token) {
//       return res
//         .status(403)
//         .json({ message: "Accès interdit: token manquant" });
//     }

//     const payload = await verifyJWT(token);
//     req.user = payload;

//     // Vérification du rôle admin
//     if (payload.role && payload.role === "admin") {
//       next(); // Si l'utilisateur est admin, continuer
//     } else {
//       res
//         .status(403)
//         .json({ message: "Accès interdit: rôle administrateur requis" });
//     }
//   } catch (error) {
//     console.error("Erreur de vérification du token:", error);
//     res.status(403).json({ message: "Accès interdit: token invalide" });
//   }
// };
