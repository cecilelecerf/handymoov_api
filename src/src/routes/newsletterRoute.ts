import express from "express";
import NewsletterController from "../controllers/newsletterController";
import { JwtMiddlewares } from "../middlewares/jwtMiddlewares";
const jwtMiddlewares = new JwtMiddlewares();
const router = express.Router();

router
  .route("/")
  .post(NewsletterController.postANewsletter)
  .get(jwtMiddlewares.isAdmin, NewsletterController.getAllNewsletter);
router
  .route("/:email")
  .get(NewsletterController.getANewsletter)
  .delete(NewsletterController.deleteANewsletter);

export default router;
