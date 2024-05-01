import express from "express";
import { registerAUser } from "../controllers/userController";

const router = express.Router();

router.route("/").post(registerAUser);

export default router;
