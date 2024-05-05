import express from "express";
const router = express.Router();

import { verifyToken } from "../middlewares/jwtMiddlewares";

import {
  getAIssue,
  getAllIssues,
  getAllIssuesActif,
  getAllIssuesUser,
  postAIssue,
} from "../controllers/issueController";
import { postACurrentIssue } from "../controllers/currentIssueController";

router.route("/").all(verifyToken).get(getAllIssues).post(postAIssue);
router.route("/actif").all(verifyToken).get(getAllIssuesActif);
router.route("/:issue_id").all(verifyToken).get(getAIssue);
router.route("/user").all(verifyToken).get(getAllIssuesUser);
router.route("/currentIssue").all(verifyToken).post(postACurrentIssue);

export default router;
