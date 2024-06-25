import supertest from "supertest";
import { UserProps, loginUser, registerUser, user } from "./usersConst";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { Op } from "sequelize";

const app = createServer();

describe("DELETE /users", () => {
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
  });
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });
  interface DeleteUserProps {
    password: UserProps["password"];
  }
  const deleteUser: DeleteUserProps = {
    password: user["password"],
  };
  let token: string;
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
  });
  it("should return 204 if delete user", async () => {
    const { statusCode } = await supertest(app)
      .post("/users/")
      .set("authorization", `${token}`)
      .send(deleteUser);

    expect(statusCode).toBe(204);
  });
});
