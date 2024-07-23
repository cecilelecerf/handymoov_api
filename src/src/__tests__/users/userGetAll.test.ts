import supertest from "supertest";
import { loginUser, registerAdminUser, registerUser } from "./usersConst";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { Op } from "sequelize";

const app = createServer();

describe("GET /users/all", () => {
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });
  it("should return 200 and list of all users", async () => {
    await supertest(app).post("/users/register").send(registerUser);
    await supertest(app).post("/users/register").send(registerAdminUser);
    const adminLoginRes = await supertest(app).post("/users/login").send({
      email: registerAdminUser["email"],
      password: registerAdminUser["password"],
    });
    const { statusCode, body } = await supertest(app)
      .get("/users/all")
      .set("authorization", adminLoginRes.body.token);
    expect(statusCode).toBe(200);
    expect(body.length).toBeGreaterThan(0);
  });
});
