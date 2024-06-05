import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";
import ObjectFeedback from "./objectFeedbackModel";
const db = new Sequelize("handymoov", "admin", "admin", {
  host: "db",
  dialect: "mysql",
});
class Feedback extends Model<
  InferAttributes<Feedback>,
  InferCreationAttributes<Feedback>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare object: string;
  declare title: string;
  declare description: string;
  declare user_id: number;
  declare read: boolean;
  declare hightPriority: boolean;
}
Feedback.init(
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
    object: {
      type: DataTypes.CHAR(100),
      allowNull: false,
    },
    title: {
      type: DataTypes.CHAR(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    hightPriority: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "feedbacks",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Liaison avec les autres modèles
Feedback.belongsTo(ObjectFeedback, { foreignKey: "object" });

export default Feedback;
