import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
} from "sequelize";
import { db } from "../src/app";

class Newsletter extends Model<
  InferAttributes<Newsletter>,
  InferCreationAttributes<Newsletter>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare mail: string;
}
Newsletter.init(
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
    mail: {
      type: DataTypes.CHAR(100),
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "newsletters",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await Newsletter.sync({ force: false });
    console.log("Modèle Newsletter synchronisé avec la base de données.");
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation du modèle Newsletter:",
      error
    );
  }
})();

export default Newsletter;
