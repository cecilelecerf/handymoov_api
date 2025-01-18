import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function refreshToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Refresh token manquant" });
    }

    // Vérification du refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY) as {
      id: string;
      role: string;
    };

    // Génération d'un nouvel access token
    const newAccessToken = jwt.sign(
      { id: payload.id, role: payload.role },
      process.env.JWT_KEY!,
      {
        expiresIn: "15m",
      }
    );
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ msg: "Refresh token invalide ou expiré" });
  }
}
