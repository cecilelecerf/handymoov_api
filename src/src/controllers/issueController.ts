import { Response } from "express";
import { Request } from "express";
import { UserRequest } from "../middlewares/jwtMiddlewares";
import Issue from "../models/issueModel";
class IssueController {
  /**********************************************************
            MÉTHODE POUR POSTER UN ISSUE
**********************************************************/

  static async postAIssue(req: UserRequest, res: Response) {
    const { label, gpsCoordinateLat, gpsCoordinateLng } = req.body;
    try {
      if (!label) {
        return res.status(404).json({ msg: "Label obligatoire" });
      }
      if (!gpsCoordinateLat || !gpsCoordinateLng) {
        return res.status(404).json({ msg: "Coordonées obligatoire" });
      }
      await Issue.create({
        label: label,
        gpsCoordinateLat: gpsCoordinateLat,
        gpsCoordinateLng: gpsCoordinateLng,
        actif: true,
        user_id: req.user.id,
      });
      return res.status(200).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES ISSUES
********************************************************************************************/

  static async getAllIssues(req: Request, res: Response) {
    try {
      const issues = await Issue.findAll();
      if (!issues || issues.length === 0)
        return res.status(404).json({ msg: "Aucune issues trouvés" });

      res.status(200).json(issues);
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.`,
      });
    }
  }

  /*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES ISSUES D'UN USER
********************************************************************************************/

  static async getAllIssuesUser(req: UserRequest, res: Response) {
    try {
      const test = await Issue.findAll();
      const issues = await Issue.findAll({ where: { user_id: req.user.id } });
      if (!issues || issues.length === 0)
        return res.status(404).json({ msg: "Aucune issues trouvés" });

      return res.status(200).json(issues);
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.`,
      });
    }
  }

  /*********************************************************************************************
            MÉTHODE POUR LISTER TOUS LES ISSUES ACTIFS
********************************************************************************************/

  static async getAllIssuesActif(req: Request, res: Response) {
    try {
      const issues = await Issue.findAll({ where: { actif: true } });
      if (!issues || issues.length === 0)
        return res.status(404).json({ msg: "Aucune issues trouvées." });

      res.status(200).json(issues);
    } catch (error) {
      res.status(500).json({
        msg: `Erreur lors du traitement des données.`,
      });
    }
  }
  /**********************************************************
            MÉTHODE POUR LISTER UN ISSUE
**********************************************************/

  static async getAIssue(req: Request, res: Response) {
    try {
      const issue = await Issue.findOne({
        where: { id: req.params.issue_id },
      });

      if (!issue) {
        return res.status(404).json({ msg: "Issue non trouvée." });
      }
      res.status(200).json(issue);
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR MODIFIER UN ISSUE
**********************************************************/

  static async putAIssue(req: Request, res: Response) {
    try {
      const issue = await Issue.findByPk(req.params.issue_id);
      if (!issue) {
        return res.status(404).json({ msg: "Issue non trouvée." });
      }
      await Issue.update(
        {
          label: req.body.label ? req.body.label : issue.label,

          gpsCoordinateLat: req.body.gpsCoordinate
            ? req.body.gpsCoordinateLat
            : issue.gpsCoordinateLat,
          gpsCoordinateLng: req.body.gpsCoordinate
            ? req.body.gpsCoordinateLng
            : issue.gpsCoordinateLng,

          modifiedAt: new Date(Date.now()),
        },
        { where: { id: req.params.issue_id } }
      );
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }

  /**********************************************************
            MÉTHODE POUR SUPPRIMER UN ISSUE
**********************************************************/

  static async deleteAIssue(req: Request, res: Response) {
    try {
      const issue = await Issue.destroy({
        where: { id: req.params.issue_id },
      });

      if (!issue) {
        return res.status(404).json({ msg: "Issue non trouvé." });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ msg: "Erreur lors du traitement des données." });
    }
  }
}
export default IssueController;
