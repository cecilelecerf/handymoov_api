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

const userDB = process.env.DB_USER;
const passwordDB = process.env.DB_PASSWORD;
const hostDB = process.env.DB_HOST;
const nameDB = process.env.DB_NAME;
const db = new Sequelize(nameDB, userDB, passwordDB, {
  host: hostDB,
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
  declare lat?: number;
  declare lng?: number;
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
    lat: {
      type: DataTypes.DECIMAL(25, 20),
      allowNull: true,
    },
    lng: {
      type: DataTypes.DECIMAL(25, 20),
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

export default PersonalizedAddress;
