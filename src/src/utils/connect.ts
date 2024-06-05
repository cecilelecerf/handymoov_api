import { Sequelize } from "sequelize";

async function connect() {
  const userDB = process.env.DB_USER;
  const passwordDB = process.env.DB_PASSWORD;
  const hostDB = process.env.DB_HOST;
  const nameDB = process.env.DB_NAME;
  const db = new Sequelize(nameDB, userDB, passwordDB, {
    host: hostDB,
    dialect: "mysql",
  });

  // Test de la connexion à la base de données

  try {
    await db.authenticate();
    console.log("authentification valid");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connect;
