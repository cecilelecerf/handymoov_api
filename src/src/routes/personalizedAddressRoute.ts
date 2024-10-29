import express from "express";
const router = express.Router();

import { JwtMiddlewares } from "../middlewares/jwtMiddlewares";
const jwtMiddlewares = new JwtMiddlewares();
import PersonalizedAddressController from "../controllers/personalizedAddressController";

router
  .route("/")
  .all(jwtMiddlewares.isConnect)
  .get(PersonalizedAddressController.getAllPersonalizedAddress)
  .patch(PersonalizedAddressController.patchAPersonalizedAddress)
  .put(PersonalizedAddressController.deleteAPersonalizedAddress);
router
  .route("/:personalizedAddress_id")
  .all(jwtMiddlewares.isConnect)
  .get(PersonalizedAddressController.getAPersonalizedAddress);

export default router;
