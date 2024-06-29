import express from "express";
const router = express.Router();

import { isAdmin, verifyToken } from "../middlewares/jwtMiddlewares";
import FeedbackController from "../controllers/feedbackController";
import ObjectFeedbackController from "../controllers/objectFeedback";

router
  .route("/")
  .all(verifyToken)
  .get(FeedbackController.getAllFeedbacks)
  .post(FeedbackController.postAFeedback);
router
  .route("/single/:feedback_id")
  .all(isAdmin)
  .get(FeedbackController.getAFeedback)
  .put(FeedbackController.putAFeedback)
  .delete(FeedbackController.deleteAFeedback);
router
  .route("/object")
  .get(verifyToken, ObjectFeedbackController.getAllObjectFeedbacks)
  .post(isAdmin, ObjectFeedbackController.postAObjectFeedback);

router
  .route("/object/:label")
  .get(ObjectFeedbackController.getAObjectFeedback)
  .put(isAdmin, ObjectFeedbackController.putAObjectFeedback)
  .delete(isAdmin, ObjectFeedbackController.deleteAObjectFeedback);

export default router;
