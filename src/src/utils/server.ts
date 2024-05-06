import { Sequelize } from "sequelize";
import express, { Application } from "express";
import userRoute from "../routes/userRoute";
import personalizedAddressRoute from "../routes/personalizedAddressRoute";
import feedbackRoute from "../routes/feedbackRoute";
import issueRoute from "../routes/issueRoute";
import newsletterRoute from "../routes/newsletterRoute";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../swagger/swagger_config";

function createServer() {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Configuration de Swagger
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Configuration des routes
  app.use("/users", userRoute);
  app.use("/personalizedAddress", personalizedAddressRoute);
  app.use("/feedbacks", feedbackRoute);
  app.use("/newsletters", newsletterRoute);
  app.use("/issues", issueRoute);
  return app;
}
export default createServer;
