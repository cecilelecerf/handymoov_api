import {
  CreationOptional,
  DATE,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";
import User from "./userModel";
import Issue from "./issueModel";
const db = new Sequelize("handymoov", "admin", "admin", {
  host: "db",
  dialect: "mysql",
});
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

CurrentIssue.belongsTo(User, { foreignKey: "user_id" });
CurrentIssue.belongsTo(Issue, { foreignKey: "issue_id" });

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await CurrentIssue.sync({ force: false });
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation du modèle CurrentIssue:",
      error
    );
  }
})();

export default CurrentIssue;
