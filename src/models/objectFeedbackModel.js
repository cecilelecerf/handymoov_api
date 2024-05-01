// const { DataTypes } = require("sequelize");
// const { db } = require("../app");

// const ObjectFeedback = db.define(
//   "ObjectFeedback",
//   {
//     name: {
//       type: DataTypes.CHAR(50),
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
//   },
//   {
//     tableName: "objectFeedbacks",
//     timestamps: true,
//     underscored: true,
//   }
// );

// // Synchronisation du modèle avec la base de données
// (async () => {
//   try {
//     await ObjectFeedback.esync({ force: false });
//     console.log("Modèle User synchronisé avec la base de données.");
//   } catch (error) {
//     console.error("Erreur lors de la synchronisation du modèle User:", error);
//   }
// })();

// module.exports = ObjectFeedback;
