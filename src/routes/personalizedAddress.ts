import express from "express";
const router = express.Router();

import {
  deleteAPersonalizedAddress,
  getAPersonalizedAddress,
  getAllPersonalizedAddress,
  putAPersonalizedAddress,
} from "../controllers/personalizedAddressController";
import { verifyToken } from "../middlewares/jwtMiddlewares";

router
  .route("/:personalizedAddress_id")
  .all(verifyToken)
  .get(getAPersonalizedAddress)
  .patch(putAPersonalizedAddress)
  .put(deleteAPersonalizedAddress);

router.route("/").all(verifyToken).get(getAllPersonalizedAddress);

export default router;
