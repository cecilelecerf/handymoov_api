import { Response } from "express";
import { Request } from "express";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import CurrentIssue from "../models/currentIssue";
import Issue from "../models/issueModel";
class CurrentIssueController {
  /**********************************************************
              MÉTHODE POUR POSTER UN ISSUE
  **********************************************************/

  static async postACurrentIssue(req: UserRequest, res: Response) {
    const { actif, issue_id } = req.body;
    if (actif === undefined)
      return res.status(404).json({ msg: "Actif obligatoire." });
    if (!issue_id)
      return res.status(404).json({ msg: "Id de l'issue obligatoire." });

    try {
      const issue = await Issue.findByPk(issue_id);
      if (!issue) return res.status(404).json({ msg: "L'issue n'existe pas." });
      await CurrentIssue.create({
        user_id: req.user.id,
        issue_id: req.body.issue_id,
        actif: req.body.actif,
      });
      const amountActif = await CurrentIssue.count({
        where: { issue_id: req.body.issue_id, actif: false },
      });

      if (amountActif === 3) {
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
  }

  /*********************************************************************************************
              MÉTHODE POUR LISTER TOUS LES ISSUES
  ********************************************************************************************/

  static async getAllCurrentIssues(req: Request, res: Response) {
    try {
      const currentIssues = await CurrentIssue.findAll();
      if (!currentIssues)
        return res.status(404).json({ msg: "Aucune currentIssues trouvés" });

      res.status(200).json(currentIssues);
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.`,
      });
    }
  }

  /**********************************************************
              MÉTHODE POUR LISTER UN ISSUE
  **********************************************************/

  static async getACurrentIssue(req: Request, res: Response) {
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
  }
}
export default CurrentIssueController;
