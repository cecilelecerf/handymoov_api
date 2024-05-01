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
const db = new Sequelize("handymoov", "admin", "admin", {
  host: "db",
  dialect: "mysql",
});

class Issue extends Model<
  InferAttributes<Issue>,
  InferCreationAttributes<Issue>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare label: string;
  declare gpsCoordinate: string;
  declare actif: boolean;
  declare user_id: ForeignKey<User["id"]>;
}
Issue.init(
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
    label: {
      type: DataTypes.CHAR(100),
      unique: true,
      allowNull: false,
    },
    gpsCoordinate: {
      type: DataTypes.CHAR(100),
    },
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "issues",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);
Issue.belongsTo(User, { foreignKey: "user_id" });

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await Issue.sync({ force: false });
    console.log("Modèle Issue synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle Issue:", error);
  }
})();

export default Issue;
