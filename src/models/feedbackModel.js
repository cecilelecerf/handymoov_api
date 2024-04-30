const { DataTypes } = require("sequelize");
const { db } = require("../app");

const Feedback = db.define(
  "Feedback",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      default: DataTypes.NOW,
    },
    modifiedAt: {
      type: DataTypes.DATE,
      default: DataTypes.NOW,
    },
    object: {
      type: DataTypes.CHAR(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.VARCHAR(200),
      allowNull: false,
    },
    user_mail: {
      type: DataTypes.CHAR(100),
      allowNull: false,
    },
  },
  {
    tableName: "feedbacks",
    timestamps: true,
    underscored: true,
  }
);

const ObjectFeedback = require("./objectFeedbackModel.js");
Feedback.belongsTo(ObjectFeedback, { foreignKey: "object" });

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await Feedback.esync({ force: false });
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

module.exports = Feedback;
