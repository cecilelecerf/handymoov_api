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

class Issue extends Model<
  InferAttributes<Issue>,
  InferCreationAttributes<Issue>
> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare label: string;
  declare gpsCoordinateLat: number;
  declare gpsCoordinateLgn: number;
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
      allowNull: false,
    },
    gpsCoordinateLgn: {
      type: DataTypes.DECIMAL(25, 20),
      allowNull: false,
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

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    await Issue.sync({ force: false });
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle Issue:", error);
  }
})();

export default Issue;
