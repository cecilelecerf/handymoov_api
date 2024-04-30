const express = require("express");
const sequelize = require("sequelize");
const app = express();
const port = 3003;

// Configuration de la base de données
const db = new sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "db",
    dialect: "mysql",
  }
);

// Test de la connexion à la base de données
// Test de la connexion à la base de données
db.authenticate()
  .then(() => {
    console.log("Connecté à la base de données MySQL!");
  })
  .catch((err: any) => {
    // Spécifiez explicitement le type du paramètre 'err'
    console.error("Impossible de se connecter à la base de données:", err);
  });

// Configuration de Swagger
// const swaggerUi = require("swagger-ui-express");
// const swaggerSpec = require("./swagger/swagger_config");
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration des routes

// Démarrage du serveur
app.listen(port, () => {
  console.log(`L'application écoute sur le port ${port}`);
});
