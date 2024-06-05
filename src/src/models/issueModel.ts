import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";

const userDB = process.env.DB_USER;
const passwordDB = process.env.DB_PASSWORD;
const hostDB = process.env.DB_HOST;
const nameDB = process.env.DB_NAME;
const db = new Sequelize(nameDB, userDB, passwordDB, {
  host: hostDB,
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
  declare gpsCoordinateLat: number;
  declare gpsCoordinateLng: number;
  declare actif: boolean;
  declare user_id: number;
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
      allowNull: false,
    },
    gpsCoordinateLat: {
      type: DataTypes.DECIMAL(25, 20),
    },
    gpsCoordinateLng: {
      type: DataTypes.DECIMAL(25, 20),
    },
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "issues",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

export default Issue;
