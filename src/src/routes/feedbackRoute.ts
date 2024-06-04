import express from "express";
const router = express.Router();

import { isAdmin, verifyToken } from "../middlewares/jwtMiddlewares";
import {
  deleteAFeedback,
  getAFeedback,
  getAllFeedbacks,
  postAFeedback,
  putAFeedback,
} from "../controllers/feedbackController";
import {
  deleteAObjectFeedback,
  getAObjectFeedback,
  getAllObjectFeedbacks,
  postAObjectFeedback,
  putAObjectFeedback,
} from "../controllers/objectFeedback";

router.route("/").all(verifyToken).get(getAllFeedbacks).post(postAFeedback);
router
  .route("/single/:feedback_id")
  .all(isAdmin)
  .get(getAFeedback)
  .patch(putAFeedback)
  .delete(deleteAFeedback);
router
  .route("/object")
  .get(verifyToken, getAllObjectFeedbacks)
  .post(isAdmin, postAObjectFeedback);

router
  .route("/object/:label")
  .get(getAObjectFeedback)
  .put(isAdmin, putAObjectFeedback)
  .delete(isAdmin, deleteAObjectFeedback);

export default router;
