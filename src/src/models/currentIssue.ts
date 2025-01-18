import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";
import Issue from "./issueModel";

const userDB = process.env.DB_USER;
const passwordDB = process.env.DB_PASSWORD;
const hostDB = process.env.DB_HOST;
const nameDB = process.env.DB_NAME;
const db = new Sequelize(nameDB, userDB, passwordDB, {
  host: hostDB,
  dialect: "mysql",
});
class CurrentIssue extends Model<
  InferAttributes<CurrentIssue>,
  InferCreationAttributes<CurrentIssue>
> {
  declare id: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare user_id: string;
  declare issue_id: string;
  declare actif: boolean;
}
CurrentIssue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    issue_id: {
      type: DataTypes.UUID,
      allowNull: false,
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

CurrentIssue.belongsTo(Issue, { foreignKey: "issue_id" });

export default CurrentIssue;
