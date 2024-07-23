import { Response } from "express";
import { Request } from "express";
import ObjectFeedback from "../models/objectFeedbackModel";

class ObjectFeedbackController {
  /**********************************************************
            MÉTHODE POUR POSTER UN OBJECT DE FEEDBACK
**********************************************************/

  static async postAObjectFeedback(req: Request, res: Response) {
    try {
      const { label, icon } = req.body;
      if (!label) {
        return res.status(404).json({ msg: "Label obligatoire." });
      }
      if (!icon) {
        return res.status(404).json({ msg: "Icon obligatoire." });
      }
      console.log("test exist passé");
      const objectFeedback = await ObjectFeedback.findByPk(label);
      console.log(objectFeedback);
      if (objectFeedback)
        return res.status(400).json({ msg: "L'objet existe déjà." });

      await ObjectFeedback.create({
        label: label,
        icon: icon,
      });
      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json({ msg: "Erreur lors du traitement des données.", error });
    }
  }

  /*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES OBJECTS FEEDBACKS
********************************************************************************************/

  static async getAllObjectFeedbacks(req: Request, res: Response) {
    try {
      const objectfeedbacks = await ObjectFeedback.findAll();

      res.status(200).json(objectfeedbacks);
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.`,
      });
    }
  }

  /**********************************************************
            MÉTHODE POUR LISTER UN OBJECT DE FEEDBACK
**********************************************************/

  static async getAObjectFeedback(req: Request, res: Response) {
    try {
      const objectfeedback = await ObjectFeedback.findOne({
        where: { label: req.params.label },
      });

      if (!objectfeedback) {
        return res.status(404).json({ msg: "Object Feedback non trouvée." });
      }
      res.status(200).json(objectfeedback);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER UN OBJECT DE FEEDBACK
**********************************************************/

  static async putAObjectFeedback(req: Request, res: Response) {
    try {
      const { label, icon } = req.body;
      if (!label) {
        return res.status(404).json({ msg: "Label obligatoire." });
      }
      if (!icon) {
        return res.status(404).json({ msg: "Icon obligatoire." });
      }
      const objectfeedback = await ObjectFeedback.findByPk(req.params.label);
      if (!objectfeedback) {
        return res.status(404).json({ msg: "ObjectFeedback non trouvée." });
      }

      await ObjectFeedback.update(
        {
          label: label,
          modifiedAt: new Date(Date.now()),
          icon: icon,
        },
        { where: { label: req.params.label } }
      );
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR SUPPRIMER UN OBJECT DE FEEDBACK
**********************************************************/

  static async deleteAObjectFeedback(req: Request, res: Response) {
    try {
      const objectfeedback = await ObjectFeedback.destroy({
        where: { label: req.params.label },
      });

      if (!objectfeedback) {
        return res.status(404).json({ msg: "ObjectFeedback non trouvé." });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }
}
export default ObjectFeedbackController;
