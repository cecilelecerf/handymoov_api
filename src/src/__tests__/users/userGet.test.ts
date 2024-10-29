import supertest from "supertest";
import { Op } from "sequelize";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { loginUser, registerUser } from "./usersConst";

const app = createServer();

describe("User", () => {
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%Test%" } } });
  });

  describe("GET /users", () => {
    let token: string;
    beforeEach(async () => {
      await supertest(app).post("/users/register").send(registerUser);
      const loginRes = await supertest(app)
        .post("/users/login")
        .send(loginUser);
      token = loginRes.body.token;
    });
    it("should return 200 when get a user", async () => {
      const { statusCode, body } = await supertest(app)
        .get("/users")
        .set("authorization", `${token}`);
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
});
