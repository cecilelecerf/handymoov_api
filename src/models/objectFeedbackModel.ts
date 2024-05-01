import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
} from "sequelize";
import { db } from "../src/app";

class ObjectFeedback extends Model<
  InferAttributes<ObjectFeedback>,
  InferCreationAttributes<ObjectFeedback>
> {
  declare label: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
}

ObjectFeedback.init(
  {
    label: {
      type: DataTypes.CHAR(50),
      primaryKey: true,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: NOW,
    },
    modifiedAt: {
      type: DataTypes.DATE,
      defaultValue: NOW,
    },
  },
  {
    tableName: "objectFeedbacks",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await ObjectFeedback.sync({ force: false });
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

export default ObjectFeedback;
