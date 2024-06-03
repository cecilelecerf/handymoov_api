import express from "express";
import { getFilteredJourneys } from "../controllers/journeyController";
import { verifyToken } from "../middlewares/jwtMiddlewares";
const router = express.Router();

router.route("/").all(verifyToken).post(getFilteredJourneys);

export default router;
