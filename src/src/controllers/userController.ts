import jwt from "jsonwebtoken";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import PersonalizedAddress from "../models/personalizedAddress";

/**********************************************************
            MÉTHODE POUR ENREGISTRER UN UTILISATEUR
**********************************************************/
// TODO mettre la vérification à part
import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import {
  validPassword,
  validateConfirmEmail,
  validateConfirmPassword,
  validateEmail,
  validateFirstname,
  validateLastname,
  validatePassword,
  validateRole,
} from "../validations/userValidation";

export const registerAUser = async (req: Request, res: Response) => {
  try {
    const { email, firstname, lastname, password, confirmPassword, role } =
      req.body;

    try {
      await validateEmail({ email });
      validateFirstname({ firstname });
      validateLastname({ lastname });
      validatePassword({ password });
      validateConfirmPassword({ password, confirmPassword });
      validateRole(role);
    } catch (validationError) {
      console.log(validationError);
      if (validationError.status) {
        return res.status(validationError.status).json({
          msg: validationError.msg,
          param: validationError.param,
        });
      } else {
        return res.status(400).json({
          msg: validationError.msg,
          param: validationError.param,
        });
      }
    }

    let user: User;
    if (email === "admin@handymoov.com") {
      user = await User.create({
        firstname,
        lastname,
        password,
        email,
        role: "admin",
      });
    } else {
      user = await User.create({
        firstname,
        lastname,
        password,
        email,
        role: "user",
      });
    }

    ["Maison", "Travail"].map(async (value) => {
      await PersonalizedAddress.create({ label: value, user_id: user.id });
    });

    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erreur lors du traitement des données.",
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

    try {
      await validPassword({
        reqPassword: req.body.password,
        userPassword: user.password,
      });
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
    } catch (validationError) {
      if (validationError.status)
        return res
          .status(validationError.status)
          .json({ msg: validationError.msg, param: validationError.param });
      else return res.status(400).json(validationError);
    }
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER UN UTILISATEUR
**********************************************************/

export const getAUser = async (req: UserRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER UN UTILISATEUR
**********************************************************/

export const putAUser = async (req: UserRequest, res: Response) => {
  try {
    let user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé." });
    }
    const {
      email,
      confirmEmail,
      lastEmail,
      firstname,
      lastname,
      password,
      lastPassword,
      confirmPassword,
    } = req.body;

    try {
      if (email || confirmEmail || lastEmail) {
        validateConfirmEmail({
          email,
          confirmEmail,
          lastEmail,
          userEmail: req.user.email,
        });
        await validateEmail({ email });
      }
      if (firstname) {
        validateFirstname({ firstname, required: false });
      }
      if (lastname) {
        validateLastname({ lastname, required: false });
      }
      if (password || lastPassword || confirmPassword) {
        console.log(password);
        validatePassword({ password });
        validateConfirmPassword({
          password,
          confirmPassword,
          lastPassword,
          userPassword: user.password,
        });
        await validPassword({
          reqPassword: lastPassword,
          userPassword: user.password,
        });
      }
    } catch (validationError) {
      console.error(validationError);
      if (validationError.status)
        return res
          .status(validationError.status)
          .json({ msg: validationError.msg, param: validationError.param });
      else return res.status(400).json(validationError);
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
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR SUPPRIMER UN UTILISATEUR
**********************************************************/

export const deleteAUser = async (req: UserRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé." });
    }
    await PersonalizedAddress.destroy({ where: { user_id: user.id } });
    await User.destroy({
      where: { id: user.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
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
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};
