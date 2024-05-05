import { Response } from "express";
import { Request } from "express";
import ObjectFeedback from "../models/objectFeedbackModel";

/**********************************************************
            MÉTHODE POUR POSTER UN OBJECT DE FEEDBACK
**********************************************************/

export const postAObjectFeedback = async (req: Request, res: Response) => {
  try {
    if (!req.body.label) {
      return res.status(404).json({ message: "Label obligatoire" });
    }
    await ObjectFeedback.create({
      label: req.body.label,
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES OBJECTS FEEDBACKS
********************************************************************************************/

export const getAllObjectFeedbacks = async (req: Request, res: Response) => {
  try {
    const objectfeedbacks = await ObjectFeedback.findAll();
    if (!objectfeedbacks)
      return res
        .status(400)
        .json({ message: "Aucun object de feedback trouvé" });

    res.status(200).json(objectfeedbacks);
  } catch (error) {
    res.status(500).json({
      message: `Erreur lors du traitement des données.`,
    });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER UN OBJECT DE FEEDBACK
**********************************************************/

export const getAObjectFeedback = async (req: Request, res: Response) => {
  try {
    const objectfeedback = await ObjectFeedback.findOne({
      where: { label: req.params.label },
    });

    if (!objectfeedback) {
      return res.status(404).json({ message: "Object Feedback non trouvée." });
    }
    res.status(200).json(objectfeedback);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR MODIFIER UN OBJECT DE FEEDBACK
**********************************************************/

export const putAObjectFeedback = async (req: Request, res: Response) => {
  try {
    const objectfeedback = await ObjectFeedback.findByPk(req.params.label);
    if (!objectfeedback) {
      return res.status(404).json({ message: "ObjectFeedback non trouvée." });
    }
    await ObjectFeedback.update(
      {
        label: req.body.object ? req.body.object : objectfeedback.label,
        modifiedAt: new Date(Date.now()),
      },
      { where: { label: req.params.label } }
    );
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};

/**********************************************************
            MÉTHODE POUR SUPPRIMER UN OBJECT DE FEEDBACK
**********************************************************/

export const deleteAObjectFeedback = async (req: Request, res: Response) => {
  try {
    const objectfeedback = await ObjectFeedback.destroy({
      where: { label: req.params.label },
    });

    if (!objectfeedback) {
      return res.status(404).json({ message: "ObjectFeedback non trouvé." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du traitement des données." });
  }
};
