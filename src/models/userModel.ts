import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NOW,
  Sequelize,
} from "sequelize";
import bcrypt from "bcrypt";
const db = new Sequelize("handymoov", "admin", "admin", {
  host: "db",
  dialect: "mysql",
});

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare email: string;
  declare firstname: string;
  declare lastname: string;
  declare password: string;
  declare role: string;
}
User.init(
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

    firstname: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
    password: {
      // TODO mettre le char qui convient
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.CHAR(5),
      allowNull: false,
      defaultValue: "user",
      validate: {
        isIn: [["user", "admin"]],
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

// Hash avant de sauvegarder en base de données
User.addHook("beforeSave", async (user: User) => {
  try {
    // Valeur par défaut de l'algorithme de hashage : 10
    const algo = await bcrypt.genSalt(10);
    const hashPw = await bcrypt.hash(user.password, algo);
    user.password = hashPw;
  } catch (error) {
    throw new Error(error);
  }
});

// Synchronisation du modèle avec la base de données
(async () => {
  try {
    console.log(await User.sync({ force: false }));
    console.log("Modèle User synchronisé avec la base de données.");
  } catch (error) {
    console.error("Erreur lors de la synchronisation du modèle User:", error);
  }
})();

export default User;
