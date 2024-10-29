import express from "express";
import { JwtMiddlewares } from "../middlewares/jwtMiddlewares";
const jwtMiddlewares = new JwtMiddlewares();
import JourneyController from "../controllers/journeyController";
const router = express.Router();

router
  .route("/")
  .all(jwtMiddlewares.isConnect)
  .post(JourneyController.getFilteredJourneys);

export default router;
