import jwt from "jsonwebtoken";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import PersonalizedAddress from "../models/personalizedAddress";

import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";

class UserController {
  /**********************************************************
            MÉTHODE POUR ENREGISTRER UN UTILISATEUR
**********************************************************/
  static async registerAUser(req: Request, res: Response) {
    try {
      const {
        email,
        firstname,
        lastname,
        password,
        confirmPassword,
        role,
        birthday,
        wheelchair,
        cgu,
      } = req.body;

      try {
        UserController.validateFirstname({ firstname, required: true });
        UserController.validateLastname({ lastname, required: true });
        UserController.emailExist({ email: email });
        UserController.emailFormat({ email: email });
        UserController.passwordExist({ password: password });
        UserController.passwordFormat({ password: password });
        UserController.validateBirthday({ birthday, required: true });
        UserController.passwordUpdate({ password, confirmPassword });
        UserController.validateRole(role);
        UserController.validateCGU({ cgu });
        await UserController.existingEmail({ email: email });
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

      let user: User;
      if (email === "admin@handymoov.com") {
        user = await User.create({
          firstname,
          lastname,
          birthday: new Date(birthday),
          password,
          email,
          role: "admin",
          wheelchair,
        });
      } else {
        user = await User.create({
          firstname,
          lastname,
          birthday: new Date(birthday),
          password,
          email,
          role: "user",
          wheelchair,
        });
      }
      await Promise.all(
        ["Maison", "Travail"].map(async (value) => {
          await PersonalizedAddress.create({ label: value, user_id: user.id });
        })
      );
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        msg: "Erreur lors du traitement des données.",
      });
    }
  }

  /**********************************************************
            MÉTHODE POUR CONNECTER UN UTILISATEUR
**********************************************************/

  static async loginAUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      try {
        UserController.passwordExist({ password: password });
        UserController.emailExist({ email: email });
      } catch (validationError) {
        if (validationError.status)
          return res
            .status(validationError.status)
            .json({ msg: validationError.msg, param: validationError.param });
        else return res.status(400).json(validationError);
      }
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(404).json({
          param: ["email", "password"],
          msg: "Email ou mot de passe incorrect.",
        });
      }
      try {
        await UserController.passwordCompare({
          reqPassword: password,
          userPassword: user.password,
        });
      } catch (validationError) {
        if (validationError.status)
          return res
            .status(validationError.status)
            .json({ msg: validationError.msg, param: validationError.param });
        else return res.status(400).json(validationError);
      }
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
      const user = await User.findByPk(req.user.id);

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
        birthday,
      } = req.body;

      try {
        if (email || confirmEmail || lastEmail) {
          UserController.emailExist({ email: email });
          UserController.emailUpdate({
            email,
            confirmEmail,
            lastEmail,
            userEmail: req.user.email,
          });
          UserController.emailFormat({ email });
        }
        if (firstname) {
          UserController.validateFirstname({ firstname, required: false });
        }
        if (lastname) {
          UserController.validateLastname({ lastname, required: false });
        }
        if (birthday) {
          UserController.validateBirthday({ birthday, required: false });
        }
        if (password || lastPassword || confirmPassword) {
          UserController.passwordExist({ password });
          UserController.passwordFormat({ password });
          UserController.passwordUpdate({
            password,
            confirmPassword,
            lastPassword,
          });
          await UserController.passwordCompare({
            reqPassword: lastPassword,
            userPassword: user.password,
          });
        }
      } catch (validationError) {
        if (validationError.status)
          return res
            .status(validationError.status)
            .json({ msg: validationError.msg, param: validationError.param });
        else return res.status(400).json(validationError);
      }
      const UserRequest = await User.findOne({ where: { id: user.id } });
      await user.update({
        email: req.body.email ? req.body.email : user.email,
        firstname: req.body.firstname ? req.body.firstname : user.firstname,
        lastname: req.body.lastname ? req.body.lastname : user.lastname,
        password: req.body.password
          ? await bcrypt.hash(req.body.password, 10)
          : UserRequest.password,
        modifiedAt: new Date(Date.now()),
        birthday: req.body.birthday ? req.body.birthday : UserRequest.birthday,
        profilePicture: req.body.picture
          ? req.body.picture
          : UserRequest.profilePicture,
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
    try {
      let user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      // Vérifier si une photo de profil est fournie dans la requête
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
    try {
      const { password } = req.body;
      try {
        await UserController.passwordCompare({
          reqPassword: password,
          userPassword: req.user.password,
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

      await User.destroy({
        where: { id: req.user.id },
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
      const { password, lastPassword, confirmPassword } = req.body;

      try {
        UserController.passwordExist({
          password,
          lastPasswordRequired: true,
          lastPassword,
        });
        UserController.passwordUpdate({
          password,
          confirmPassword,
          lastPassword,
        });
        UserController.passwordFormat({ password });

        await UserController.passwordCompare({
          reqPassword: lastPassword,
          userPassword: req.user.password,
          notEmail: true,
        });
      } catch (validationError) {
        if (validationError.status)
          return res
            .status(validationError.status)
            .json({ msg: validationError.msg, param: validationError.param });
        else return res.status(400).json(validationError);
      }
      await User.update(
        {
          password: await bcrypt.hash(req.body.password, 10),
          modifiedAt: new Date(Date.now()),
        },
        { where: { id: req.user.id } }
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
      const { email, lastEmail, confirmEmail } = req.body;

      // Gestion des validations synchrones
      try {
        UserController.emailUpdate({
          email,
          confirmEmail,
          lastEmail,
          userEmail: req.user.email,
        });
        await UserController.existingEmail({ email });
        UserController.emailFormat({ email });
      } catch (validationError) {
        // Vérification et retour des erreurs de validation
        if (validationError.status) {
          return res.status(validationError.status).json({
            msg: validationError.msg,
            param: validationError.param,
          });
        } else {
          return res.status(400).json(validationError);
        }
      }

      // Mise à jour de l'email de l'utilisateur
      await User.update(
        {
          email: email,
          modifiedAt: new Date(Date.now()),
        },
        { where: { id: req.user.id } }
      );

      // Retourne un code 204 No Content si la mise à jour est réussie
      res.status(204).send();
    } catch (error) {
      // Gestion des erreurs
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER LE PROFIL D'UN UTILISATEUR
**********************************************************/

  static async patchAUserProfil(req: UserRequest, res: Response) {
    try {
      const { firstname, lastname, birthday } = req.body;

      try {
        if (firstname) {
          UserController.validateFirstname({ firstname, required: false });
        }
        if (lastname) {
          UserController.validateLastname({ lastname, required: false });
        }
        if (birthday) {
          UserController.validateBirthday({ birthday, required: false });
        }
      } catch (validationError) {
        if (validationError.status)
          return res
            .status(validationError.status)
            .json({ msg: validationError.msg, param: validationError.param });
        else return res.status(400).json(validationError);
      }
      await User.update(
        {
          firstname: firstname,
          lastname: lastname,
          modifiedAt: new Date(Date.now()),
          birthday: birthday,
        },
        { where: { id: req.user.id } }
      );

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  static validateFirstname({
    firstname,
    required = true,
  }: {
    firstname: string;
    required?: boolean;
  }) {
    if (!firstname && required) {
      throw { param: ["firstname"], msg: "Votre prénom est obligatoire." };
    }

    if (firstname.length < 5 || firstname.length > 50) {
      throw {
        param: ["firstname"],
        msg: "Votre prénom doit contenir entre 5 et 50 caractères.",
      };
    }
  }

  static validateLastname({
    lastname,
    required = true,
  }: {
    lastname: string;
    required?: boolean;
  }) {
    if (!lastname && required) {
      throw { param: ["lastname"], msg: "Votre nom est obligatoire." };
    }

    if (lastname.length < 5 || lastname.length > 50) {
      throw {
        param: ["lastname"],
        msg: "Votre nom doit contenir entre 5 et 50 caractères.",
      };
    }
  }

  static validateBirthday({
    birthday,
    required,
  }: {
    birthday: string;
    required?: boolean;
  }) {
    if (!birthday && required) {
      throw {
        param: ["birthday"],
        msg: "Votre date de naissance est obligatoire.",
      };
    }
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) {
      throw {
        param: ["birthday"],
        msg: "Le format de la date de naissance est invalide.",
      };
    }
    const isOver18 = () => {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age >= 18;
    };

    if (!isOver18()) {
      throw {
        param: ["birthday"],
        msg: "Vous devez avoir plus de 18 ans.",
      };
    }
  }

  static validateRole(role: string) {
    if (role === "admin") {
      throw {
        param: ["role"],
        msg: "Vous ne pouvez pas créer un utilisateur avec le rôle admin.",
      };
    }
  }

  static validateCGU({ cgu }: { cgu: boolean }) {
    if (!cgu)
      throw {
        param: ["cgu"],
        msg: "Les conditions générales d'utilisation sont obligatoires.",
      };
  }

  static passwordExist({
    password,
    lastPassword,
    lastPasswordRequired,
  }: {
    password: string;
    lastPassword?: string;
    lastPasswordRequired?: boolean;
  }) {
    if (!lastPassword && lastPasswordRequired)
      throw {
        param: ["lastPassword"],
        msg: "L'ancien mot de passe est obligatoire.",
        status: 400,
      };
    if (!password) {
      throw { param: ["password"], msg: "Le mot de passe est obligatoire." };
    }
  }

  static passwordFormat({ password }: { password: string }) {
    if (password.length < 7)
      throw {
        param: ["password"],
        msg: "Le mot de passe doit comporter plus de 7 caractères.",
      };
    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasUpperCase) {
      throw {
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins une majuscule.",
      };
    }

    const hasLowerCase = /[a-z]/.test(password);
    if (!hasLowerCase) {
      throw {
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins une minuscule.",
      };
    }

    const hasNumber = /[0-9]/.test(password);
    if (!hasNumber) {
      throw {
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins un chiffre.",
      };
    }

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasSpecialChar) {
      throw {
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins un caractère spécial.",
      };
    }
  }

  static passwordUpdate({
    password,
    confirmPassword,
    lastPassword,
  }: {
    password: string;
    confirmPassword: string;
    lastPassword?: string;
  }) {
    if (password !== confirmPassword) {
      throw {
        param: ["confirmPassword"],
        msg: "Les mots de passe ne sont pas identiques.",
        status: 409,
      };
    }
    if (lastPassword) {
      if (lastPassword === password)
        throw {
          param: ["password"],
          msg: "Le mot de passe est identique à l’ancien mot de passe",
        };
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
    const validPassword = await bcrypt.compare(reqPassword, userPassword);
    if (!validPassword) {
      throw {
        param: notEmail ? ["password"] : ["email", "password"],
        msg: notEmail
          ? "Mot de passe incorrect."
          : "Email ou mot de passe incorrect.",
        status: 404,
      };
    }
  }

  static async existingEmail({ email }: { email: string }) {
    const existingEmail = await User.findOne({ where: { email: email } });
    if (existingEmail) {
      throw { param: ["email"], msg: "Cet email existe déjà.", status: 409 };
    }
  }
  static emailExist = ({ email }: { email: string }) => {
    if (!email) {
      throw {
        param: ["email"],
        msg: "Votre email est obligatoire.",
      };
    }
  };
  static emailFormat({ email }: { email: string }) {
    if (email.length < 5 || email.length > 70) {
      throw {
        param: ["email"],
        msg: "Votre email doit contenir entre 5 et 70 caractères.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw { param: ["email"], msg: "Le format de l'email est invalide." };
    }

    const [localPart, domainPart] = email.split("@");
    if (localPart.length < 1 || localPart.length > 40) {
      throw {
        param: ["email"],
        msg: "La partie avant l’arobase doit contenir entre 1 et 40 caractères.",
      };
    }

    if (domainPart.length < 4 || domainPart.length > 40) {
      throw {
        param: ["email"],
        msg: "La partie après l’arobase doit contenir entre 4 et 40 caractères.",
      };
    }
  }
  static emailUpdate({
    email,
    confirmEmail,
    lastEmail,
    userEmail,
  }: {
    email: string;
    confirmEmail: string;
    lastEmail: string;
    userEmail: string;
  }) {
    if (!lastEmail) {
      throw {
        param: ["lastEmail"],
        msg: "L'ancien email est obligatoire.",
      };
    }
    if (!email) {
      throw {
        param: ["email"],
        msg: "L'email est obligatoire.",
      };
    }
    if (!confirmEmail) {
      throw {
        param: ["confirmEmail"],
        msg: "La confirmation d'email est obligatoire.",
      };
    }
    if (userEmail !== lastEmail)
      throw {
        param: ["lastEmail"],
        msg: "Email incorrect.",
      };
    if (email !== confirmEmail) {
      throw {
        param: ["confirmEmail"],
        msg: "Les emails ne sont pas identiques.",
        status: 409,
      };
    }
    if (email === lastEmail)
      throw {
        param: ["email"],
        msg: "Le nouvel email est similaire à celui déjà enregistré.",
      };
  }
}
export default UserController;
