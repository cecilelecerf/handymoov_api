import express from "express";
const router = express.Router();

import {
  deleteAUser,
  getAUser,
  getAllUser,
  loginAUser,
  patchAUserEmail,
  patchAUserPassword,
  patchAUser,
  registerAUser,
  patchAUserProfil,
  putAProfilePictureUser,
} from "../controllers/userController";
import { isAdmin, verifyToken } from "../middlewares/jwtMiddlewares";
import upload from "../middlewares/mulderMiddlewares";

router.route("/register").post(registerAUser);

router.route("/login").post(loginAUser);

router
  .route("/")
  .all(verifyToken)
  .delete(deleteAUser)
  .put(patchAUser)
  .get(getAUser);
router.route("/updatePassword").patch(verifyToken, patchAUserPassword);
router.route("/updateEmail").patch(verifyToken, patchAUserEmail);
router.route("/updateProfil").patch(verifyToken, patchAUserProfil);
router
  .route("/profile-picture")
  .patch(verifyToken, upload.single("profilePicture"), putAProfilePictureUser);
router.route("/all").get(isAdmin, getAllUser);

export default router;
