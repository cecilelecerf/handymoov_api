import { Response } from "express";
import { Request } from "express";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import CurrentIssue from "../models/currentIssue";
import Issue from "../models/issueModel";

/**********************************************************
            MÉTHODE POUR POSTER UN ISSUE
**********************************************************/

export const postACurrentIssue = async (req: UserRequest, res: Response) => {
  console.log(req.body);
  if (req.body.actif === undefined)
    return res.status(404).json({ msg: "Actif obligatoire" });
  try {
    await CurrentIssue.create({
      user_id: req.user.id,
      issue_id: req.body.issue_id,
      actif: req.body.actif,
    });
    const amountAll = await CurrentIssue.count({
      where: { issue_id: req.body.issue_id },
    });
    const amountActif = await CurrentIssue.count({
      where: { issue_id: req.body.issue_id, actif: true },
    });
    const result = (amountActif / amountAll) * 0.01;
    if (result < 0.5) {
      await Issue.update(
        {
          actif: false,
          modifiedAt: new Date(Date.now()),
        },
        { where: { id: req.body.issue_id } }
      );
    }

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};

/*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES ISSUES
********************************************************************************************/

export const getAllCurrentIssues = async (req: Request, res: Response) => {
  try {
    const currentIssues = await CurrentIssue.findAll();
    if (!currentIssues)
      return res.status(400).json({ msg: "Aucune currentIssues trouvés" });

    res.status(200).json(currentIssues);
  } catch (error) {
    res.status(500).json({
      msg: `Erreur lors du traitement des données.`,
    });
  }
};

/**********************************************************
            MÉTHODE POUR LISTER UN ISSUE
**********************************************************/

export const getACurrentIssue = async (req: Request, res: Response) => {
  try {
    const currentIssue = await CurrentIssue.findOne({
      where: { id: req.params.currentIssue_id },
    });

    if (!currentIssue) {
      return res.status(404).json({ msg: "CurrentIssue non trouvée." });
    }
    res.status(200).json(currentIssue);
  } catch (error) {
    res.status(500).json({ msg: "Erreur lors du traitement des données." });
  }
};
