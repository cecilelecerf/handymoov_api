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
  validateBirthday,
  validateCGU,
  validateFirstname,
  validateLastname,
  validateRole,
} from "../validations/userValidation/userValidation";
import {
  existingEmail,
  emailUpdate,
  emailExist,
  emailFormat,
} from "../validations/userValidation/emailValidation";
import {
  passwordFormat,
  passwordCompare,
  passwordUpdate,
  passwordExist,
} from "../validations/userValidation/passwordValidation";

export const registerAUser = async (req: Request, res: Response) => {
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
      validateFirstname({ firstname, required: true });
      validateLastname({ lastname, required: true });
      emailExist({ email: email });
      emailFormat({ email: email });
      passwordExist({ password: password });
      passwordFormat({ password: password });
      validateBirthday({ birthday, required: true });
      passwordUpdate({ password, confirmPassword });
      validateRole(role);
      validateCGU({ cgu });
      await existingEmail({ email: email });
    } catch (validationError) {
      // console.error(validationError);
      // console.log("--------- enter");
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
};

/**********************************************************
            MÉTHODE POUR CONNECTER UN UTILISATEUR
**********************************************************/

export const loginAUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    try {
      passwordExist({ password: password });
      emailExist({ email: email });
      await passwordCompare({
        reqPassword: password,
        userPassword: user.password,
      });
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

export const patchAUser = async (req: UserRequest, res: Response) => {
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
        emailExist({ email: email });
        emailUpdate({
          email,
          confirmEmail,
          lastEmail,
          userEmail: req.user.email,
        });
        emailFormat({ email });
      }
      if (firstname) {
        validateFirstname({ firstname, required: false });
      }
      if (lastname) {
        validateLastname({ lastname, required: false });
      }
      if (birthday) {
        validateBirthday({ birthday, required: false });
      }
      if (password || lastPassword || confirmPassword) {
        passwordExist({ password });
        passwordFormat({ password });
        passwordUpdate({
          password,
          confirmPassword,
          lastPassword,
        });
        await passwordCompare({
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
};

/**********************************************************
            MÉTHODE POUR MODIFIER UNE PHOTO DE PROFIL
**********************************************************/

export const putAProfilePictureUser = async (
  req: UserRequest,
  res: Response
) => {
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
};

/**********************************************************
            MÉTHODE POUR SUPPRIMER UN UTILISATEUR
**********************************************************/

export const deleteAUser = async (req: UserRequest, res: Response) => {
  try {
    const { password } = req.body;
    try {
      await passwordCompare({
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

// TODO : test à faire
/**********************************************************
            MÉTHODE POUR MODIFIER SON MOT DE PASSE
**********************************************************/

export const patchAUserPassword = async (req: UserRequest, res: Response) => {
  try {
    const { password, lastPassword, confirmPassword } = req.body;

    try {
      passwordExist({ password });
      passwordFormat({ password });
      passwordUpdate({
        password,
        confirmPassword,
        lastPassword,
      });
      await passwordCompare({
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

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER SON EMAIL
**********************************************************/

export const patchAUserEmail = async (req: UserRequest, res: Response) => {
  try {
    const { email, lastEmail, confirmEmail } = req.body;

    try {
      emailUpdate({
        email,
        confirmEmail,
        lastEmail,
        userEmail: req.user.email,
      });
      emailFormat({ email });
    } catch (validationError) {
      if (validationError.status)
        return res
          .status(validationError.status)
          .json({ msg: validationError.msg, param: validationError.param });
      else return res.status(400).json(validationError);
    }
    await User.update(
      {
        email: email,
        modifiedAt: new Date(Date.now()),
      },
      { where: { id: req.user.id } }
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER LE PROFIL D'UN UTILISATEUR
**********************************************************/

export const patchAUserProfil = async (req: UserRequest, res: Response) => {
  try {
    const { firstname, lastname, birthday } = req.body;

    try {
      if (firstname) {
        validateFirstname({ firstname, required: false });
      }
      if (lastname) {
        validateLastname({ lastname, required: false });
      }
      if (birthday) {
        validateBirthday({ birthday, required: false });
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
};
