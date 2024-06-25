import { Response } from "express";
import { Request } from "express";
import Feedback from "../models/feedbackModel";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import { body, validationResult } from "express-validator";
import {
  existFeedback,
  feedbackLengthValidation,
  objectValidationFeedback,
} from "../validations/feedbackValidation";

/**********************************************************
            MÉTHODE POUR POSTER UN FEEDBACK
**********************************************************/

export const postAFeedback = async (req: UserRequest, res: Response) => {
  try {
    // TODO : vérification à effectué

    const { object, title, description } = req.body;
    try {
      existFeedback({ object, title, description });
      await objectValidationFeedback({ objectLabel: object });
      feedbackLengthValidation({ title, description });
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
};

/*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES FEEDBACKS
********************************************************************************************/

export const getAllFeedbacks = async (req: Request, res: Response) => {
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
      return res.status(404).json({ msg: "Feedback non trouvée." });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER UN FEEDBACK
**********************************************************/

export const putAFeedback = async (req: Request, res: Response) => {
  const { object, title, description, read, hightPriority } = req.body;
  try {
    existFeedback({
      object,
      title,
      description,
      read,
      hightPriority,
      admin: true,
    });
    await objectValidationFeedback({ objectLabel: object });
    feedbackLengthValidation({ title, description });
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
      return res.status(404).json({ msg: "Feedback non trouvé." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};
