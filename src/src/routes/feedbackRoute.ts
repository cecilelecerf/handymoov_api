import express from "express";
const router = express.Router();

import { JwtMiddlewares } from "../middlewares/jwtMiddlewares";
const jwtMiddlewares = new JwtMiddlewares();
import FeedbackController from "../controllers/feedbackController";
import ObjectFeedbackController from "../controllers/objectFeedback";

router
  .route("/")
  .all(jwtMiddlewares.isConnect)
  .get(FeedbackController.getAllFeedbacks)
  .post(FeedbackController.postAFeedback);
router
  .route("/single/:feedback_id")
  .all(jwtMiddlewares.isAdmin)
  .get(FeedbackController.getAFeedback)
  .put(FeedbackController.putAFeedback)
  .delete(FeedbackController.deleteAFeedback);
router
  .route("/object")
  .get(jwtMiddlewares.isConnect, ObjectFeedbackController.getAllObjectFeedbacks)
  .post(jwtMiddlewares.isAdmin, ObjectFeedbackController.postAObjectFeedback);

router
  .route("/object/:label")
  .get(jwtMiddlewares.isConnect, ObjectFeedbackController.getAObjectFeedback)
  .put(jwtMiddlewares.isAdmin, ObjectFeedbackController.putAObjectFeedback)
  .delete(
    jwtMiddlewares.isAdmin,
    ObjectFeedbackController.deleteAObjectFeedback
  );

export default router;
