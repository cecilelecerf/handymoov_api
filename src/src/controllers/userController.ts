import User from "../models/userModel";
import { Response } from "express";
import { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import PersonalizedAddress from "../models/personalizedAddress";
import { body, validationResult } from "express-validator";

/**********************************************************
            MÉTHODE POUR ENREGISTRER UN UTILISATEUR
**********************************************************/

export const registerAUser = async (req: Request, res: Response) => {
  try {
    if (!req.body.email)
      return res.status(400).json({
        param: ["email"],
        msg: "Votre email est obligatoire.",
      });

    if (req.body.email.length < 5 || req.body.email.length > 70)
      return res.status(400).json({
        param: ["email"],
        msg: "Votre email doit contenir entre 5 et 70 caractères.",
      });

    const existingEmail = await User.findOne({
      where: { email: req.body.email },
    });
    if (existingEmail) {
      return res.status(409).json({
        param: ["email"],
        msg: "Cet email existe déjà.",
      });
    }

    if (!req.body.firstname)
      return res.status(400).json({
        param: ["firstname"],
        msg: "Votre prénom est obligatoire.",
      });

    if (req.body.firstname.length < 5 || req.body.firstname.length > 50)
      return res.status(400).json({
        param: ["firstname"],
        msg: "Votre prénom doit contenir entre 5 et 70 caractères.",
      });

    if (!req.body.lastname)
      return res.status(400).json({
        param: ["lastname"],
        msg: "Votre nom est obligatoire.",
      });

    if (req.body.lastname.length < 5 || req.body.lastname.length > 50)
      return res.status(400).json({
        param: ["lastname"],
        msg: "Votre nom doit contenir entre 5 et 70 caractères.",
      });
    if (!req.body.password)
      return res.status(400).json({
        param: ["password"],
        msg: "Le mot de passe est obligatoire.",
      });
    console.log(req.body.password);
    console.log(req.body);
    if (req.body.password !== req.body.confirmPassword)
      return res.status(409).json({
        param: ["confirmPassword"],
        msg: "Les mots de passe ne sont pas identiques",
      });

    if (req.body.role === "admin") {
      return res.status(400).json({
        param: ["role"],
        msg: "Vous ne pouvez pas créer un utilisateur avec le rôle admin.",
      });
    }
    // TODO : for dev and test
    let user: User;
    if (req.body.email === "admin@handymoov.com") {
      user = await User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        email: req.body.email,
        role: "admin", // Assignez le rôle d'administrateur si l'e-mail correspond
      });
    } else {
      user = await User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        email: req.body.email,
        role: "user",
      });
    }

    ["Maison", "Travail"].map(
      async (value) =>
        await PersonalizedAddress.create({ label: value, user_id: user.id })
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      msg: `Erreur lors du traitement des données.`,
    });
  }
};

/**********************************************************
            MÉTHODE POUR CONNECTER UN UTILISATEUR
**********************************************************/

export const loginAUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(401).json({
        param: ["email", "password"],
        msg: "Email ou mot de passe incorrect.",
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (validPassword) {
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
      };

      const token = jwt.sign(userData, process.env.JWT_KEY, {
        expiresIn: "30d",
      });

      res.status(200).json({ token });
    } else {
      res.status(401).json({
        param: ["email", "password"],
        msg: "Email ou mot de passe incorrect.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER UN UTILISATEUR
**********************************************************/

export const getAUser = async (req: UserRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER UN UTILISATEUR
**********************************************************/

export const putAUser = async (req: UserRequest, res: Response) => {
  try {
    let user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    await Promise.all([
      body("email")
        .trim()
        .optional()
        .isEmail()
        .escape()
        .isLength({ min: 5, max: 70 })
        .run(req),
      body("firstname")
        .trim()
        .isLength({ min: 3, max: 50 })
        .optional()
        .escape()
        .run(req),
      body("lastname")
        .trim()
        .optional()
        .isLength({ min: 3, max: 50 })
        .escape()
        .run(req),
      body("password").trim().optional().escape().run(req),
    ]);

    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    await user.update({
      email: req.body.email ? req.body.email : user.email,
      firstname: req.body.firstname ? req.body.firstname : user.firstname,
      lastname: req.body.lastname ? req.body.lastname : user.lastname,
      password: req.body.password
        ? await bcrypt.hash(req.body.password, 10)
        : user.password,
      modifiedAt: new Date(Date.now()),
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR SUPPRIMER UN UTILISATEUR
**********************************************************/

export const deleteAUser = async (req: UserRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    await PersonalizedAddress.destroy({ where: { user_id: user.id } });
    await User.destroy({
      where: { id: user.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER TOUS LES USERS
**********************************************************/

export const getAllUser = async (req: UserRequest, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};
