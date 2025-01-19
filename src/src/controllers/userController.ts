import jwt from "jsonwebtoken";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import PersonalizedAddress from "../models/personalizedAddress";

import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import { body, param, validationResult } from "express-validator";
import { registerAdminUser } from "../__tests__/users/usersConst";

class UserController {
  /**********************************************************
            MÉTHODE POUR ENREGISTRER UN UTILISATEUR
**********************************************************/

  static async registerAUser(req: Request, res: Response) {
    // Validation des entrées via express-validator
    await body("email")
      .escape()
      .trim()
      .isEmail()
      .withMessage("Email invalide")
      .bail()
      .custom(async (email) => {
        const user = await User.findOne({ where: { email } });
        if (user) {
          throw new Error("Email déjà utilisé");
        }
        const localPart = email.split("@")[0];
        if (localPart.length > 40) {
          throw new Error("La partie avant le '@' de l'email est trop longue.");
        }
      })
      .run(req);

    await body("firstname")
      .escape()
      .trim()
      .notEmpty()
      .withMessage("Le prénom est requis")
      .run(req);

    await body("lastname")
      .escape()
      .trim()
      .notEmpty()
      .withMessage("Le nom est requis")
      .run(req);

    await body("password")
      .escape()
      .trim()
      .isLength({ min: 7 })
      .withMessage("Le mot de passe doit contenir au moins 7 caractères")
      .bail()
      .matches(/[A-Z]/)
      .withMessage(
        "Le mot de passe doit contenir au moins une lettre majuscule"
      )
      .custom(async (password) => {
        if (password < 7) {
          throw new Error(
            "Le mot de passe doit contenir au moins 7 caractères"
          );
        }
      })
      .run(req);

    await body("confirmPassword")
      .escape()
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        return true;
      })
      .run(req);

    await body("birthday")
      .escape()
      .trim()
      .notEmpty()
      .withMessage("La date de naissance est requise")
      .isDate()
      .withMessage("Date de naissance invalide")
      .run(req);

    await body("cgu")
      .equals("true")
      .withMessage("Vous devez accepter les CGU")
      .run(req);

    await body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Rôle invalide")
      .run(req);
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstname, lastname, password, birthday, wheelchair } =
      req.body;
    try {
      let user: User;
      if (email === registerAdminUser.email) {
        user = await User.create({
          firstname,
          lastname,
          birthday: new Date(birthday),
          password: password,
          email,
          role: "admin",
          wheelchair,
        });
      } else {
        user = await User.create({
          firstname,
          lastname,
          birthday: new Date(birthday),
          password: password,
          email,
          role: "user",
          wheelchair,
        });
      }
      // Création des adresses par défaut pour l'utilisateur
      await Promise.all(
        ["Maison", "Travail"].map(async (value) => {
          await PersonalizedAddress.create({ label: value, user_id: user.id });
        })
      );

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.${error}`,
      });
    }
  }

  /**********************************************************
            MÉTHODE POUR CONNECTER UN UTILISATEUR
**********************************************************/

  static async loginAUser(req: Request, res: Response) {
    await body("email")
      .isEmail()
      .withMessage("Email invalide")
      .custom(async (email) => {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
          throw new Error("Email ou mot de passe incorrect");
        }
        return true;
      })
      .run(req);

    await body("password")
      .escape()
      .trim()
      .notEmpty()
      .withMessage("Le mot de passe est requis")
      .run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(404).json({
          param: ["email", "password"],
          msg: "Email ou mot de passe incorrect.",
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          param: ["password"],
          msg: "Email ou mot de passe incorrect.",
        });
      }
      // Si la 2FA est activée, demander à l'utilisateur de la vérifier
      if (user.is2FAEnabled) {
        return res.status(200).json({
          msg: "2FA requise",
          is2FAEnabled: true,
        });
      }

      // Création du token JWT et refresh token
      const userData = {
        id: user.id,
        role: user.role,
      };
      const token = jwt.sign(userData, process.env.JWT_KEY, {
        expiresIn: "15m",
      });

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_KEY,
        { expiresIn: "7d" }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return res.status(200).json({ token });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR LISTER UN UTILISATEUR
**********************************************************/

  static async getAUser(req: UserRequest, res: Response) {
    try {
      const user = await User.findByPk(req.id);

      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER UN UTILISATEUR
**********************************************************/

  static async patchAUser(req: UserRequest, res: Response) {
    // Validation des champs
    await body("email")
      .escape()
      .trim()
      .optional()
      .isEmail()
      .withMessage("Format d'email invalide.")
      .run(req);

    await body("confirmEmail")
      .escape()
      .trim()
      .optional()
      .custom((value, { req }) => {
        if (value && value !== req.body.email) {
          throw new Error("Les emails ne correspondent pas.");
        }
        return true;
      })
      .run(req);

    await body("firstname")
      .escape()
      .trim()
      .optional()
      .isLength({ min: 2 })
      .withMessage("Le prénom doit avoir au moins 2 caractères.")
      .run(req);

    await body("lastname")
      .escape()
      .trim()
      .optional()
      .isLength({ min: 2 })
      .withMessage("Le nom de famille doit avoir au moins 2 caractères.")
      .run(req);

    await body("birthday")
      .optional()
      .isDate()
      .withMessage("La date de naissance doit être au format valide.")
      .run(req);

    await body("password")
      .escape()
      .trim()
      .optional()
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit comporter au moins 6 caractères.")
      .run(req);

    await body("confirmPassword")
      .escape()
      .trim()
      .optional()
      .custom((value, { req }) => {
        if (value && value !== req.body.password) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        return true;
      })
      .run(req);

    await body("lastPassword")
      .escape()
      .trim()
      .optional()
      .isLength({ min: 6 })
      .withMessage(
        "L'ancien mot de passe doit comporter au moins 6 caractères."
      )
      .run(req);

    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findByPk(req.id);
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      const { email, firstname, lastname, password, birthday, picture } =
        req.body;

      const UserRequest = await User.findOne({ where: { id: user.id } });
      await user.update({
        email: email && user.email,
        firstname: firstname && user.firstname,
        lastname: lastname && user.lastname,
        password: password
          ? await bcrypt.hash(password, 10)
          : UserRequest.password,
        modifiedAt: new Date(Date.now()),
        birthday: birthday && UserRequest.birthday,
        profilePicture: picture && UserRequest.profilePicture,
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }
  /**********************************************************
            MÉTHODE POUR MODIFIER UNE PHOTO DE PROFIL
**********************************************************/

  static async putAProfilePictureUser(req: UserRequest, res: Response) {
    // Validation de la photo de profil (vérification du type de fichier)
    await body("file")
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Aucune photo de profil fournie.");
        }
        const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validImageTypes.includes(req.file.mimetype)) {
          throw new Error("Le fichier doit être une image (JPEG, PNG ou GIF).");
        }
        return true;
      })
      .run(req);

    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findByPk(req.id);
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      // Récupérer le chemin de la photo de profil
      const profilePicture = req.file.path;

      // Mettre à jour la photo de profil de l'utilisateur
      await user.update({ profilePicture });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR SUPPRIMER UN UTILISATEUR
**********************************************************/

  static async deleteAUser(req: UserRequest, res: Response) {
    // Validation de la présence du mot de passe
    await body("password")
      .escape()
      .trim()
      .exists()
      .withMessage("Le mot de passe est requis.")
      .notEmpty()
      .withMessage("Le mot de passe ne peut pas être vide.")
      .run(req);

    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findByPk(req.id);
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      const { password } = req.body;

      try {
        // Comparer le mot de passe fourni avec le mot de passe de l'utilisateur
        await UserController.passwordCompare({
          reqPassword: password,
          userPassword: user.password,
        });
      } catch (validationError) {
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

      // Supprimer l'utilisateur
      await User.destroy({
        where: { id: req.id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR LISTER TOUS LES USERS
**********************************************************/

  static async getAllUser(req: UserRequest, res: Response) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER SON MOT DE PASSE
**********************************************************/

  static async patchAUserPassword(req: UserRequest, res: Response) {
    try {
      let user = await User.findByPk(req.id);
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      const { password } = req.body;
      await body("password")
        .escape()
        .trim()
        .isLength({ min: 8 })
        .withMessage("Le mot de passe doit contenir au moins 8 caractères.")
        .matches(/\d/)
        .withMessage("Le mot de passe doit contenir au moins un chiffre.")
        .matches(/[a-zA-Z]/)
        .withMessage("Le mot de passe doit contenir au moins une lettre.")
        .matches(/[A-Z]/) // Vérifie la présence d'au moins une lettre majuscule
        .withMessage(
          "Le mot de passe doit contenir au moins une lettre majuscule"
        )
        .matches(/[a-z]/) // Vérifie la présence d'au moins une lettre minuscule
        .withMessage(
          "Le mot de passe doit contenir au moins une lettre minuscule"
        )
        .matches(/[\W_]/) // Vérifie la présence d'au moins un caractère spécial
        .withMessage(
          "Le mot de passe doit contenir au moins un caractère spécial"
        )

        .run(req);

      await body("confirmPassword")
        .escape()
        .trim()
        .custom(async (value, { req }) => {
          if (value !== req.body.password)
            throw new Error("Les mots de passe ne correspondent pas.");
        })
        .withMessage("Les mots de passe ne correspondent pas.")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Mise à jour du mot de passe
      await User.update(
        {
          password: await bcrypt.hash(password, 10),
          modifiedAt: new Date(Date.now()),
        },
        { where: { id: req.id } }
      );

      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER SON EMAIL
**********************************************************/
  static async patchAUserEmail(req: UserRequest, res: Response) {
    try {
      let user = await User.findByPk(req.id);
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      const { email, lastEmail, confirmEmail } = req.body;
      // Validation de l'email et des champs associés
      await body("email")
        .escape()
        .trim()
        .isEmail()
        .notEmpty()
        .withMessage("L'email n'est pas valide.")
        .isLength({ min: 5, max: 70 })
        .withMessage("L'email doit faire entre 5 et 70 caractères.")
        .custom(async (value, { req }) => {
          const user = await User.findOne({ where: { email: value } });
          if (user) {
            throw new Error("Email déjà utilisé");
          }
          if (value === lastEmail) {
            throw new Error(
              "L'email ne doit pas être identique à l'email précédent."
            );
          }
          const [before, after] = value.split("@");
          if (before.length > 40) {
            throw new Error(
              "La partie avant le '@' de l'email est trop longue."
            );
          }
          if (after.length > 40) {
            throw new Error(
              "La partie après le '@' de l'email est trop longue."
            );
          }
        })
        .run(req);

      await body("confirmEmail")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("La confirmation d'email n'est pas valide.")
        .custom(async (value, { req }) => {
          if (value !== email) {
            throw new Error("Les emails ne correspondent pas.");
          }
        })
        .run(req);

      await body("lastEmail")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("L'ancien email est requis.")
        .run(req);

      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Mise à jour de l'email de l'utilisateur
      await User.update(
        {
          email: email,
          modifiedAt: new Date(Date.now()),
        },
        { where: { id: req.id } }
      );

      // Retourne un code 204 No Content si la mise à jour est réussie
      res.status(204).send();
    } catch (error) {
      // Gestion des erreurs serveur
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER LE PROFIL D'UN UTILISATEUR
**********************************************************/

  static async patchAUserProfil(req: UserRequest, res: Response) {
    try {
      const { firstname, lastname, birthday } = req.body;

      // Validation des champs firstname, lastname et birthday
      if (firstname) {
        await body("firstname")
          .escape()
          .trim()
          .optional()
          .isLength({ min: 5, max: 49 })
          .withMessage("Le prénom doit comporter entre 5 et 50 caractères.")
          .run(req);
      }

      if (lastname) {
        await body("lastname")
          .escape()
          .trim()
          .optional()
          .isLength({ min: 5, max: 49 })
          .withMessage("Le nom doit comporter entre 5 et 50 caractères.")
          .run(req);
      }

      if (birthday) {
        await body("birthday")
          .optional()
          .isDate()
          .withMessage("La date de naissance doit être une date valide.")
          .run(req);
      }

      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Mise à jour des informations de l'utilisateur
      await User.update(
        {
          firstname: firstname ? firstname : undefined,
          lastname: lastname ? lastname : undefined,
          modifiedAt: new Date(Date.now()),
          birthday: birthday ? birthday : undefined,
        },
        { where: { id: req.id } }
      );

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  static async passwordCompare({
    reqPassword,
    userPassword,
    notEmail = false,
  }: {
    reqPassword: string;
    userPassword: string;
    notEmail?: boolean;
  }) {
    reqPassword = reqPassword.trim();
    userPassword = userPassword.trim();

    const validPassword = await bcrypt.compare(reqPassword, userPassword);
    if (!validPassword) {
      throw {
        param: notEmail ? ["password"] : ["email", "password"],
        msg: notEmail
          ? "Mot de passe incorrect."
          : "Email ou mot de passe incorrect.",
        status: 404,
      };
    } else return validPassword;
  }
}
export default UserController;
