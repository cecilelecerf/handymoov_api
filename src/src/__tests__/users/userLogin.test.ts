import supertest from "supertest";
import { Op } from "sequelize";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { loginUser, registerUser } from "./usersConst";

const app = createServer();

describe("User POST /users/login", () => {
  let token: string;
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
  });
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%Test%" } } });
  });

  it("should return a token and 200 if email and password are correct", async () => {
    const { statusCode, body } = await supertest(app)
      .post("/users/login")
      .send(loginUser);
    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("token");
  });

  describe("should return 404 if email or password is wrong", () => {
    it("email is wrong", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/login")
        .send({
          email: "wrongEmail@gmail.com",
          password: registerUser.password,
        });
      expect(statusCode).toBe(404);
      expect(body).toEqual({
        param: ["email", "password"],
        msg: "Email ou mot de passe incorrect.",
      });
    });
    it("password is wrong", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/login")
        .send({ email: loginUser.email, password: "987" });
      expect(statusCode).toBe(404);
      expect(body).toEqual({
        param: ["email", "password"],
        msg: "Email ou mot de passe incorrect.",
      });
    });
  });
});
