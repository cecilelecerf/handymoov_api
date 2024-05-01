import express from "express";
import { Sequelize } from "sequelize";
const app = express();
const port = 3003;
import testRoute from "./../routes/testRoute";

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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Configuration des routes

app.use("/", testRoute);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`L'application écoute sur le port ${port}`);
});
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
