import express from "express";
import NewsletterController from "../controllers/newsletterController";
const router = express.Router();

router
  .route("/")
  .post(NewsletterController.postANewsletter)
  .get(NewsletterController.getAllNewsletter);
router
  .route("/:email")
  .get(NewsletterController.getANewsletter)
  .delete(NewsletterController.deleteANewsletter);

export default router;
