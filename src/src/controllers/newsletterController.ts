import Newsletter from "../models/newsletterModel";
import { Response } from "express";
import { Request } from "express";

class NewsletterController {
  /**********************************************************
            MÉTHODE POUR LISTER UNE NEWSLETTER
**********************************************************/

  static async getANewsletter(req: Request, res: Response) {
    try {
      const newsletter = await Newsletter.findByPk(req.params.newsletter_id);

      if (!newsletter) {
        return res.status(404).json({ msg: "Utilisateur non trouvé." });
      }

      res.status(200).json(newsletter);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR AJOUTER UNE newsletter
**********************************************************/

  static async postANewsletter(req: Request, res: Response) {
    try {
      if (!req.body.email) {
        return res.status(404).json({ msg: "Email obligatoire" });
      }
      await Newsletter.create({
        email: req.body.email,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR SUPPRIMER UNE NEWSLETTER
**********************************************************/

  static async deleteANewsletter(req: Request, res: Response) {
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
  }

  /**********************************************************
            MÉTHODE POUR LISTER TOUS LES NEWSLETTERS
**********************************************************/

  static async getAllNewsletter(req: Request, res: Response) {
    try {
      const newsletters = await Newsletter.findAll();
      if (!newsletters)
        return res.status(404).json({ msg: "Aucun utilisateur trouvé" });
      res.status(200).json(newsletters);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }
}
export default NewsletterController;
