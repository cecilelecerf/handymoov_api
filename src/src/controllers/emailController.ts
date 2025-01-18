import { Request, Response } from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel";
import { generateEmailVerificationToken } from "../middlewares/jwtMiddlewares";
import jwt from "jsonwebtoken";

export async function sendVerificationEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé" });
    }

    const token = generateEmailVerificationToken(user.id);

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Vérification de votre email",
      html: `
        <h1>Vérifiez votre email</h1>
        <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });

    res.status(200).json({ msg: "Email de vérification envoyé" });
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors de l'envoi de l'email" });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(
      token as string,
      process.env.EMAIL_VERIFICATION_KEY!
    ) as { id: number };

    await User.update({ isEmailVerified: true }, { where: { id: decoded.id } });

    res.status(200).json({ msg: "Email vérifié avec succès" });
  } catch (error) {
    res.status(400).json({ msg: "Lien de vérification invalide ou expiré" });
  }
}
