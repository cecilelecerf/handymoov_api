import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";
import User from "./userModel";

import { DataTypes } from "sequelize";
const db = new Sequelize("handymoov", "admin", "admin", {
  host: "db",
  dialect: "mysql",
});

class PersonalizedAddress extends Model<
  InferAttributes<PersonalizedAddress>,
  InferCreationAttributes<PersonalizedAddress>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare label: string;
  declare country: string;
  declare city: string;
  declare street: string;
  declare number: string;
  declare user_id: CreationOptional<ForeignKey<User["id"]>>;
  // declare user_id: ForeignKey<User["id"]>;
}
PersonalizedAddress.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "personalizedAddress",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Liaison avec les autres modèles
PersonalizedAddress.belongsTo(User, { foreignKey: "user_id" });

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    console.log(await PersonalizedAddress.sync({ force: false }));
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

export default PersonalizedAddress;
