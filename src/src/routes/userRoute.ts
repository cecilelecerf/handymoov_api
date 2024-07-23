import express from "express";
const router = express.Router();

import upload from "../middlewares/mulderMiddlewares";
import UserController from "../controllers/userController";
import { JwtMiddlewares } from "../middlewares/jwtMiddlewares";
const jwtMiddlewares = new JwtMiddlewares();
router.route("/register").post(UserController.registerAUser);
router.route("/login").post(UserController.loginAUser);

router
  .route("/")
  .all(jwtMiddlewares.isConnect)
  .post(UserController.deleteAUser)
  .put(UserController.patchAUser)
  .get(UserController.getAUser);

router
  .route("/updatePassword")
  .patch(jwtMiddlewares.isConnect, UserController.patchAUserPassword);
router
  .route("/updateEmail")
  .patch(jwtMiddlewares.isConnect, UserController.patchAUserEmail);
router
  .route("/updateProfil")
  .patch(jwtMiddlewares.isConnect, UserController.patchAUserProfil);

router
  .route("/profile-picture")
  .patch(
    jwtMiddlewares.isConnect,
    upload.single("profilePicture"),
    UserController.putAProfilePictureUser
  );

router.route("/all").get(jwtMiddlewares.isAdmin, UserController.getAllUser);

export default router;
