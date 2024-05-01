import User from "../models/userModel";
import { Response } from "express";
import { Request } from "express";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import PersonalizedAddress from "../models/personalizedAddress";
import { where } from "sequelize";

/*********************************************************************************************
            MÉTHODE POUR LISTER TOUTES LES ADRESSES PERSONNALISÉES DE L'UTILISATEUR
********************************************************************************************/

export const getAllPersonalizedAddress = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const personalizedAddress = await PersonalizedAddress.findAll({
      where: { user_id: req.user.id },
    });
    if (!personalizedAddress)
      return res.status(400).json({ message: "Aucune adresse trouvée" });

    res.status(200).json(personalizedAddress);
  } catch (error) {
    res.status(500).json({
      message: `Erreur lors du traitement des données.`,
    });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER UNE ADRESSE PERSONNALISÉE DE L'UTILISATEUR
**********************************************************/

export const getAPersonalizedAddress = async (req: Request, res: Response) => {
  try {
    const personalizedAddress = await PersonalizedAddress.findOne({
      where: { id: req.params.personalizedAddress_id },
    });

    if (!personalizedAddress) {
      return res.status(404).json({ message: "Addresse non trouvée." });
    }
    res.status(200).json(personalizedAddress);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER UNE ADRESSE PERSONNALISÉE
**********************************************************/

export const putAPersonalizedAddress = async (req: Request, res: Response) => {
  try {
    const personalizedAddress = await PersonalizedAddress.findByPk(
      req.params.personalizedAddress_id
    );
    if (!personalizedAddress) {
      return res.status(404).json({ message: "Adresse non trouvée." });
    }
    await PersonalizedAddress.update(
      {
        country: req.body.country
          ? req.body.country
          : personalizedAddress.country,
        city: req.body.city ? req.body.city : personalizedAddress.city,
        street: req.body.street ? req.body.street : personalizedAddress.street,
        number: req.body.number ? req.body.number : personalizedAddress.number,
        modifiedAt: new Date(Date.now()),
      },
      { where: { id: req.params.personalizedAddress_id } }
    );
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR SUPPRIMER UNE ADRESSE PERSONNALISÉE DE L'UTILISATEUR
**********************************************************/

export const deleteAPersonalizedAddress = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const personalizedAddress = await PersonalizedAddress.findByPk(
      req.params.personalizedAddress_id
    );
    if (
      personalizedAddress.label === "Maison" ||
      personalizedAddress.label === "Travail"
    ) {
      personalizedAddress.update({
        modifiedAt: new Date(Date.now()),
      });
      return res.status(204).send();
    } else {
      await PersonalizedAddress.destroy({
        where: { id: personalizedAddress.id },
      });

      if (!personalizedAddress) {
        return res.status(404).json({ message: "Addresse non trouvé." });
      }
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};
