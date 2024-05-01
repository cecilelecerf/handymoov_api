import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { db } from "../src/app";
import ObjectFeedback from "./objectFeedbackModel.js";
import User from "./userModel";
import PersonalizedAdress from "./personalizedAdress";

class Feedback extends Model<
  InferAttributes<Feedback>,
  InferCreationAttributes<Feedback>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare object: string;
  declare description: string;
  declare user_id: ForeignKey<User["id"]>;
}
Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    createdAt: DataTypes.DATE,
    modifiedAt: DataTypes.DATE,
    object: {
      type: DataTypes.CHAR(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.CHAR(400),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "feedbacks",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

Feedback.belongsTo(ObjectFeedback, { foreignKey: "object" });
// Liaison avec les autres modèles
PersonalizedAdress.belongsTo(User, { targetKey: "id" });

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await Feedback.sync({ force: false });
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

module.exports = Feedback;
