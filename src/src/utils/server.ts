import express from "express";
import userRoute from "../routes/userRoute";
import personalizedAddressRoute from "../routes/personalizedAddressRoute";
import feedbackRoute from "../routes/feedbackRoute";
import issueRoute from "../routes/issueRoute";
import newsletterRoute from "../routes/newsletterRoute";
import swaggerUi from "swagger-ui-express";
import journeyRoute from "../routes/journeyRoute";
import path from "path";
import cors from "cors";

import fs from "fs";
import specs from "../swagger/swagger_config";

const createUploadsDirectory = () => {
  const directory = "uploads";
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

function createServer() {
  const app = express();
  // app.use(
  //   cors({
  //     origin: ["https://api.handymoov.com", "https://handymoov.com"],
  //   })
  // );

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  const uploadsDirectory = path.resolve("/app/uploads");
  app.use("/uploads", express.static(uploadsDirectory));
  // Configuration de Swagger
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  createUploadsDirectory();
  // Configuration des routes
  app.use("/users", userRoute);
  app.use("/personalizedAddress", personalizedAddressRoute);
  app.use("/feedbacks", feedbackRoute);
  app.use("/newsletters", newsletterRoute);
  app.use("/issues", issueRoute);
  app.use("/journeys", journeyRoute);
  return app;
}
export default createServer;
