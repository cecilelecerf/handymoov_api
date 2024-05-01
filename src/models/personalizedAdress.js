// const { DataTypes } = require("sequelize");
// const { db } = require("../app");

// const PersonalizedAdress = db.define(
//   "PersonalizedAdress",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       default: DataTypes.NOW,
//     },
//     modifiedAt: {
//       type: DataTypes.DATE,
//       default: DataTypes.NOW,
//     },
//     name: {
//       type: DataTypes.CHAR(100),
//       allowNull: false,
//     },
//     city: {
//       type: DataTypes.VARCHAR(200),
//       allowNull: false,
//     },
//     street: {
//       type: DataTypes.VARCHAR(200),
//       allowNull: false,
//     },
//     country: {
//       type: DataTypes.VARCHAR(200),
//       allowNull: false,
//     },
//     user_mail: {
//       type: DataTypes.CHAR(100),
//       allowNull: false,
//     },
//   },
//   {
//     tableName: "personalizedAdress",
//     timestamps: true,
//     underscored: true,
//   }
// );

// const DefaultPersonalizedAdress = require("./defaultPersonalizedAdressModel.js");
// PersonalizedAdress.belongsTo(DefaultPersonalizedAdress, {
//   foreignKey: "object",
// });

// // Synchronisation du modèle avec la base de données
// (async () => {
//   try {
//     await PersonalizedAdress.esync({ force: false });
//     console.log("Modèle User synchronisé avec la base de données.");
//   } catch (error) {
//     console.error("Erreur lors de la synchronisation du modèle User:", error);
//   }
// })();

// module.exports = PersonalizedAdress;
