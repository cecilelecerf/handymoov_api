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
import PersonalizedAddress from "./personalizedAddress";
import Feedback from "./feedbackModel";
import Issue from "./issueModel";
import CurrentIssue from "./currentIssue";
import ObjectFeedback, {
  initializeDefaultObjectFeedbacks,
} from "./objectFeedbackModel";
import Newsletter from "./newsletterModel";

const userDB = process.env.DB_USER;
const passwordDB = process.env.DB_PASSWORD;
const hostDB = process.env.DB_HOST;
const nameDB = process.env.DB_NAME;
const db = new Sequelize(nameDB, userDB, passwordDB, {
  host: hostDB,
  dialect: "mysql",
});

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare modifiedAt: CreationOptional<Date>;
  declare email: string;
  declare firstname: string;
  declare lastname: string;
  declare birthday: Date;
  declare wheelchair: boolean;
  declare profilePicture: string;
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
      type: DataTypes.CHAR(70),
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
    birthday: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    wheelchair: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.CHAR(),
      allowNull: true,
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
// Liaison avec les autres modèles
PersonalizedAddress.belongsTo(User, { as: "User", foreignKey: "user_id" });
User.hasMany(PersonalizedAddress, {
  as: "PersonalizedAddress",
  onDelete: "cascade",
});
Feedback.belongsTo(User, { foreignKey: "user_id" });
Issue.belongsTo(User, { foreignKey: "user_id" });
CurrentIssue.belongsTo(User, { foreignKey: "user_id" });
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
    await User.sync({ force: false });
    await PersonalizedAddress.sync({ force: false });
    await Issue.sync({ force: false });
    await CurrentIssue.sync({ force: false });
    await ObjectFeedback.sync({ force: false });
    await Feedback.sync({ force: false });
    await Newsletter.sync({ force: false });
    await initializeDefaultObjectFeedbacks(); // Appelez la fonction d'initialisation après la connexion à la base de données
  } catch (error) {
    console.error("Erreur lors de la synchronisation des models", error);
  }
})();

export default User;
