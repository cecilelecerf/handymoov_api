import express from "express";
const router = express.Router();

import { JwtMiddlewares } from "../middlewares/jwtMiddlewares";
const jwtMiddlewares = new JwtMiddlewares();
import IssueController from "../controllers/issueController";
import CurrentIssueController from "../controllers/currentIssueController";

router
  .route("/")
  .all(jwtMiddlewares.isConnect)
  .get(IssueController.getAllIssues)
  .post(IssueController.postAIssue);
router
  .route("/single/:issue_id")
  .get(jwtMiddlewares.isConnect, IssueController.getAIssue)
  .put(jwtMiddlewares.isAdmin, IssueController.putAIssue)
  .delete(jwtMiddlewares.isAdmin, IssueController.deleteAIssue);

// TODO ne fonctionne pas

router
  .route("/actif")
  .all(jwtMiddlewares.isConnect)
  .get(IssueController.getAllIssuesActif);
router
  .route("/user")
  .all(jwtMiddlewares.isConnect)
  .get(IssueController.getAllIssuesUser);

router
  .route("/currentIssue")
  .all(jwtMiddlewares.isConnect)
  .post(CurrentIssueController.postACurrentIssue);

export default router;
