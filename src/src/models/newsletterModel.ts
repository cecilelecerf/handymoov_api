import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";
const db = new Sequelize("handymoov", "admin", "admin", {
  host: "db",
  dialect: "mysql",
});

class Newsletter extends Model<
  InferAttributes<Newsletter>,
  InferCreationAttributes<Newsletter>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare email: string;
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
    email: {
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

export default Newsletter;
