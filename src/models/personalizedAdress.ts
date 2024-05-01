import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import User from "./userModel";

import { DataTypes } from "sequelize";
import { db } from "../src/app";

class PersonalizedAdress extends Model<
  InferAttributes<PersonalizedAdress>,
  InferCreationAttributes<PersonalizedAdress>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare label: string;
  declare country: string;
  declare city: string;
  declare street: string;
  declare number: string;
  declare user_id: ForeignKey<User["id"]>;
}
PersonalizedAdress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    createdAt: DataTypes.DATE,
    modifiedAt: DataTypes.DATE,
    label: {
      type: DataTypes.CHAR(25),
      allowNull: false,
    },
    country: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
    city: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
    street: {
      type: DataTypes.CHAR(100),
      allowNull: false,
    },
    number: {
      type: DataTypes.CHAR(10),
    },
    user_id: {
      type: DataTypes.CHAR(100),
      allowNull: false,
    },
  },
  {
    tableName: "personalizedAdress",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Liaison avec les autres modèles
PersonalizedAdress.belongsTo(User, { targetKey: "id" });

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await PersonalizedAdress.sync({ force: false });
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

export default PersonalizedAdress;
