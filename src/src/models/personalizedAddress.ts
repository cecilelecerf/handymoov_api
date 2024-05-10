import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";

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
  declare country?: string;
  declare city?: string;
  declare street?: string;
  declare number?: string;
  declare user_id: number;
}
PersonalizedAddress.init(
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
      type: DataTypes.CHAR(25),
      allowNull: false,
    },
    country: {
      type: DataTypes.CHAR(50),
      allowNull: true,
    },
    city: {
      type: DataTypes.CHAR(50),
      allowNull: true,
    },
    street: {
      type: DataTypes.CHAR(100),
      allowNull: true,
    },
    number: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
  },
  {
    tableName: "personalizedAddress",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await PersonalizedAddress.sync({ force: false });
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation du modèle PersonalizedAddress:",
      error
    );
  }
})();

export default PersonalizedAddress;
