import express from "express";
const router = express.Router();

import { isAdmin, verifyToken } from "../middlewares/jwtMiddlewares";

import {
  deleteAIssue,
  getAIssue,
  getAllIssues,
  getAllIssuesActif,
  getAllIssuesUser,
  postAIssue,
  putAIssue,
} from "../controllers/issueController";
import { postACurrentIssue } from "../controllers/currentIssueController";

router.route("/").all(verifyToken).get(getAllIssues).post(postAIssue);
router
  .route("/:issue_id")
  .get(verifyToken, getAIssue)
  .put(isAdmin, putAIssue)
  .delete(isAdmin, deleteAIssue);

// TODO ne fonctionne pas

router.route("/actif").all(verifyToken).get(getAllIssuesActif);
router.route("/user").all(verifyToken).get(getAllIssuesUser);

router.route("/currentIssue").all(verifyToken).post(postACurrentIssue);

export default router;
