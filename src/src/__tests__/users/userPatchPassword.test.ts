import supertest from "supertest";
import { UserProps, loginUser, registerUser, user } from "./usersConst";
import createServer from "../../utils/server";
import User from "../../models/userModel";
import { Op } from "sequelize";

const app = createServer();

describe("PATCH PASSWORD /users/updatePassword", () => {
  let token: string;
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
  });
  afterEach(async () => {
    await User.destroy({ where: { email: { [Op.notLike]: "%test%" } } });
  });
  interface UserPasswordPatch {
    lastPassword: UserProps["password"];
    password: UserProps["password"];
    confirmPassword: UserProps["password"];
  }
  const newPassword = "poiu1@UA";
  const userPasswordPatch: UserPasswordPatch = {
    lastPassword: user["password"],
    password: newPassword,
    confirmPassword: newPassword,
  };

  it("should return 204 if update password success", async () => {
    const response = await supertest(app)
      .patch("/users/updatePassword")
      .set("authorization", token)
      .send(userPasswordPatch);
    expect(response.status).toBe(204);
  });

  describe("should return 400 if information is missing", () => {
    it("lastPassword is missing", async () => {
      const { lastPassword, ...inputUser } = userPasswordPatch;
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(inputUser);
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["lastPassword"],
        msg: "L'ancien mot de passe est obligatoire.",
      });
    });
    it("password is missing", async () => {
      const { password, ...inputUser } = userPasswordPatch;
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(inputUser);
      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe est obligatoire.",
      });
    });
  });
  describe("validate password", () => {
    it("should return 400 if password is less than 7 characters", async () => {
      const patchPassword = {
        ...userPasswordPatch,
        password: "Pas1@",
        confirmPassword: "Pas1@",
      };
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(patchPassword);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit comporter plus de 7 caractères.",
      });
    });

    it("should return 400 if password does not contain an uppercase letter", async () => {
      const patchPassword = {
        ...userPasswordPatch,
        password: "pass12@eefef",
        confirmPassword: "pass12@eefef",
      };
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(patchPassword);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins une majuscule.",
      });
    });

    it("should return 400 if password does not contain a lowercase letter", async () => {
      const patchPassword = {
        ...userPasswordPatch,
        password: "PASSWORD1!",
        confirmPassword: "PASSWORD1!",
      };
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(patchPassword);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins une minuscule.",
      });
    });

    it("should return 400 if password does not contain a number", async () => {
      const newPassword = "Password!";
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send({
          ...userPasswordPatch,
          password: newPassword,
          confirmPassword: newPassword,
        });

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins un chiffre.",
      });
    });

    it("should return 400 if password does not contain a special character", async () => {
      const newPassword = "Password1";
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send({
          ...userPasswordPatch,
          password: newPassword,
          confirmPassword: newPassword,
        });

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins un caractère spécial.",
      });
    });
  });
  it("Should return a 404 error if the current password is incorrect", async () => {
    const { statusCode, body } = await supertest(app)
      .patch("/users/updatePassword")
      .set("authorization", token)
      .send({ ...userPasswordPatch, lastPassword: "wrongPassword" });
    console.error(body);
    expect(statusCode).toBe(404);
    expect(body).toEqual({
      param: ["password"],
      msg: "Mot de passe incorrect.",
    });
  });
  it("Should return a 409 error if the password is different of confirmPassword", async () => {
    const response = await supertest(app)
      .patch("/users/updatePassword")
      .set("authorization", token)
      .send({ ...userPasswordPatch, confirmPassword: "192hfe@èZ" });
    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      param: ["confirmPassword"],
      msg: "Les mots de passe ne sont pas identiques.",
    });
  });
  it("Should return a 409 error if the password is similar of the lastPassword", async () => {
    const response = await supertest(app)
      .patch("/users/updatePassword")
      .set("authorization", token)
      .send({
        ...userPasswordPatch,
        password: user["password"],
        confirmPassword: user["password"],
      });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      param: ["password"],
      msg: "Le mot de passe est identique à l’ancien mot de passe",
    });
  });
});
