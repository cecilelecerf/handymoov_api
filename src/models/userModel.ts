const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const sqz = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "db",
    dialect: "mysql",
  }
);

const User = sqz.define(
  "User",
  {
    mail: {
      type: DataTypes.CHAR(100),
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      default: DataTypes.NOW,
    },
    modifiedAt: {
      type: DataTypes.DATE,
      default: DataTypes.NOW,
    },
    firstname: {
      type: DataTypes.CHAR(100),
      allowNull: true,
    },
    lastname: {
      type: DataTypes.CHAR(100),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.CHAR(5),
      allowNull: true,
      defaultValue: "user",
      validate: {
        isIn: [["user", "admin"]],
      },
    },
    newsletter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

// Hash avant de sauvegarder en base de données
User.addHook("beforeSave", async (user) => {
  try {
    // Valeur par défaut de l'algorithme de hashage : 10
    const algo = await bcrypt.genSalt(10);
    const hashPw = await bcrypt.hash(user.password, algo);
    user.password = hashPw;
  } catch (error) {
    throw new Error(error);
  }
});

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await User.sync({ force: false });
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

module.exports = User;
