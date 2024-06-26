import express from "express";
const router = express.Router();

import {
  deleteAPersonalizedAddress,
  getAPersonalizedAddress,
  getAllPersonalizedAddress,
  patchAPersonalizedAddress,
} from "../controllers/personalizedAddressController";
import { verifyToken } from "../middlewares/jwtMiddlewares";

router
  .route("/")
  .all(verifyToken)
  .post(getAPersonalizedAddress)
  .patch(patchAPersonalizedAddress)
  .put(deleteAPersonalizedAddress);

router.route("/all").all(verifyToken).get(getAllPersonalizedAddress);

export default router;
