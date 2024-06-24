import supertest from "supertest";
import { Op } from "sequelize";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { loginUser, registerUser } from "./usersConst";

const app = createServer();

describe("User POST /users/login", () => {
  beforeAll(async () => {
    await supertest(app).post("/users/register").send(registerUser);
  });
  afterAll(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%Test%" } } });
  });

  it("should return a token and 200 if email and password are correct", async () => {
    const { statusCode, body } = await supertest(app)
      .post("/users/login")
      .send(loginUser);
    console.log("lala");
    console.error(body);
    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("token");
  });

  describe("should return 401 if email or password is wrong", () => {
    it("email is wrong", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/login")
        .send({
          email: "wrongEmail@gmail.com",
          password: registerUser.password,
        });
      expect(statusCode).toBe(401);
      expect(body).toEqual({
        param: ["email", "password"],
        msg: "Email ou mot de passe incorrect.",
      });
    });
    it("password is wrong", async () => {
      const { statusCode, body } = await supertest(app)
        .post("/users/login")
        .send({ email: registerUser.email, password: "987" });
      expect(statusCode).toBe(401);
      expect(body).toEqual({
        param: ["email", "password"],
        msg: "Email ou mot de passe incorrect.",
      });
    });
  });
});
