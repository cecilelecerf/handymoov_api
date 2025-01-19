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
    lastPassword: "Aa1&azaP",
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
    it("password is missing", async () => {
      const { password, ...inputUser } = userPasswordPatch;
      const { statusCode, body } = await supertest(app)
        .patch("/users/updatePassword")
        .set("authorization", token)
        .send(inputUser);
      expect(statusCode).toBe(400);
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins 8 caractères.",
          path: "password",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins un chiffre.",
          path: "password",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins une lettre.",
          path: "password",
          type: "field",
          value: "",
        },

        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins une lettre majuscule",
          path: "password",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins une lettre minuscule",
          path: "password",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins un caractère spécial",
          path: "password",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Les mots de passe ne correspondent pas.",
          path: "confirmPassword",
          type: "field",
          value: "poiu1@UA",
        },
      ]);
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
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins 8 caractères.",
          path: "password",
          type: "field",
          value: "Pas1@",
        },
      ]);
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
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins une lettre majuscule",
          path: "password",
          type: "field",
          value: "pass12@eefef",
        },
      ]);
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
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins une lettre minuscule",
          path: "password",
          type: "field",
          value: "PASSWORD1!",
        },
      ]);
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
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins un chiffre.",
          path: "password",
          type: "field",
          value: "Password!",
        },
      ]);
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
      expect(body.errors).toEqual([
        {
          location: "body",
          msg: "Le mot de passe doit contenir au moins un caractère spécial",
          path: "password",
          type: "field",
          value: "Password1",
        },
      ]);
    });
  });

  it("Should return a 409 error if the password is different of confirmPassword", async () => {
    const response = await supertest(app)
      .patch("/users/updatePassword")
      .set("authorization", token)
      .send({ ...userPasswordPatch, confirmPassword: "192hfe@èZ" });
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      {
        location: "body",
        msg: "Les mots de passe ne correspondent pas.",
        path: "confirmPassword",
        type: "field",
        value: "192hfe@èZ",
      },
    ]);
  });
});
