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
        id: expect.any(String),
        lastname: registerUser.lastname,
        modifiedAt: expect.any(String),
        password: expect.any(String),
        role: "user",
        updatedAt: expect.any(String),
        wheelchair: true,
        profilePicture: null,
        is2FAEnabled: false,
        isEmailVerified: true,
        twoFASecret: null,
      });
    });
  });
});
