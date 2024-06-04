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

class ObjectFeedback extends Model<
  InferAttributes<ObjectFeedback>,
  InferCreationAttributes<ObjectFeedback>
> {
  declare label: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare icon: string;
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
    icon: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
  },
  {
    tableName: "objectFeedbacks",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

const defaultObjectFeedbacks = [
  { label: "Typographies", icon: "car-outline" },
  { label: "Boutons", icon: "car-outline" },
  { label: "Problèmes technique", icon: "car-outline" },
  { label: "Navigation", icon: "car-outline" },
  { label: "Sons et images", icon: "car-outline" },
  { label: "Accessibilité", icon: "car-outline" },
  { label: "Performance", icon: "car-outline" },
  { label: "Compatibilité", icon: "car-outline" },
  { label: "Sécurité", icon: "car-outline" },
];

export const initializeDefaultObjectFeedbacks = async () => {
  for (const object of defaultObjectFeedbacks) {
    const [created] = await ObjectFeedback.findOrCreate({
      where: { label: object.label },
      defaults: {
        label: object.label,
        icon: object.icon,
      },
    });

    if (created) {
      console.log(`Created default object: ${object.label}`);
    }
  }
};

export default ObjectFeedback;
