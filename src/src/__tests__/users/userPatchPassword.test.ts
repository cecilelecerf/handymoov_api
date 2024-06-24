import supertest from "supertest";
import { UserProps, loginUser, registerUser, user } from "./usersConst";
import createServer from "../../utils/server";

const app = createServer();

describe("PATCH PASSWORD /users/updatePassword", () => {
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
  let token: string;
  beforeEach(async () => {
    await supertest(app).post("/users/register").send(registerUser);
    const loginRes = await supertest(app).post("/users/login").send(loginUser);
    token = loginRes.body.token;
  });
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
        param: ["password"],
        msg: "Le mot de passe est obligatoire.",
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
      const inputUser = {
        ...registerUser,
        password: "Pass1!",
        confirmPassword: "Pass1!",
      };
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit comporter plus de 7 caractères.",
      });
    });

    it("should return 400 if password does not contain an uppercase letter", async () => {
      const inputUser = {
        ...registerUser,
        password: "password1!",
        confirmPassword: "password1!",
      };
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(inputUser);

      expect(statusCode).toBe(400);
      expect(body).toEqual({
        param: ["password"],
        msg: "Le mot de passe doit contenir au moins une majuscule.",
      });
    });

    it("should return 400 if password does not contain a lowercase letter", async () => {
      const inputUser = {
        ...registerUser,
        password: "PASSWORD1!",
        confirmPassword: "PASSWORD1!",
      };
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(inputUser);

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
          ...registerUser,
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
          ...registerUser,
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
  it("Should return a 401 error if the current password is incorrect", async () => {
    const response = await supertest(app)
      .patch("/users/updatePassword")
      .set("authorization", token)
      .send({ ...userPasswordPatch, lastPassword: "wrongPassword" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
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
