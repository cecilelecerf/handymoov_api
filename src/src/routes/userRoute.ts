import express from "express";
const router = express.Router();

import {
  deleteAUser,
  getAUser,
  getAllUser,
  loginAUser,
  putAUser,
  registerAUser,
} from "../controllers/userController";
import { isAdmin, verifyToken } from "../middlewares/jwtMiddlewares";

router.route("/register").post(registerAUser);

router.route("/login").post(loginAUser);

router
  .route("/")
  .all(verifyToken)
  .delete(deleteAUser)
  .put(putAUser)
  .get(getAUser);

router.route("/all").get(isAdmin, getAllUser);

export default router;
