import {
  CreationOptional,
  DATE,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
} from "sequelize";
import { db } from "../src/app";
import User from "./userModel";
import Issue from "./issueModel";

class CurrentIssue extends Model<
  InferAttributes<CurrentIssue>,
  InferCreationAttributes<CurrentIssue>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare user_id: ForeignKey<User["id"]>;
  declare issue_id: ForeignKey<Issue["id"]>;
  declare actif: boolean;
}
CurrentIssue.init(
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
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "currentIssues",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await CurrentIssue.sync({ force: false });
    console.log("Modèle CurrentIssue synchronisé avec la base de données.");
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation du modèle CurrentIssue:",
      error
    );
  }
})();

export default CurrentIssue;
