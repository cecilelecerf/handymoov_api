import { Response } from "express";
import speakeasy from "speakeasy";
import User from "../models/userModel";
import { UserRequest } from "./jwtMiddlewares";

export async function enable2FA(req: UserRequest, res: Response) {
  try {
    const user = await User.findByPk(req.id);

    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé" });
    }

    const secret = speakeasy.generateSecret({ name: "Handymoov" });

    user.twoFASecret = secret.base32;
    user.is2FAEnabled = true;
    await user.save();

    res.status(200).json({
      msg: "2FA activée avec succès",
      secret: secret.base32,
    });
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors de l'activation de la 2FA" });
  }
}

export async function verify2FA(req: UserRequest, res: Response) {
  try {
    const { code } = req.body;
    const user = await User.findByPk(req.id);

    if (!user || !user.twoFASecret) {
      return res
        .status(404)
        .json({ msg: "Utilisateur ou secret 2FA introuvable" });
    }

    // Vérifier le code
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      return res.status(401).json({ msg: "Code 2FA invalide" });
    }

    res.status(200).json({ msg: "Connexion réussie" });
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors de la vérification du code 2FA" });
  }
}
