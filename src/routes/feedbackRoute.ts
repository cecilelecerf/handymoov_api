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
  getAllObjectFeedbacks,
  postAObjectFeedback,
} from "../controllers/objectFeedback";

router.route("/").all(verifyToken).get(getAllFeedbacks).post(postAFeedback);
router
  .route("/:feedback_id")
  .all(isAdmin)
  .get(getAFeedback)
  .patch(putAFeedback)
  .delete(deleteAFeedback);
router
  .route("/object")
  .all(isAdmin)
  .get(getAllObjectFeedbacks)
  .post(postAObjectFeedback)
  .delete(deleteAObjectFeedback);

export default router;
