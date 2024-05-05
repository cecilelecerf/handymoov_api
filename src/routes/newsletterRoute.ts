import express from "express";
const router = express.Router();

import {
  deleteANewsletter,
  getANewsletter,
  getAllNewsletter,
  postANewsletter,
} from "../controllers/newsletterController";

router.route("/").post(postANewsletter).get(getAllNewsletter);
router.route("/:email").get(getANewsletter).delete(deleteANewsletter);

export default router;
