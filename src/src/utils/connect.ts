import { Sequelize } from "sequelize";

async function connect() {
  // Configuration de la base de données
  const db = new Sequelize("handymoov", "admin", "admin", {
    host: "db",
    dialect: "mysql",
  });

  // Test de la connexion à la base de données

  try {
    await db.authenticate();
  } catch (error) {
    process.exit(1);
  }
}

export default connect;
