import supertest from "supertest";
import User from "../models/userModel";
import { loginUser, registerUser } from "./users/usersConst";
import { Op } from "sequelize";
import createServer from "../utils/server";
const app = createServer();

describe("JWT", () => {
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });
  describe("Middleware jwtMiddlewares.isConnect", () => {
    it("should return an error message with code 401 if the token is missing", async () => {
      const response = await supertest(app)
        .get("/users")
        .set("authorization", ""); // Pas de token

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        msg: "Accès interdit: token manquant",
      });
    });

    it("should return an error message with code 401 if the token is invalid", async () => {
      const response = await supertest(app)
        .get("/users")
        .set("authorization", "invalid_token"); // Token invalide

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        msg: "Accès interdit: token invalide",
      });
    });

    it("should add the user to the req object if the token is valid", async () => {
      await supertest(app).post("/users/register").send(registerUser);
      const loginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);
      const token = loginRes.body.token;
      const { statusCode, body } = await supertest(app)
        .get("/users")
        .set("authorization", token);

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        birthday: "2001-07-22T00:00:00.000Z",
        createdAt: expect.any(String),
        email: registerUser.email,
        firstname: registerUser.firstname,
        id: expect.any(Number),
        lastname: registerUser.lastname,
        modifiedAt: expect.any(String),
        password: expect.any(String),
        role: "user",
        updatedAt: expect.any(String),
        wheelchair: true,
        profilePicture: null,
      });
    });
  });

  // describe("Middleware isAdmin", () => {
  //   it("should return an error message with code 401 if the token is missing", async () => {
  //     const response = await supertest(app)
  //       .get("/users/all")
  //       .set("authorization", ""); // Pas de token

  //     expect(response.status).toBe(401);
  //     expect(response.body).toEqual({
  //       msg: "Accès interdit: token manquant",
  //     });
  //   });

  //   it("should return an error message with code 401 if the token is invalid", async () => {
  //     const response = await supertest(app)
  //       .get("/users/all")
  //       .set("authorization", "invalid_token"); // Pas de token

  //     expect(response.status).toBe(401);
  //     expect(response.body).toEqual({
  //       msg: "Accès interdit: token invalide",
  //     });
  //   });

  //   it("should return an error message with code 403 if the user is not admin", async () => {
  //     await supertest(app).post("/users/register").send(registerUser);
  //     const loginRes = await supertest(app)
  //       .post("/users/login")
  //       .send(loginUser);
  //     const token = loginRes.body.token;
  //     const { statusCode, body } = await supertest(app)
  //       .get("/users/all")
  //       .set("authorization", token);

  //     expect(statusCode).toBe(403);
  //     expect(body).toEqual({
  //       msg: "Accès interdit: rôle administrateur requis",
  //     });
  //   });

  //   it("should allow access if user is admin", async () => {
  //     await supertest(app).post("/users/register").send(registerAdminUser);
  //     const loginRes = await supertest(app)
  //       .post("/users/login")
  //       .send(loginAdminUser);
  //     const token = loginRes.body.token;
  //     const { statusCode } = await supertest(app)
  //       .get("/users/all")
  //       .set("authorization", token);
  //     expect(statusCode).toBe(200);
  //   });
  // });
});
