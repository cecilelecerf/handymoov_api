import { Response } from "express";
import { Request } from "express";
import Feedback from "../models/feedbackModel";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import ObjectFeedback from "../models/objectFeedbackModel";
// import { objectValidationFeedback } from "../validations/feedbackValidation";

class FeedbackController {
  /**********************************************************
              MÉTHODE POUR POSTER UN FEEDBACK
  **********************************************************/
  static async postAFeedback(req: UserRequest, res: Response) {
    try {
      // TODO : vérification à effectué

      const { object, title, description } = req.body;
      try {
        FeedbackController.existFeedback({ object, title, description });
        await FeedbackController.objectValidationFeedback({
          objectLabel: object,
        });
        FeedbackController.feedbackLengthValidation({ title, description });
      } catch (validationError) {
        return res
          .status(400)
          .json({ msg: validationError.msg, param: validationError.param });
      }
      const newFeedback = await Feedback.create({
        object,
        title,
        description,
        user_id: req.user.id,
        read: false,
        hightPriority: false,
      });
      res.status(201).json(newFeedback);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES FEEDBACKS
********************************************************************************************/

  static async getAllFeedbacks(req: Request, res: Response) {
    try {
      const feedbacks = await Feedback.findAll();
      if (!feedbacks || feedbacks.length === 0)
        return res.status(404).json({ msg: "Aucun feedbacks trouvés." });

      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.`,
      });
    }
  }

  /**********************************************************
            MÉTHODE POUR LISTER UN FEEDBACK
**********************************************************/

  static async getAFeedback(req: Request, res: Response) {
    try {
      const feedback = await Feedback.findOne({
        where: { id: req.params.feedback_id },
      });

      if (!feedback) {
        return res.status(404).json({ msg: "Feedback non trouvée." });
      }
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER UN FEEDBACK
**********************************************************/

  static async putAFeedback(req: Request, res: Response) {
    const { object, title, description, read, hightPriority } = req.body;
    try {
      FeedbackController.existFeedback({
        object,
        title,
        description,
        read,
        hightPriority,
        admin: true,
      });
      await FeedbackController.objectValidationFeedback({
        objectLabel: object,
      });
      FeedbackController.feedbackLengthValidation({ title, description });
    } catch (validationError) {
      return res
        .status(400)
        .json({ msg: validationError.msg, param: validationError.param });
    }
    try {
      const feedback = await Feedback.findByPk(req.params.feedback_id);
      if (!feedback) {
        return res.status(404).json({ msg: "Feedback non trouvée." });
      }

      await Feedback.update(
        {
          object: object,
          description: description,
          read: read,
          hightPriority: hightPriority,
          modifiedAt: new Date(Date.now()),
        },
        { where: { id: req.params.feedback_id } }
      );
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR SUPPRIMER UN FEEDBACK
**********************************************************/

  static async deleteAFeedback(req: Request, res: Response) {
    try {
      const feedback = await Feedback.destroy({
        where: { id: req.params.feedback_id },
      });

      if (!feedback) {
        return res.status(404).json({ msg: "Feedback non trouvé." });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }
  /**********************************************************
            MÉTHODES DE VALIDATION
  **********************************************************/
  static existFeedback({
    object,
    title,
    description,
    admin,
    read,
    hightPriority,
  }: {
    object: string;
    title: string;
    description: string;
    admin?: boolean;
    read?: boolean;
    hightPriority?: boolean;
  }) {
    if (!object) throw { param: ["object"], msg: "L'objet est obligatoire." };
    if (!title) throw { param: ["title"], msg: "Le titre est obligatoire." };
    if (!description)
      throw { param: ["description"], msg: "La description est obligatoire." };
    if (admin) {
      if (!read)
        throw {
          param: ["read"],
          msg: "Savoir si le feedback a été lu est obligatoire.",
        };
      if (!hightPriority)
        throw {
          param: ["hightPriority"],
          msg: "Savoir si le feedback est prioritaire est obligatoire.",
        };
    }
  }

  static feedbackLengthValidation({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    if (title.length >= 100)
      throw {
        param: ["title"],
        msg: "Le titre doit faire 100 caractères maximum.",
      };
    if (description.length >= 1000)
      throw {
        param: ["description"],
        msg: "La description doit faire 1000 caractères maximum.",
      };
  }
  static objectValidationFeedback = async ({
    objectLabel,
  }: {
    objectLabel: string;
  }) => {
    const object = await ObjectFeedback.findByPk(objectLabel);
    if (!object)
      throw {
        param: ["object"],
        msg: "Vous devez utiliser un objet prédéfini.",
        status: 404,
      };
  };
}

export default FeedbackController;
