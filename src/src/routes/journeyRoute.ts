import express from "express";
import { verifyToken } from "../middlewares/jwtMiddlewares";
import JourneyController from "../controllers/journeyController";
const router = express.Router();

router.route("/").all(verifyToken).post(JourneyController.getFilteredJourneys);

export default router;
