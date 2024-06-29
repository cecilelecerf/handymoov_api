import express from "express";
const router = express.Router();

import { isAdmin, verifyToken } from "../middlewares/jwtMiddlewares";
import upload from "../middlewares/mulderMiddlewares";
import UserController from "../controllers/userController";

router.route("/register").post(UserController.registerAUser);

router.route("/login").post(UserController.loginAUser);

router
  .route("/")
  .all(verifyToken)
  .post(UserController.deleteAUser)
  .put(UserController.patchAUser)
  .get(UserController.getAUser);

router
  .route("/updatePassword")
  .patch(verifyToken, UserController.patchAUserPassword);
router.route("/updateEmail").patch(verifyToken, UserController.patchAUserEmail);
router
  .route("/updateProfil")
  .patch(verifyToken, UserController.patchAUserProfil);

router
  .route("/profile-picture")
  .patch(
    verifyToken,
    upload.single("profilePicture"),
    UserController.putAProfilePictureUser
  );

router.route("/all").get(isAdmin, UserController.getAllUser);

export default router;
