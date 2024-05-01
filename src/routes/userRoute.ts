import express from "express";
const router = express.Router();

import {
  deleteAUser,
  getAUser,
  loginAUser,
  putAUser,
  registerAUser,
} from "../controllers/userController";
import { verifyToken } from "../middlewares/jwtMiddlewares";

router.route("/register").post(registerAUser);

router.route("/login").post(loginAUser);

router
  .route("/")
  .all(verifyToken)
  .delete(deleteAUser)
  .put(putAUser)
  .get(getAUser);

export default router;
