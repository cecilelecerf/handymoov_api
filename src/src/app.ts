import express from "express";
import { Sequelize } from "sequelize";
const app = express();
const port = 3003;
import userRoute from "./../routes/userRoute";
import personalizedAddressRoute from "../routes/personalizedAddressRoute";
import feedbackRoute from "../routes/feedbackRoute";
import issueRoute from "../routes/issueRoute";
import newsletterRoute from "../routes/newsletterRoute";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../swagger/swagger_config";

// Configuration de la base de données
const db = new Sequelize("handymoov", "admin", "admin", {
  host: "db",
  dialect: "mysql",
});

// Test de la connexion à la base de données
db.authenticate()
  .then(() => {
    console.log("Connecté à la base de données MySQL!");
  })
  .catch((err) => {
    console.error("Impossible de se connecter à la base de données:", err);
  });

// Configuration de Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration des routes
app.use("/users", userRoute);
app.use("/personalizedAddress", personalizedAddressRoute);
app.use("/feedbacks", feedbackRoute);
app.use("/newsletters", newsletterRoute);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`L'application écoute sur le port ${port}`);
});
