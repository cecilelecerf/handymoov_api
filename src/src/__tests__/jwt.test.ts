// import supertest from "supertest";
// import createServer from "../utils/server";
// import dotenv from "dotenv";

// dotenv.config();

// const app = createServer();

// describe("Middleware verifyToken", () => {
//   // Définir un utilisateur de test avec un jeton valide pour les tests
//   const testUser = {
//     id: 123,
//     role: "admin",
//   };

//   // Mock de la fonction verifyJWT pour simuler la vérification du token
//   jest.mock("jsonwebtoken", () => ({
//     verify: jest.fn().mockImplementation((token, secret, callback) => {
//       if (token === "valid_token") {
//         callback(null, testUser); // Utilisateur avec un jeton valide
//       } else {
//         callback(new Error("Invalid token"));
//       }
//     }),
//   }));

//   it("devrait retourner un message d'erreur avec le code 403 si le token est manquant", async () => {
//     const response = await supertest(app)
//       .get("/protected-route")
//       .set("Authorization", ""); // Pas de token

//     expect(response.status).toBe(403);
//     expect(response.body).toEqual({
//       message: "Accès interdit: token manquant",
//     });
//   });

//   it("devrait retourner un message d'erreur avec le code 403 si le token est invalide", async () => {
//     const response = await supertest(app)
//       .get("/protected-route")
//       .set("Authorization", "invalid_token"); // Token invalide

//     expect(response.status).toBe(403);
//     expect(response.body).toEqual({
//       message: "Accès interdit: token invalide",
//     });
//   });

//   it("devrait ajouter l'utilisateur au objet req si le token est valide", async () => {
//     const response = await supertest(app)
//       .get("/protected-route")
//       .set("Authorization", "valid_token"); // Token valide

//     // Vérifiez si l'utilisateur a été ajouté à l'objet req
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty("user");
//     expect(response.body.user).toEqual(testUser);
//   });
// });
