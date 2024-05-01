import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
} from "sequelize";
import { db } from "../src/app";
import User from "./userModel";
import PersonalizedAdress from "./personalizedAdress";
import ObjectFeedback from "./objectFeedbackModel";

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
  declare read: boolean;
  declare hightPriority: boolean;
}
Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: NOW,
    },
    modifiedAt: {
      type: DataTypes.DATE,
      defaultValue: NOW,
    },
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
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    hightPriority: {
      type: DataTypes.BOOLEAN,
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
