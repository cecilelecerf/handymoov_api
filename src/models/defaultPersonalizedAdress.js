const { DataTypes } = require("sequelize");
const { db } = require("../app");

const DefaultPersonalizedAdress = db.define(
  "DefaultPersonalizedAdress",
  {
    name: {
      type: DataTypes.CHAR(75),
      primaryKey: true,
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
  },
  {
    tableName: "defaultPersonalizedAdress",
    timestamps: true,
    underscored: true,
  }
);

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await DefaultPersonalizedAdress.esync({ force: false });
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

module.exports = DefaultPersonalizedAdress;
