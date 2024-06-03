import Newsletter from "../models/newsletterModel";
import { Response } from "express";
import { Request } from "express";

/**********************************************************
            MÉTHODE POUR LISTER UNE NEWSLETTER
**********************************************************/

export const getANewsletter = async (req: Request, res: Response) => {
  try {
    const newsletter = await Newsletter.findByPk(req.params.newsletter_id);

    if (!newsletter) {
      return res.status(404).json({ msg: "Utilisateur non trouvé." });
    }

    res.status(200).json(newsletter);
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR AJOUTER UNE newsletter
**********************************************************/

export const postANewsletter = async (req: Request, res: Response) => {
  try {
    if (!req.body.email) {
      return res.status(404).json({ msg: "Email obligatoire" });
    }
    await Newsletter.create({
      email: req.body.email,
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR SUPPRIMER UNE NEWSLETTER
**********************************************************/

export const deleteANewsletter = async (req: Request, res: Response) => {
  try {
    const deletedNewsletter = await Newsletter.destroy({
      where: { email: req.params.email },
    });

    if (!deletedNewsletter) {
      return res.status(404).json({ msg: "Email non trouvé." });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER TOUS LES NEWSLETTERS
**********************************************************/

export const getAllNewsletter = async (req: Request, res: Response) => {
  try {
    const newsletters = await Newsletter.findAll();
    if (!newsletters)
      return res.status(400).json({ msg: "Aucun utilisateur trouvé" });
    res.status(200).json(newsletters);
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};
