import express from "express";
import { Sequelize } from "sequelize";
const app = express();
const port = 3003;

// Configuration de la base de données
export const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "db",
    dialect: "mysql",
  }
);

// Test de la connexion à la base de données
db.authenticate()
  .then(() => {
    console.log("Connecté à la base de données MySQL!");
  })
  .catch((err) => {
    console.error("Impossible de se connecter à la base de données:", err);
  });

// Configuration des routes

// Démarrage du serveur
app.listen(port, () => {
  console.log(`L'application écoute sur le port ${port}`);
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
