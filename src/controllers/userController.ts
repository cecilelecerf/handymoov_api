import User from "../models/userModel";
import { Response } from "express";
import { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import PersonalizedAddress from "../models/personalizedAddress";

/**********************************************************
            MÉTHODE POUR ENREGISTRER UN UTILISATEUR
**********************************************************/

export const registerAUser = async (req: Request, res: Response) => {
  try {
    if (!req.body.email)
      return res.status(400).json({
        message: `L'email est obligatoire`,
      });
    if (!req.body.firstname)
      return res.status(400).json({
        message: `Le prénom est obligatoire`,
      });

    if (!req.body.lastname)
      return res.status(400).json({
        message: `Le nom est obligatoire`,
      });

    if (!req.body.password)
      return res.status(400).json({
        message: `Le mot de passe est obligatoire`,
      });
    const existingEmail = await User.findOne({
      where: { email: req.body.email },
    });
    if (existingEmail) {
      return res.status(409).json({ message: "Cet email existe déjà." });
    }
    if (req.body.role === "admin") {
      return res.status(400).json({
        message: "Vous ne pouvez pas créer un utilisateur avec le rôle admin.",
      });
    }
    const user = await User.create(req.body);
    ["Maison", "Travail"].map(
      async (value) =>
        await PersonalizedAddress.create({ label: value, user_id: user.id })
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: `Erreur lors du traitement des données.`,
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
      return res.status(404).json({ message: "Utilisateur non trouvé." });
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
        password: user.password,
      };

      const token = jwt.sign(userData, process.env.JWT_KEY, {
        expiresIn: "30d",
      });

      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Email ou mot de passe incorrect." });
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
    console.log(req.user);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    req.body.password = await bcrypt.hash(req.body.password, 10);

    await user.update({
      lastname: req.body.lastname ? req.body.lastname : req.user.lastname,
      firstname: req.body.firstname ? req.body.firstname : req.user.firstname,
      password: req.body.password ? req.body.password : req.user.password,
      email: req.body.email ? req.body.email : req.user.email,
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
    const deletedUser = await User.destroy({
      where: { id: req.user.id },
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

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
    if (!users)
      return res.status(400).json({ message: "Aucun utilisateur trouvé" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};
