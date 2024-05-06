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
  .route("/:feedback_id")
  .all(isAdmin)
  .get(getAFeedback)
  .patch(putAFeedback)
  .delete(deleteAFeedback);
router
  .route("/object")
  .all(isAdmin)
  .get(getAllObjectFeedbacks)
  .post(postAObjectFeedback);

router
  .route("/object/:label")
  .all(isAdmin)
  .get(getAObjectFeedback)
  .put(putAObjectFeedback)
  .delete(deleteAObjectFeedback);

export default router;
