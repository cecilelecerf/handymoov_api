import express from "express";
const router = express.Router();

import { isAdmin, verifyToken } from "../middlewares/jwtMiddlewares";
import IssueController from "../controllers/issueController";

router
  .route("/")
  .all(verifyToken)
  .get(IssueController.getAllIssues)
  .post(IssueController.postAIssue);
router
  .route("/:issue_id")
  .get(verifyToken, IssueController.getAIssue)
  .put(isAdmin, IssueController.putAIssue)
  .delete(isAdmin, IssueController.deleteAIssue);

// TODO ne fonctionne pas

router.route("/actif").all(verifyToken).get(IssueController.getAllIssuesActif);
router.route("/user").all(verifyToken).get(IssueController.getAllIssuesUser);

router.route("/currentIssue").all(verifyToken).post(IssueController.postAIssue);

export default router;
