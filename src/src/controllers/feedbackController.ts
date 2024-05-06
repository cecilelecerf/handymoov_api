import { Response } from "express";
import { Request } from "express";
import Feedback from "../models/feedbackModel";
import { UserRequest } from "../middlewares/jwtMiddlewares";

/**********************************************************
            MÉTHODE POUR POSTER UN FEEDBACK
**********************************************************/

export const postAFeedback = async (req: UserRequest, res: Response) => {
  try {
    if (!req.body.object) {
      return res.status(404).json({ message: "Object obligatoire" });
    }
    if (!req.body.description) {
      return res.status(404).json({ message: "Description obligatoire" });
    }
    await Feedback.create({
      object: req.body.object,
      description: req.body.description,
      user_id: req.user.id,
      read: false,
      hightPriority: null,
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES FEEDBACKS
********************************************************************************************/

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.findAll();
    if (!feedbacks)
      return res.status(400).json({ message: "Aucun feedbacks trouvés" });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({
      message: `Erreur lors du traitement des données.`,
    });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER UN FEEDBACK
**********************************************************/

export const getAFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findOne({
      where: { id: req.params.feedback_id },
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback non trouvée." });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER UN FEEDBACK
**********************************************************/

export const putAFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findByPk(req.params.feedback_id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback non trouvée." });
    }
    await Feedback.update(
      {
        object: req.body.object ? req.body.object : feedback.object,
        description: req.body.description
          ? req.body.feedback
          : feedback.description,
        read: req.body.read ? req.body.read : feedback.read,
        hightPriority: req.body.hightPriority
          ? req.body.hightPriority
          : feedback.hightPriority,
        modifiedAt: new Date(Date.now()),
      },
      { where: { id: req.params.feedback_id } }
    );
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR SUPPRIMER UN FEEDBACK
**********************************************************/

export const deleteAFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.destroy({
      where: { id: req.params.feedback_id },
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback non trouvé." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};
