import express from "express";
const router = express.Router();

import { verifyToken } from "../middlewares/jwtMiddlewares";
import PersonalizedAddressController from "../controllers/personalizedAddressController";

router
  .route("/")
  .all(verifyToken)
  .patch(PersonalizedAddressController.patchAPersonalizedAddress)
  .put(PersonalizedAddressController.deleteAPersonalizedAddress);

router
  .route("/all")
  .all(verifyToken)
  .get(PersonalizedAddressController.getAllPersonalizedAddress);

export default router;
