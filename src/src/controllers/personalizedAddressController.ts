import { Response } from "express";
import { Request } from "express";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import PersonalizedAddress from "../models/personalizedAddress";

class PersonalizedAddressController {
  /*********************************************************************************************
            MÉTHODE POUR LISTER TOUTES LES ADRESSES PERSONNALISÉES DE L'UTILISATEUR
********************************************************************************************/

  static async getAllPersonalizedAddress(req: UserRequest, res: Response) {
    try {
      const personalizedAddress = await PersonalizedAddress.findAll({
        where: { user_id: req.user.id },
      });
      if (!personalizedAddress)
        return res.status(404).json({ msg: "Aucune adresse trouvée" });

      res.status(200).json(personalizedAddress);
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.`,
      });
    }
  }

  /**********************************************************
            MÉTHODE POUR LISTER UNE ADRESSE PERSONNALISÉE DE L'UTILISATEUR
**********************************************************/

  static async getAPersonalizedAddress(req: Request, res: Response) {
    try {
      const personalizedAddress = await PersonalizedAddress.findByPk(
        req.body.personalizedAddress_id
      );
      if (!personalizedAddress) {
        return res.status(404).json({ msg: "Addresse non trouvée." });
      }
      res.status(200).json(personalizedAddress);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER UNE ADRESSE PERSONNALISÉE
**********************************************************/

  // TODO : verif si l'adresse correspond bien à l'user
  static async patchAPersonalizedAddress(req: Request, res: Response) {
    try {
      const { id, country, city, street, number, lat, lng } = req.body;
      const personalizedAddress = await PersonalizedAddress.findByPk(id);
      if (!personalizedAddress) {
        return res.status(404).json({ msg: "Adresse non trouvée." });
      }
      await PersonalizedAddress.update(
        {
          country: req.body.country ? country : personalizedAddress.country,
          city: city ? city : personalizedAddress.city,
          street: street ? street : personalizedAddress.street,
          number: number ? number : personalizedAddress.number,
          lat: lat,
          lng: lng,
          modifiedAt: new Date(Date.now()),
        },
        { where: { id: id } }
      );
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR SUPPRIMER UNE ADRESSE PERSONNALISÉE DE L'UTILISATEUR
**********************************************************/

  static async deleteAPersonalizedAddress(req: UserRequest, res: Response) {
    try {
      const personalizedAddress = await PersonalizedAddress.findByPk(
        req.body.personalizedAddress_id
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
          return res.status(404).json({ msg: "Addresse non trouvé." });
        }
        res.status(204).send();
      }
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }
}
export default PersonalizedAddressController;
